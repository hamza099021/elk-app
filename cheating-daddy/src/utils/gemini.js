const { GoogleGenAI } = require('@google/genai');
const { BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const { saveDebugAudio } = require('../audioUtils');
const { getSystemPrompt } = require('./prompts');

// Model configuration - stable models only
// Note: gemini-2.5-flash-native-audio-latest is audio-ONLY (rejects text input)
// Using gemini-2.0-flash-exp for listen mode as it supports both audio AND text
const MODELS = {
    listen: {
        primary: 'gemini-2.0-flash-exp', // Supports both audio streaming AND text input
        fallback: 'gemini-2.0-flash-exp', // Same model as fallback (most stable for live)
    },
    capture: {
        primary: 'gemini-2.5-flash', // For REST API vision queries
        fallback: 'gemini-2.0-flash-exp', // Fallback if primary fails
    },
};

// Active feature and session management
let activeFeature = null; // 'listen' | 'capture' | null
let liveSessionRef = null; // For WebSocket live sessions (listening)
let restClientRef = null; // For REST API queries (capture)
let currentRestModel = null; // Track which REST model is active
let currentLiveModel = null; // Track which live model is active

// Conversation tracking variables
let currentSessionId = null;
let currentTranscription = '';
let conversationHistory = [];
let isInitializingSession = false;

function formatSpeakerResults(results) {
    let text = '';
    for (const result of results) {
        if (result.transcript && result.speakerId) {
            const speakerLabel = result.speakerId === 1 ? 'Interviewer' : 'Candidate';
            text += `[${speakerLabel}]: ${result.transcript}\n`;
        }
    }
    return text;
}

module.exports.formatSpeakerResults = formatSpeakerResults;

// Audio capture variables
let systemAudioProc = null;
let messageBuffer = '';

// Reconnection tracking variables
let reconnectionAttempts = 0;
let maxReconnectionAttempts = 3;
let reconnectionDelay = 2000; // 2 seconds between attempts
let lastSessionParams = null;

function sendToRenderer(channel, data) {
    const windows = BrowserWindow.getAllWindows();
    console.log(`[sendToRenderer] Channel: ${channel}, Windows count: ${windows.length}`);
    
    // Send to all windows - main window will filter, child windows will display
    for (const win of windows) {
        if (!win.isDestroyed()) {
            win.webContents.send(channel, data);
        }
    }
    
    // Also send capture-response-update to capture window if this is an update-response
    if (channel === 'update-response') {
        for (const win of windows) {
            if (!win.isDestroyed()) {
                win.webContents.send('capture-response-update', data);
                win.webContents.send('listen-response-update', data);
            }
        }
    }
}

// Conversation management functions
function initializeNewSession() {
    currentSessionId = Date.now().toString();
    currentTranscription = '';
    conversationHistory = [];
    console.log('New conversation session started:', currentSessionId);
}

function saveConversationTurn(transcription, aiResponse) {
    if (!currentSessionId) {
        initializeNewSession();
    }

    const conversationTurn = {
        timestamp: Date.now(),
        transcription: transcription.trim(),
        ai_response: aiResponse.trim(),
    };

    conversationHistory.push(conversationTurn);
    console.log('Saved conversation turn:', conversationTurn);

    // Send to renderer to save in IndexedDB
    sendToRenderer('save-conversation-turn', {
        sessionId: currentSessionId,
        turn: conversationTurn,
        fullHistory: conversationHistory,
    });
}

function getCurrentSessionData() {
    return {
        sessionId: currentSessionId,
        history: conversationHistory,
    };
}

async function sendReconnectionContext() {
    if (!global.geminiSessionRef?.current || conversationHistory.length === 0) {
        return;
    }
    
    // Skip sending text context to native audio models (they reject text input)
    if (currentLiveModel && currentLiveModel.includes('native-audio')) {
        console.log('Skipping text context for native audio model');
        return;
    }

    try {
        // Gather all transcriptions from the conversation history
        const transcriptions = conversationHistory
            .map(turn => turn.transcription)
            .filter(transcription => transcription && transcription.trim().length > 0);

        if (transcriptions.length === 0) {
            return;
        }

        // Create the context message
        const contextMessage = `Till now all these questions were asked in the interview, answer the last one please:\n\n${transcriptions.join(
            '\n'
        )}`;

        console.log('Sending reconnection context with', transcriptions.length, 'previous questions');

        // Send the context message to the new session
        await global.geminiSessionRef.current.sendRealtimeInput({
            text: contextMessage,
        });
    } catch (error) {
        console.error('Error sending reconnection context:', error);
    }
}

// Close any active session when switching features
async function closeActiveSession() {
    console.log('Closing active session. Current feature:', activeFeature);
    
    // Stop macOS audio capture if running
    stopMacOSAudioCapture();
    
    // Clear session params to prevent reconnection
    lastSessionParams = null;
    
    // Close live session if exists
    if (liveSessionRef) {
        try {
            await liveSessionRef.close();
            console.log('Live session closed');
        } catch (error) {
            console.error('Error closing live session:', error);
        }
        liveSessionRef = null;
    }
    
    // Clear REST client reference
    restClientRef = null;
    currentRestModel = null;
    currentLiveModel = null;
    
    // Reset global ref
    if (global.geminiSessionRef) {
        global.geminiSessionRef.current = null;
    }
    
    activeFeature = null;
    console.log('All sessions closed');
}

// Initialize REST client for capture feature (vision queries)
async function initializeCaptureClient(apiKey, customPrompt = '', profile = 'interview') {
    console.log('Initializing capture REST client...');
    
    // Close any existing session
    if (activeFeature && activeFeature !== 'capture') {
        console.log(`Switching from ${activeFeature} to capture, closing existing session...`);
        await closeActiveSession();
    }
    
    activeFeature = 'capture';
    
    // Get enabled tools
    const enabledTools = await getEnabledTools();
    const googleSearchEnabled = enabledTools.some(tool => tool.googleSearch);
    const systemPrompt = getSystemPrompt(profile, customPrompt, googleSearchEnabled);
    
    // Try primary model first
    const modelConfig = MODELS.capture;
    let modelToUse = modelConfig.primary;
    
    try {
        const client = new GoogleGenAI({ apiKey: apiKey });
        
        restClientRef = { client, modelName: modelToUse, systemPrompt, apiKey };
        currentRestModel = modelToUse;
        console.log(`Capture client initialized with model: ${modelToUse}`);
        return true;
    } catch (error) {
        console.error(`Failed to initialize capture client with ${modelToUse}:`, error);
        
        // Try fallback
        if (modelToUse !== modelConfig.fallback) {
            console.log(`Trying fallback model: ${modelConfig.fallback}`);
            try {
                const client = new GoogleGenAI({ apiKey: apiKey });
                
                restClientRef = { client, modelName: modelConfig.fallback, systemPrompt, apiKey };
                currentRestModel = modelConfig.fallback;
                console.log(`Capture client initialized with fallback model: ${modelConfig.fallback}`);
                return true;
            } catch (fallbackError) {
                console.error('Fallback model also failed:', fallbackError);
            }
        }
        
        return false;
    }
}

// Send capture query using REST API with streaming for word-by-word animation
async function sendCaptureQuery(text, imageData = null) {
    if (!restClientRef) {
        return { success: false, error: 'Capture client not initialized' };
    }
    
    try {
        const { client, modelName, systemPrompt } = restClientRef;
        
        // Build content parts
        const contents = [];
        
        // Add system instruction as first user message context
        if (systemPrompt) {
            contents.push({
                role: 'user',
                parts: [{ text: `System: ${systemPrompt}\n\nNow respond to the following:` }],
            });
        }
        
        // Build user message parts
        const userParts = [];
        
        // Add image if provided
        if (imageData) {
            userParts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageData,
                },
            });
        }
        
        // Add text query
        userParts.push({ text: text });
        
        contents.push({
            role: 'user',
            parts: userParts,
        });
        
        console.log('Sending capture query:', text.substring(0, 100) + '...');
        sendToRenderer('update-status', 'Processing...');
        
        // Use streaming for word-by-word animation via models.generateContentStream
        const streamResult = await client.models.generateContentStream({
            model: modelName,
            contents: contents,
        });
        
        let fullResponse = '';
        let wordBuffer = '';
        
        // Process stream chunks for word-by-word effect
        for await (const chunk of streamResult) {
            // Extract text from the chunk
            const chunkText = chunk.text || 
                (chunk.candidates?.[0]?.content?.parts?.[0]?.text) || 
                '';
            
            if (chunkText) {
                wordBuffer += chunkText;
                
                // Send updates as words complete (on spaces/punctuation)
                const words = wordBuffer.split(/(?<=\s)/);
                if (words.length > 1) {
                    // We have complete words
                    const completeText = words.slice(0, -1).join('');
                    fullResponse += completeText;
                    wordBuffer = words[words.length - 1]; // Keep incomplete part
                    
                    sendToRenderer('update-response', fullResponse);
                    
                    // Small delay for smoother animation
                    await new Promise(resolve => setTimeout(resolve, 15));
                }
            }
        }
        
        // Send any remaining buffer
        if (wordBuffer) {
            fullResponse += wordBuffer;
            sendToRenderer('update-response', fullResponse);
        }
        
        // Save conversation turn
        if (text && fullResponse) {
            saveConversationTurn(text, fullResponse);
        }
        
        sendToRenderer('update-status', 'Ready');
        console.log('Capture query completed');
        
        return { success: true, response: fullResponse };
    } catch (error) {
        console.error('Error in capture query:', error);
        sendToRenderer('update-status', 'Error: ' + error.message);
        
        // Try fallback model if primary failed
        const modelConfig = MODELS.capture;
        if (currentRestModel !== modelConfig.fallback) {
            console.log('Attempting fallback for capture query...');
            try {
                restClientRef.modelName = modelConfig.fallback;
                currentRestModel = modelConfig.fallback;
                
                // Retry with fallback
                return await sendCaptureQuery(text, imageData);
            } catch (fallbackError) {
                console.error('Fallback query also failed:', fallbackError);
            }
        }
        
        return { success: false, error: error.message };
    }
}

async function getEnabledTools() {
    const tools = [];

    // Check if Google Search is enabled (default: true)
    const googleSearchEnabled = await getStoredSetting('googleSearchEnabled', 'true');
    console.log('Google Search enabled:', googleSearchEnabled);

    if (googleSearchEnabled === 'true') {
        tools.push({ googleSearch: {} });
        console.log('Added Google Search tool');
    } else {
        console.log('Google Search tool disabled');
    }

    return tools;
}

async function getStoredSetting(key, defaultValue) {
    try {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
            // Wait a bit for the renderer to be ready
            await new Promise(resolve => setTimeout(resolve, 100));

            // Try to get setting from renderer process localStorage
            const value = await windows[0].webContents.executeJavaScript(`
                (function() {
                    try {
                        if (typeof localStorage === 'undefined') {
                            console.log('localStorage not available yet for ${key}');
                            return '${defaultValue}';
                        }
                        const stored = localStorage.getItem('${key}');
                        console.log('Retrieved setting ${key}:', stored);
                        return stored || '${defaultValue}';
                    } catch (e) {
                        console.error('Error accessing localStorage for ${key}:', e);
                        return '${defaultValue}';
                    }
                })()
            `);
            return value;
        }
    } catch (error) {
        console.error('Error getting stored setting for', key, ':', error.message);
    }
    console.log('Using default value for', key, ':', defaultValue);
    return defaultValue;
}

async function attemptReconnection() {
    if (!lastSessionParams || reconnectionAttempts >= maxReconnectionAttempts) {
        console.log('Max reconnection attempts reached or no session params stored');
        sendToRenderer('update-status', 'Session closed');
        return false;
    }

    reconnectionAttempts++;
    console.log(`Attempting reconnection ${reconnectionAttempts}/${maxReconnectionAttempts}...`);

    // Wait before attempting reconnection
    await new Promise(resolve => setTimeout(resolve, reconnectionDelay));

    try {
        const session = await initializeGeminiSession(
            lastSessionParams.apiKey,
            lastSessionParams.customPrompt,
            lastSessionParams.profile,
            lastSessionParams.language,
            true // isReconnection flag
        );

        if (session && global.geminiSessionRef) {
            global.geminiSessionRef.current = session;
            reconnectionAttempts = 0; // Reset counter on successful reconnection
            console.log('Live session reconnected');

            // Send context message with previous transcriptions
            await sendReconnectionContext();

            return true;
        }
    } catch (error) {
        console.error(`Reconnection attempt ${reconnectionAttempts} failed:`, error);
    }

    // If this attempt failed, try again
    if (reconnectionAttempts < maxReconnectionAttempts) {
        return attemptReconnection();
    } else {
        console.log('All reconnection attempts failed');
        sendToRenderer('update-status', 'Session closed');
        return false;
    }
}

async function initializeGeminiSession(apiKey, customPrompt = '', profile = 'interview', language = 'en-US', isReconnection = false, featureMode = 'listen') {
    if (isInitializingSession) {
        console.log('Session initialization already in progress');
        return false;
    }

    isInitializingSession = true;
    sendToRenderer('session-initializing', true);
    
    // Close any existing session when switching features
    if (!isReconnection && activeFeature && activeFeature !== featureMode) {
        console.log(`Switching from ${activeFeature} to ${featureMode}, closing existing session...`);
        await closeActiveSession();
    }
    
    activeFeature = featureMode;
    console.log(`Initializing ${featureMode} session...`);

    // Store session parameters for reconnection (only if not already reconnecting)
    if (!isReconnection) {
        lastSessionParams = {
            apiKey,
            customPrompt,
            profile,
            language,
            featureMode,
        };
        reconnectionAttempts = 0; // Reset counter for new session
    }

    const client = new GoogleGenAI({
        vertexai: false,
        apiKey: apiKey,
    });

    // Get enabled tools first to determine Google Search status
    const enabledTools = await getEnabledTools();
    const googleSearchEnabled = enabledTools.some(tool => tool.googleSearch);

    const systemPrompt = getSystemPrompt(profile, customPrompt, googleSearchEnabled);

    // Initialize new conversation session (only if not reconnecting)
    if (!isReconnection) {
        initializeNewSession();
    }
    
    // Select model based on feature mode
    const modelConfig = MODELS[featureMode] || MODELS.listen;
    let modelToUse = modelConfig.primary;
    
    console.log(`Using ${featureMode} model: ${modelToUse}`);

    try {
        const session = await client.live.connect({
            model: modelToUse,
            callbacks: {
                onopen: function () {
                    sendToRenderer('update-status', 'Live session connected');
                },
                onmessage: function (message) {
                    console.log('----------------', message);

                    if (message.serverContent?.inputTranscription?.results) {
                        currentTranscription += formatSpeakerResults(message.serverContent.inputTranscription.results);
                    }

                    // Handle AI model response
                    if (message.serverContent?.modelTurn?.parts) {
                        for (const part of message.serverContent.modelTurn.parts) {
                            console.log(part);
                            if (part.text) {
                                messageBuffer += part.text;
                                sendToRenderer('update-response', messageBuffer);
                            }
                        }
                    }

                    if (message.serverContent?.generationComplete) {
                        sendToRenderer('update-response', messageBuffer);

                        // Save conversation turn when we have both transcription and AI response
                        if (currentTranscription && messageBuffer) {
                            saveConversationTurn(currentTranscription, messageBuffer);
                            currentTranscription = ''; // Reset for next turn
                        }

                        messageBuffer = '';
                    }

                    if (message.serverContent?.turnComplete) {
                        sendToRenderer('update-status', 'Listening...');
                    }
                },
                onerror: function (e) {
                    console.debug('Error:', e.message);

                    // Check if the error is fatal and should NOT trigger reconnection
                    const isFatalError =
                        e.message &&
                        (e.message.includes('API key not valid') ||
                            e.message.includes('invalid API key') ||
                            e.message.includes('authentication failed') ||
                            e.message.includes('unauthorized') ||
                            e.message.includes('not found') ||
                            e.message.includes('NOT_FOUND') ||
                            e.message.includes('is not supported') ||
                            e.message.includes('does not exist'));

                    if (isFatalError) {
                        console.log('Fatal error - stopping reconnection attempts:', e.message);
                        lastSessionParams = null; // Clear session params to prevent reconnection
                        reconnectionAttempts = maxReconnectionAttempts; // Stop further attempts
                        sendToRenderer('update-status', 'Error: ' + e.message);
                        return;
                    }

                    sendToRenderer('update-status', 'Error: ' + e.message);
                },
                onclose: function (e) {
                    console.debug('Session closed:', e.reason);

                    // Check if the session closed due to a fatal error
                    const isFatalError =
                        e.reason &&
                        (e.reason.includes('API key not valid') ||
                            e.reason.includes('invalid API key') ||
                            e.reason.includes('authentication failed') ||
                            e.reason.includes('unauthorized') ||
                            e.reason.includes('not found') ||
                            e.reason.includes('NOT_FOUND') ||
                            e.reason.includes('is not supported') ||
                            e.reason.includes('does not exist'));

                    if (isFatalError) {
                        console.log('Session closed due to fatal error - stopping reconnection attempts:', e.reason);
                        lastSessionParams = null; // Clear session params to prevent reconnection
                        reconnectionAttempts = maxReconnectionAttempts; // Stop further attempts
                        sendToRenderer('update-status', 'Error: ' + e.reason);
                        return;
                    }

                    // Attempt automatic reconnection for server-side closures
                    if (lastSessionParams && reconnectionAttempts < maxReconnectionAttempts) {
                        console.log('Attempting automatic reconnection...');
                        attemptReconnection();
                    } else {
                        sendToRenderer('update-status', 'Session closed');
                    }
                },
            },
            config: {
                responseModalities: ['TEXT'],
                tools: enabledTools,
                // Enable speaker diarization
                inputAudioTranscription: {
                    enableSpeakerDiarization: true,
                    minSpeakerCount: 2,
                    maxSpeakerCount: 2,
                },
                contextWindowCompression: { slidingWindow: {} },
                speechConfig: { languageCode: language },
                systemInstruction: {
                    parts: [{ text: systemPrompt }],
                },
            },
        });

        isInitializingSession = false;
        sendToRenderer('session-initializing', false);
        liveSessionRef = session;
        currentLiveModel = modelToUse;
        console.log(`Live session established with model: ${modelToUse}`);
        return session;
    } catch (error) {
        console.error(`Failed to initialize Gemini session with ${modelToUse}:`, error);
        
        // Try fallback model if primary failed
        const modelConfig = MODELS[featureMode] || MODELS.listen;
        if (modelToUse !== modelConfig.fallback) {
            console.log(`Trying fallback model: ${modelConfig.fallback}`);
            sendToRenderer('update-status', `Primary model unavailable, trying fallback...`);
            
            try {
                const fallbackSession = await client.live.connect({
                    model: modelConfig.fallback,
                    callbacks: {
                        onopen: function () {
                            sendToRenderer('update-status', 'Live session connected (fallback)');
                        },
                        onmessage: function (message) {
                            console.log('----------------', message);

                            if (message.serverContent?.inputTranscription?.results) {
                                currentTranscription += formatSpeakerResults(message.serverContent.inputTranscription.results);
                            }

                            if (message.serverContent?.modelTurn?.parts) {
                                for (const part of message.serverContent.modelTurn.parts) {
                                    console.log(part);
                                    if (part.text) {
                                        messageBuffer += part.text;
                                        sendToRenderer('update-response', messageBuffer);
                                    }
                                }
                            }

                            if (message.serverContent?.generationComplete) {
                                sendToRenderer('update-response', messageBuffer);
                                if (currentTranscription && messageBuffer) {
                                    saveConversationTurn(currentTranscription, messageBuffer);
                                    currentTranscription = '';
                                }
                                messageBuffer = '';
                            }

                            if (message.serverContent?.turnComplete) {
                                sendToRenderer('update-status', 'Listening...');
                            }
                        },
                        onerror: function (e) {
                            console.debug('Fallback Error:', e.message);
                            sendToRenderer('update-status', 'Error: ' + e.message);
                        },
                        onclose: function (e) {
                            console.debug('Fallback session closed:', e.reason);
                            sendToRenderer('update-status', 'Session closed');
                        },
                    },
                    config: {
                        responseModalities: ['TEXT'],
                        tools: enabledTools,
                        inputAudioTranscription: {
                            enableSpeakerDiarization: true,
                            minSpeakerCount: 2,
                            maxSpeakerCount: 2,
                        },
                        contextWindowCompression: { slidingWindow: {} },
                        speechConfig: { languageCode: language },
                        systemInstruction: {
                            parts: [{ text: systemPrompt }],
                        },
                    },
                });
                
                isInitializingSession = false;
                sendToRenderer('session-initializing', false);
                liveSessionRef = fallbackSession;
                currentLiveModel = modelConfig.fallback;
                console.log(`Fallback session established with model: ${modelConfig.fallback}`);
                return fallbackSession;
            } catch (fallbackError) {
                console.error('Fallback model also failed:', fallbackError);
            }
        }
        
        isInitializingSession = false;
        sendToRenderer('session-initializing', false);
        return null;
    }
}

function killExistingSystemAudioDump() {
    return new Promise(resolve => {
        console.log('Checking for existing SystemAudioDump processes...');

        // Kill any existing SystemAudioDump processes
        const killProc = spawn('pkill', ['-f', 'SystemAudioDump'], {
            stdio: 'ignore',
        });

        killProc.on('close', code => {
            if (code === 0) {
                console.log('Killed existing SystemAudioDump processes');
            } else {
                console.log('No existing SystemAudioDump processes found');
            }
            resolve();
        });

        killProc.on('error', err => {
            console.log('Error checking for existing processes (this is normal):', err.message);
            resolve();
        });

        // Timeout after 2 seconds
        setTimeout(() => {
            killProc.kill();
            resolve();
        }, 2000);
    });
}

async function startMacOSAudioCapture(geminiSessionRef) {
    if (process.platform !== 'darwin') return false;

    // Kill any existing SystemAudioDump processes first
    await killExistingSystemAudioDump();

    console.log('Starting macOS audio capture with SystemAudioDump...');

    const { app } = require('electron');
    const path = require('path');
    const os = require('os');

    let systemAudioPath;
    if (app.isPackaged) {
        systemAudioPath = path.join(process.resourcesPath, 'SystemAudioDump');
    } else {
        systemAudioPath = path.join(__dirname, '../assets', 'SystemAudioDump');
    }

    console.log('SystemAudioDump path:', systemAudioPath);

    // Detect system architecture
    const systemArch = os.arch(); // 'arm64' or 'x64'
    console.log('System architecture:', systemArch);

    // Check binary architecture using 'file' command
    let binaryArch = 'arm64'; // Default assumption (the current binary is arm64)
    try {
        const { execSync } = require('child_process');
        const fileOutput = execSync(`file "${systemAudioPath}"`, { encoding: 'utf8' });
        if (fileOutput.includes('x86_64')) {
            binaryArch = 'x64';
        } else if (fileOutput.includes('arm64')) {
            binaryArch = 'arm64';
        }
        console.log('Binary architecture:', binaryArch);
    } catch (err) {
        console.warn('Could not detect binary architecture:', err.message);
    }

    // Spawn SystemAudioDump with stealth options
    const spawnOptions = {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
            ...process.env,
            // Set environment variables that might help with stealth
            PROCESS_NAME: 'AudioService',
            APP_NAME: 'System Audio Service',
        },
    };

    // On macOS, apply additional stealth measures
    if (process.platform === 'darwin') {
        spawnOptions.detached = false;
        spawnOptions.windowsHide = false;
    }

    // Determine if we need architecture translation
    let spawnCommand = systemAudioPath;
    let spawnArgs = [];

    if (systemArch === 'x64' && binaryArch === 'arm64') {
        // Intel Mac trying to run ARM binary - NOT POSSIBLE
        // Rosetta only works the other way (ARM Mac running x64 binary)
        console.error('ERROR: Cannot run ARM binary on Intel Mac');
        console.error('You need an x86_64 version of SystemAudioDump for Intel Macs');
        console.error('Current workaround: This will fail, but the app will continue without audio capture');
        // We'll attempt to spawn anyway and let it fail gracefully
    } else if (systemArch === 'arm64' && binaryArch === 'x64') {
        // ARM Mac trying to run Intel binary - use Rosetta 2
        console.log('ARM Mac detected with Intel binary - using Rosetta 2 translation');
        spawnCommand = 'arch';
        spawnArgs = ['-x86_64', systemAudioPath];
    } else if (systemArch === 'arm64' && binaryArch === 'arm64') {
        // ARM Mac with ARM binary - perfect match
        console.log('ARM Mac with ARM binary - running natively');
    } else if (systemArch === 'x64' && binaryArch === 'x64') {
        // Intel Mac with Intel binary - perfect match
        console.log('Intel Mac with Intel binary - running natively');
    } else {
        // Unknown combination
        console.warn('Unknown architecture combination, attempting direct execution');
    }

    systemAudioProc = spawn(spawnCommand, spawnArgs, spawnOptions);

    if (!systemAudioProc.pid) {
        console.error('Failed to start SystemAudioDump');
        return false;
    }

    console.log('SystemAudioDump started with PID:', systemAudioProc.pid);

    const CHUNK_DURATION = 0.1;
    const SAMPLE_RATE = 24000;
    const BYTES_PER_SAMPLE = 2;
    const CHANNELS = 2;
    const CHUNK_SIZE = SAMPLE_RATE * BYTES_PER_SAMPLE * CHANNELS * CHUNK_DURATION;

    let audioBuffer = Buffer.alloc(0);

    systemAudioProc.stdout.on('data', data => {
        audioBuffer = Buffer.concat([audioBuffer, data]);

        while (audioBuffer.length >= CHUNK_SIZE) {
            const chunk = audioBuffer.slice(0, CHUNK_SIZE);
            audioBuffer = audioBuffer.slice(CHUNK_SIZE);

            const monoChunk = CHANNELS === 2 ? convertStereoToMono(chunk) : chunk;
            const base64Data = monoChunk.toString('base64');
            sendAudioToGemini(base64Data, geminiSessionRef);

            if (process.env.DEBUG_AUDIO) {
                console.log(`Processed audio chunk: ${chunk.length} bytes`);
                saveDebugAudio(monoChunk, 'system_audio');
            }
        }

        const maxBufferSize = SAMPLE_RATE * BYTES_PER_SAMPLE * 1;
        if (audioBuffer.length > maxBufferSize) {
            audioBuffer = audioBuffer.slice(-maxBufferSize);
        }
    });

    systemAudioProc.stderr.on('data', data => {
        console.error('SystemAudioDump stderr:', data.toString());
    });

    systemAudioProc.on('close', code => {
        console.log('SystemAudioDump process closed with code:', code);
        systemAudioProc = null;
    });

    systemAudioProc.on('error', err => {
        console.error('SystemAudioDump process error:', err);
        console.error('Audio capture failed - continuing without system audio');
        
        // Log helpful error message for architecture mismatch
        if (err.code === 'Unknown system error -86' || err.errno === -86) {
            console.error('');
            console.error('═══════════════════════════════════════════════════════════');
            console.error('ARCHITECTURE MISMATCH ERROR');
            console.error('═══════════════════════════════════════════════════════════');
            console.error(`System: ${systemArch} | Binary: ${binaryArch}`);
            if (systemArch === 'x64' && binaryArch === 'arm64') {
                console.error('You are on an Intel Mac but the binary is for Apple Silicon.');
                console.error('You need an x86_64 version of SystemAudioDump.');
                console.error('');
                console.error('For testing: App will run without system audio capture.');
                console.error('For M-series client: This binary will work perfectly.');
            }
            console.error('═══════════════════════════════════════════════════════════');
            console.error('');
        }
        
        systemAudioProc = null;
    });

    return true;
}

function convertStereoToMono(stereoBuffer) {
    const samples = stereoBuffer.length / 4;
    const monoBuffer = Buffer.alloc(samples * 2);

    for (let i = 0; i < samples; i++) {
        const leftSample = stereoBuffer.readInt16LE(i * 4);
        monoBuffer.writeInt16LE(leftSample, i * 2);
    }

    return monoBuffer;
}

function stopMacOSAudioCapture() {
    if (systemAudioProc) {
        console.log('Stopping SystemAudioDump...');
        systemAudioProc.kill('SIGTERM');
        systemAudioProc = null;
    }
}

async function sendAudioToGemini(base64Data, geminiSessionRef) {
    if (!geminiSessionRef.current) return;

    try {
        process.stdout.write('.');
        await geminiSessionRef.current.sendRealtimeInput({
            audio: {
                data: base64Data,
                mimeType: 'audio/pcm;rate=24000',
            },
        });
    } catch (error) {
        console.error('Error sending audio to Gemini:', error);
    }
}

function setupGeminiIpcHandlers(geminiSessionRef) {
    // Store the geminiSessionRef globally for reconnection access
    global.geminiSessionRef = geminiSessionRef;

    ipcMain.handle('initialize-gemini', async (event, apiKey, customPrompt, profile = 'interview', language = 'en-US', featureMode = 'listen') => {
        console.log(`Initializing Gemini for feature: ${featureMode}`);
        
        // For capture mode, use REST client instead of live session
        if (featureMode === 'capture') {
            const success = await initializeCaptureClient(apiKey, customPrompt, profile);
            return success;
        }
        
        // For listen mode, use live WebSocket session
        const session = await initializeGeminiSession(apiKey, customPrompt, profile, language, false, featureMode);
        if (session) {
            geminiSessionRef.current = session;
            return true;
        }
        return false;
    });
    
    // Handle capture queries (REST API with streaming)
    ipcMain.handle('send-capture-query', async (event, { text, imageData }) => {
        return await sendCaptureQuery(text, imageData);
    });

    ipcMain.handle('send-audio-content', async (event, { data, mimeType }) => {
        if (!geminiSessionRef.current) return { success: false, error: 'No active Gemini session' };
        try {
            process.stdout.write('.');
            await geminiSessionRef.current.sendRealtimeInput({
                audio: { data: data, mimeType: mimeType },
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending system audio:', error);
            return { success: false, error: error.message };
        }
    });

    // Handle microphone audio on a separate channel
    ipcMain.handle('send-mic-audio-content', async (event, { data, mimeType }) => {
        if (!geminiSessionRef.current) return { success: false, error: 'No active Gemini session' };
        try {
            process.stdout.write(',');
            await geminiSessionRef.current.sendRealtimeInput({
                audio: { data: data, mimeType: mimeType },
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending mic audio:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('send-image-content', async (event, { data, debug }) => {
        if (!geminiSessionRef.current) return { success: false, error: 'No active Gemini session' };

        try {
            if (!data || typeof data !== 'string') {
                console.error('Invalid image data received');
                return { success: false, error: 'Invalid image data' };
            }

            const buffer = Buffer.from(data, 'base64');

            if (buffer.length < 1000) {
                console.error(`Image buffer too small: ${buffer.length} bytes`);
                return { success: false, error: 'Image buffer too small' };
            }

            process.stdout.write('!');
            await geminiSessionRef.current.sendRealtimeInput({
                media: { data: data, mimeType: 'image/jpeg' },
            });

            return { success: true };
        } catch (error) {
            console.error('Error sending image:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('send-text-message', async (event, text) => {
        if (!geminiSessionRef.current) return { success: false, error: 'No active Gemini session' };

        try {
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                return { success: false, error: 'Invalid text message' };
            }

            console.log('Sending text message:', text);
            await geminiSessionRef.current.sendRealtimeInput({ text: text.trim() });
            return { success: true };
        } catch (error) {
            console.error('Error sending text:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('start-macos-audio', async event => {
        if (process.platform !== 'darwin') {
            return {
                success: false,
                error: 'macOS audio capture only available on macOS',
            };
        }

        try {
            const success = await startMacOSAudioCapture(geminiSessionRef);
            return { success };
        } catch (error) {
            console.error('Error starting macOS audio capture:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('stop-macos-audio', async event => {
        try {
            stopMacOSAudioCapture();
            return { success: true };
        } catch (error) {
            console.error('Error stopping macOS audio capture:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('close-session', async event => {
        try {
            stopMacOSAudioCapture();

            // Clear session params to prevent reconnection when user closes session
            lastSessionParams = null;

            // Cleanup any pending resources and stop audio/video capture
            if (geminiSessionRef.current) {
                await geminiSessionRef.current.close();
                geminiSessionRef.current = null;
            }

            return { success: true };
        } catch (error) {
            console.error('Error closing session:', error);
            return { success: false, error: error.message };
        }
    });

    // Conversation history IPC handlers
    ipcMain.handle('get-current-session', async event => {
        try {
            return { success: true, data: getCurrentSessionData() };
        } catch (error) {
            console.error('Error getting current session:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('start-new-session', async event => {
        try {
            initializeNewSession();
            return { success: true, sessionId: currentSessionId };
        } catch (error) {
            console.error('Error starting new session:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('update-google-search-setting', async (event, enabled) => {
        try {
            console.log('Google Search setting updated to:', enabled);
            // The setting is already saved in localStorage by the renderer
            // This is just for logging/confirmation
            return { success: true };
        } catch (error) {
            console.error('Error updating Google Search setting:', error);
            return { success: false, error: error.message };
        }
    });
}

module.exports = {
    initializeGeminiSession,
    initializeCaptureClient,
    sendCaptureQuery,
    closeActiveSession,
    getEnabledTools,
    getStoredSetting,
    sendToRenderer,
    initializeNewSession,
    saveConversationTurn,
    getCurrentSessionData,
    sendReconnectionContext,
    killExistingSystemAudioDump,
    startMacOSAudioCapture,
    convertStereoToMono,
    stopMacOSAudioCapture,
    sendAudioToGemini,
    setupGeminiIpcHandlers,
    attemptReconnection,
    formatSpeakerResults,
    MODELS,
};
