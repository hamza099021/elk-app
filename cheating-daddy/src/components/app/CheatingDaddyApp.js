import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { AppHeader } from './AppHeader.js';
import { MainView } from '../views/MainView.js';
import { CustomizeView } from '../views/CustomizeView.js';
import { HelpView } from '../views/HelpView.js';
import { HistoryView } from '../views/HistoryView.js';
import { AssistantView } from '../views/AssistantView.js';
import { OnboardingView } from '../views/OnboardingView.js';
import { AdvancedView } from '../views/AdvancedView.js';
import { LoginView } from '../views/LoginView.js';
import { WorldView } from '../views/WorldView.js';
import { usageAPI, subscriptionAPI, authAPI, onAuthStateChange, FeatureType, aiAPI } from '../../utils/api.js';
import { glassStyles } from '../../utils/glassMixin.js';

export class CheatingDaddyApp extends LitElement {
    static styles = [glassStyles, css`
        * {
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0px;
            padding: 0px;
            cursor: default;
            user-select: none;
        }

        :host {
            display: block;
            width: 100%;
            height: 100vh;
            background-color: var(--background-transparent);
            color: var(--text-color);
        }

        .window-container {
            height: 100vh;
            border-radius: 12px;
            overflow: hidden;
            /* Outer glass effect - liquid glass container */
            backdrop-filter: var(--glass-blur-strong) brightness(1.1);
            -webkit-backdrop-filter: var(--glass-blur-strong) brightness(1.1);
            background: var(--app-background, rgba(0, 0, 0, 0.5));
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        /* Header-only mode - transparent background */
        .window-container.header-only-mode {
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border: none !important;
            box-shadow: none !important;
            height: auto;
            overflow: visible;
            pointer-events: none;
        }

        /* Disable pointer events for container in header-only mode */
        .window-container.header-only-mode .container {
            pointer-events: none;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }

        /* Re-enable pointer events for the header in header-only mode */
        .window-container.header-only-mode app-header {
            pointer-events: auto;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .main-content {
            flex: 1;
            padding: var(--main-content-padding);
            overflow-y: auto;
            margin-top: var(--main-content-margin-top);
            border-radius: var(--content-border-radius);
            /* Inner glass panel effect */
            backdrop-filter: var(--glass-blur) saturate(180%);
            -webkit-backdrop-filter: var(--glass-blur) saturate(180%);
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.08);
            
            /* Smooth CSS transition - window resizes instantly, content animates smoothly */
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
            transition: opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), 
                        transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            will-change: opacity, transform;
        }

        /* Content appears with smooth spring animation */
        .main-content:not(.entering) {
            opacity: 1;
            transform: scale(1) translateY(0);
        }

        .view-container {
            /* Content fades in with smooth spring animation */
            animation: fadeInSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes fadeInSpring {
            from {
                opacity: 0;
                transform: scale(0.92) translateY(-15px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        .main-content.with-border {
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .main-content.assistant-view {
            padding: 10px;
            border: none;
            background: rgba(0, 0, 0, 0.15);
        }

        .main-content.onboarding-view {
            padding: 0;
            border: none;
            background: transparent;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }

        .view-container {
            opacity: 1;
            transform: translateY(0);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            transition: 
                opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                backdrop-filter 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            height: 100%;
        }

        .view-container.entering {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: var(--scrollbar-background);
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb);
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover);
        }
    `];

    static properties = {
        currentView: { type: String },
        statusText: { type: String },
        startTime: { type: Number },
        isRecording: { type: Boolean },
        sessionActive: { type: Boolean },
        selectedProfile: { type: String },
        selectedLanguage: { type: String },
        responses: { type: Array },
        currentResponseIndex: { type: Number },
        selectedScreenshotInterval: { type: String },
        selectedImageQuality: { type: String },
        layoutMode: { type: String },
        advancedMode: { type: Boolean },
        _viewInstances: { type: Object, state: true },
        _isClickThrough: { state: true },
        _awaitingNewResponse: { state: true },
        shouldAnimateResponse: { type: Boolean },
        isAuthenticated: { type: Boolean },
        isValidatingAuth: { type: Boolean },
        currentUser: { type: Object },
        worldPanelOpen: { type: Boolean },
    };

    constructor() {
        super();
        // Start with login view, will validate token and switch if valid
        this.isAuthenticated = false;
        this.isValidatingAuth = true;
        this.currentView = 'login';
        this.currentUser = null;
        this.statusText = '';
        this.startTime = null;
        this.isRecording = false;
        this.sessionActive = false;
        this.selectedProfile = localStorage.getItem('selectedProfile') || 'interview';
        this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en-US';
        this.selectedScreenshotInterval = localStorage.getItem('selectedScreenshotInterval') || '5';
        this.selectedImageQuality = localStorage.getItem('selectedImageQuality') || 'medium';
        this.layoutMode = localStorage.getItem('layoutMode') || 'normal';
        this.advancedMode = localStorage.getItem('advancedMode') === 'true';
        this.responses = [];
        this.currentResponseIndex = -1;
        this._viewInstances = new Map();
        this._isClickThrough = false;
        this._awaitingNewResponse = false;
        this._currentResponseIsComplete = true;
        this.shouldAnimateResponse = false;
        this._authUnsubscribe = null;
        this.worldPanelOpen = false;

        // Apply layout mode to document root
        this.updateLayoutMode();
    }

    connectedCallback() {
        super.connectedCallback();

        // Listen for login success event
        this.addEventListener('login-success', this.handleLoginSuccess.bind(this));
        
        // Subscribe to auth state changes
        this._authUnsubscribe = onAuthStateChange((isAuthenticated, user) => {
            console.log('🔐 Auth state changed:', isAuthenticated, user?.email);
            this.isAuthenticated = isAuthenticated;
            this.currentUser = user;
            
            if (!isAuthenticated) {
                // Redirect to login if auth is lost
                this.currentView = 'login';
                this.requestUpdate();
            }
        });
        
        // Validate existing token on startup
        this.validateAuthOnStartup();

        // Set up IPC listeners if needed
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.on('update-response', (_, response) => {
                this.setResponse(response);
            });
            ipcRenderer.on('update-status', (_, status) => {
                this.setStatus(status);
            });
            ipcRenderer.on('click-through-toggled', (_, isEnabled) => {
                this._isClickThrough = isEnabled;
            });
            // Handle messages from capture window
            ipcRenderer.on('capture-message-received', (_, message) => {
                console.log('[Main] Received message from capture window:', message);
                this.handleSendText(message);
            });
        }
    }
    
    async validateAuthOnStartup() {
        console.log('🔐 Validating auth on startup...');
        
        // Check if we have stored auth data
        const hasStoredAuth = localStorage.getItem('isAuthenticated') === 'true' && 
                              localStorage.getItem('accessToken');
        
        if (!hasStoredAuth) {
            console.log('❌ No stored auth data, showing login');
            this.isValidatingAuth = false;
            this.currentView = 'login';
            this.requestUpdate();
            return;
        }
        
        try {
            // Validate the token with the backend
            const result = await authAPI.validateToken();
            
            if (result.valid && result.user) {
                console.log('✅ Token valid, user:', result.user.email);
                this.isAuthenticated = true;
                this.currentUser = result.user;
                this.currentView = 'assistant';
                
                // Resize window to header-only mode
                if (window.require) {
                    const { ipcRenderer } = window.require('electron');
                    ipcRenderer.invoke('resize-to-header');
                }
                
                // Update stored plan info
                if (result.user.subscription) {
                    localStorage.setItem('userPlan', result.user.subscription.plan);
                }
            } else {
                console.log('❌ Token invalid, redirecting to login');
                this.isAuthenticated = false;
                this.currentUser = null;
                this.currentView = 'login';
                
                // Clear invalid auth data
                authAPI.logout();
            }
        } catch (error) {
            console.error('❌ Auth validation error:', error);
            // On error, show login screen
            this.isAuthenticated = false;
            this.currentView = 'login';
        }
        
        this.isValidatingAuth = false;
        this.requestUpdate();
    }

    handleLoginSuccess(e) {
        console.log('✅ Login success event received');
        this.isAuthenticated = true;
        this.currentUser = e.detail?.user || null;
        // Skip onboarding and API key screen, go directly to assistant
        localStorage.setItem('onboardingCompleted', 'true');
        
        // Store user plan for feature gating
        if (e.detail?.user?.subscription?.plan) {
            localStorage.setItem('userPlan', e.detail.user.subscription.plan);
        } else {
            localStorage.setItem('userPlan', 'FREE');
        }
        
        this.currentView = 'assistant';
        
        // Resize window to header-only mode
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('resize-to-header');
        }
        
        this.requestUpdate();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        
        // Unsubscribe from auth state changes
        if (this._authUnsubscribe) {
            this._authUnsubscribe();
        }
        
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.removeAllListeners('update-response');
            ipcRenderer.removeAllListeners('update-status');
            ipcRenderer.removeAllListeners('click-through-toggled');
        }
    }

    setStatus(text) {
        this.statusText = text;
        
        // Mark response as complete when we get certain status messages
        if (text.includes('Ready') || text.includes('Listening') || text.includes('Error')) {
            this._currentResponseIsComplete = true;
            console.log('[setStatus] Marked current response as complete');
        }
    }

    setResponse(response) {
        console.log('[setResponse] CALLED with response:', response?.substring(0, 80));
        // Check if this looks like a filler response (very short responses to hmm, ok, etc)
        const isFillerResponse =
            response.length < 30 &&
            (response.toLowerCase().includes('hmm') ||
                response.toLowerCase().includes('okay') ||
                response.toLowerCase().includes('next') ||
                response.toLowerCase().includes('go on') ||
                response.toLowerCase().includes('continue'));

        if (this._awaitingNewResponse || this.responses.length === 0) {
            // Always add as new response when explicitly waiting for one
            this.responses = [...this.responses, response];
            this.currentResponseIndex = this.responses.length - 1;
            this._awaitingNewResponse = false;
            this._currentResponseIsComplete = false;
            console.log('[setResponse] Pushed new response:', response);
        } else if (!this._currentResponseIsComplete && !isFillerResponse && this.responses.length > 0) {
            // For substantial responses, update the last one (streaming behavior)
            // Only update if the current response is not marked as complete
            this.responses = [...this.responses.slice(0, this.responses.length - 1), response];
            console.log('[setResponse] Updated last response:', response);
        } else {
            // For filler responses or when current response is complete, add as new
            this.responses = [...this.responses, response];
            this.currentResponseIndex = this.responses.length - 1;
            this._currentResponseIsComplete = false;
            console.log('[setResponse] Added response as new:', response);
        }
        this.shouldAnimateResponse = true;
        
        // Forward response to child windows based on active state
        // Open windows on first response (lazy open)
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            console.log('[setResponse] sessionActive:', this.sessionActive, 'isRecording:', this.isRecording);
            
            if (this.isRecording) {
                // Open listen window if not already open (lazy open on first response)
                if (!this._listenWindowOpened) {
                    this._listenWindowOpened = true;
                    ipcRenderer.invoke('open-listen-window').then(() => {
                        console.log('[setResponse] Listen window opened on first response');
                        // Send status AFTER window opens
                        ipcRenderer.send('update-listen-status', true);
                        // Small delay to ensure window is ready
                        setTimeout(() => {
                            ipcRenderer.send('listen-response-update', response);
                        }, 100);
                    });
                } else {
                    // Send to listen window
                    console.log('[setResponse] Sending to listen window');
                    ipcRenderer.send('listen-response-update', response);
                }
            }
            if (this.sessionActive) {
                // Send to capture window
                console.log('[setResponse] Sending to capture window:', response?.substring(0, 50));
                ipcRenderer.send('capture-response-update', response);
            }
        }
        
        this.requestUpdate();
    }

    // Header event handlers
    async handleCustomizeClick() {
        this.currentView = 'customize';
        await this.requestUpdate();
        // Wait for content to render before resizing
        await this.updateComplete;
        await new Promise(resolve => requestAnimationFrame(resolve));
    }

    async handleHelpClick() {
        this.currentView = 'help';
        await this.requestUpdate();
        await this.updateComplete;
        await new Promise(resolve => requestAnimationFrame(resolve));
    }

    async handleHistoryClick() {
        this.currentView = 'history';
        await this.requestUpdate();
        await this.updateComplete;
        await new Promise(resolve => requestAnimationFrame(resolve));
    }

    async handleAdvancedClick() {
        this.currentView = 'advanced';
        await this.requestUpdate();
        await this.updateComplete;
        await new Promise(resolve => requestAnimationFrame(resolve));
    }

    async handleClose() {
        if (this.currentView === 'customize' || this.currentView === 'help' || this.currentView === 'history' || this.currentView === 'advanced') {
            this.currentView = 'assistant'; // Go back to assistant instead of main
            // Resize back to header-only mode
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.invoke('resize-to-header');
            }
        } else if (this.currentView === 'assistant') {
            // Close the entire application instead of going to main view
            cheddar.stopCapture();

            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('quit-application');
            }
        } else {
            // Quit the entire application
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('quit-application');
            }
        }
    }

    async handleHideToggle() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('toggle-window-visibility');
        }
    }

    // Main view event handlers
    async handleStart() {
        // check if api key is empty do nothing
        const apiKey = localStorage.getItem('apiKey')?.trim();
        if (!apiKey || apiKey === '') {
            // Trigger the red blink animation on the API key input
            const mainView = this.shadowRoot.querySelector('main-view');
            if (mainView && mainView.triggerApiKeyError) {
                mainView.triggerApiKeyError();
            }
            return;
        }

        await cheddar.initializeGemini(this.selectedProfile, this.selectedLanguage);
        // Pass the screenshot interval as string (including 'manual' option)
        cheddar.startCapture(this.selectedScreenshotInterval, this.selectedImageQuality);
        this.responses = [];
        this.currentResponseIndex = -1;
        this.startTime = Date.now();
        this.currentView = 'assistant';
    }

    // New feature handlers
    async handleToggleListen() {
        // If currently recording, just stop it
        if (this.isRecording) {
            this.isRecording = false;
            this._listenWindowOpened = false; // Reset flag for next session
            
            // Stop listening
            cheddar.stopCapture();
            this.startTime = null;
            this.setStatus('Stopped');
            
            // Update listen window status
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('update-listen-status', false);
            }
            
            // Stop tracking
            if (this._audioTrackingInterval) {
                clearInterval(this._audioTrackingInterval);
                this._audioTrackingInterval = null;
                console.log('⏹️ Stopped audio tracking interval');
            }
            
            this.requestUpdate();
            return;
        }
        
        // If not recording, check usage limit before starting
        try {
            console.log('🎤 Checking audio usage limit...');
            const checkResult = await usageAPI.check(FeatureType.AUDIO_MINUTES, 0.5);
            console.log('Usage check result:', checkResult);
            
            if (!checkResult.success || !checkResult.data.canUse) {
                // Show upgrade prompt
                const plan = checkResult.data?.plan || 'FREE';
                const limit = checkResult.data?.limit || 20;
                const current = checkResult.data?.currentUsage || 0;
                alert(`You've reached your ${plan} plan limit of ${limit} minutes/month for Live Conversation.\n\nCurrent usage: ${Math.round(current)} minutes\nPlease upgrade to Pro for 600 minutes/month.`);
                return;
            }
            console.log('✅ Usage check passed, starting audio tracking');
        } catch (error) {
            console.error('❌ Failed to check usage:', error);
            alert('Unable to verify usage limits. Please ensure the backend server is running on port 3000.');
            return;
        }
        
        // Don't open listen window immediately - it will open when response starts streaming
        // The window opens via setResponse when isRecording is true
        
        // Start recording
        this.isRecording = true;
        
        // Set a dummy API key if not present (will use backend API)
        if (!localStorage.getItem('apiKey')) {
            localStorage.setItem('apiKey', 'backend-managed');
        }
        
        // Start listening for interview (with audio enabled)
        await cheddar.initializeGemini(this.selectedProfile, this.selectedLanguage, 'listen');
        cheddar.startCapture('30', this.selectedImageQuality, true); // enableAudio = true
        
        if (this.responses.length === 0) {
            this.responses = [];
            this.currentResponseIndex = -1;
        }
        
        this.startTime = Date.now();
        this.setStatus('Listening...');
        
        // Note: update-listen-status is sent in setResponse() when the window actually opens
        // This ensures the status message arrives after the window is ready
        
        // Track usage every 30 seconds (0.5 minutes)
        console.log('🎯 Setting up 30-second tracking interval...');
        this._audioTrackingInterval = setInterval(async () => {
            console.log('⏰ INTERVAL FIRED - Tracking 0.5 minutes of audio usage...');
            try {
                const result = await usageAPI.track(FeatureType.AUDIO_MINUTES, 0.5);
                console.log('✅ Audio usage tracked:', result);
                
                if (!result.success && result.data?.limitExceeded) {
                    alert('Audio minutes limit reached! Stopping recording.');
                    this.handleToggleListen();
                }
            } catch (error) {
                console.error('❌ Failed to track audio usage:', error);
            }
        }, 30000);
        console.log('✅ Tracking interval set successfully');
        
        this.requestUpdate();
    }

    async handleToggleScreenCapture() {
        // If session is active, just stop it
        if (this.sessionActive) {
            this.sessionActive = false;
            
            // Stop screen capture
            cheddar.stopCapture();
            this.setStatus('Stopped');
            
            // Stop tracking
            if (this._screenCaptureTrackingInterval) {
                clearInterval(this._screenCaptureTrackingInterval);
                this._screenCaptureTrackingInterval = null;
                console.log('⏹️ Stopped screen capture tracking interval');
            }
            
            // Close capture window
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('close-capture-window');
            }
            
            this.requestUpdate();
            return;
        }
        
        // If session not active, check usage before starting
        try {
            console.log('🖥️ Checking screen Q&A usage limit...');
            const checkResult = await usageAPI.check(FeatureType.SCREEN_QA, 1);
            console.log('Usage check result:', checkResult);
            
            if (!checkResult.success || !checkResult.data.canUse) {
                // Show upgrade prompt
                const plan = checkResult.data?.plan || 'FREE';
                const limit = checkResult.data?.limit || 10;
                const current = checkResult.data?.currentUsage || 0;
                alert(`You've reached your ${plan} plan limit of ${limit} queries/month for Screen Q&A.\n\nCurrent usage: ${current} queries\nPlease upgrade to Pro for 900 queries/month.`);
                return;
            }
            console.log('✅ Usage check passed, starting screen capture tracking');
        } catch (error) {
            console.error('❌ Failed to check usage:', error);
            alert('Unable to verify usage limits. Please ensure the backend server is running on port 3000.');
            return;
        }
        
        // Start session
        this.sessionActive = true;
        
        // Set a dummy API key if not present (will use backend API)
        if (!localStorage.getItem('apiKey')) {
            localStorage.setItem('apiKey', 'backend-managed');
        }
        
        // Open capture window
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-capture-window');
        }
        
        // Start screen capture every 1 second (no audio, screenshots only)
        // Screenshots are stored locally, only the latest one is sent with a query
        await cheddar.initializeGemini(this.selectedProfile, this.selectedLanguage, 'capture');
        cheddar.startCapture('1', this.selectedImageQuality, false); // enableAudio = false
        this.setStatus('Capturing screen...');
        
        // Track usage every 30 seconds (1 query per capture)
        console.log('🎯 Setting up 30-second screen capture tracking interval...');
        this._screenCaptureTrackingInterval = setInterval(async () => {
            console.log('⏰ INTERVAL FIRED - Tracking 1 screen Q&A usage...');
            try {
                const result = await usageAPI.track(FeatureType.SCREEN_QA, 1);
                console.log('✅ Screen Q&A usage tracked:', result);
                
                if (!result.success && result.data?.limitExceeded) {
                    alert('Screen Q&A limit reached! Stopping capture.');
                    this.handleToggleScreenCapture();
                }
            } catch (error) {
                console.error('❌ Failed to track screen capture usage:', error);
            }
        }, 30000);
        console.log('✅ Tracking interval set successfully');
        
        this.requestUpdate();
    }

    async handleWorldClick() {
        // Open world window - button is already disabled for FREE users in AppHeader
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-world-window');
        }
    }

    async handlePerplexitySearch(query) {
        if (!query || !query.trim()) return;
        
        // Check usage before searching
        try {
            console.log('🔍 Checking Perplexity usage limit...');
            const checkResult = await usageAPI.check(FeatureType.WEB_QUERIES, 1);
            console.log('Usage check result:', checkResult);
            
            if (!checkResult.success || !checkResult.data.canUse) {
                // Show upgrade prompt
                const plan = checkResult.data?.plan || 'FREE';
                const limit = checkResult.data?.limit || 0;
                const current = checkResult.data?.currentUsage || 0;
                
                if (limit === 0) {
                    alert(`Perplexity Search is not available on the ${plan} plan.\n\nPlease upgrade to Pro for 100 queries/month.`);
                } else {
                    alert(`You've reached your ${plan} plan limit of ${limit} queries/month for Perplexity Search.\n\nCurrent usage: ${current} queries`);
                }
                return;
            }
            console.log('✅ Usage check passed, executing Perplexity search');
        } catch (error) {
            console.error('❌ Failed to check usage:', error);
            alert('Unable to verify usage limits. Please ensure you are logged in.');
            return;
        }
        
        try {
            // Show searching status
            this.setStatus('Searching Perplexity...');
            
            // Call Perplexity API through backend (includes auth)
            const result = await aiAPI.perplexity.search(query);
            
            if (!result.success) {
                throw new Error(result.error || 'Search failed');
            }
            
            const answer = result.data?.answer;
            const citations = result.data?.citations || [];
            
            console.log('📝 Answer:', answer?.substring(0, 100));
            console.log('🔗 Citations:', citations);
            
            if (answer) {
                // Usage is tracked by backend automatically
                
                // Open world window and send response there
                if (window.require) {
                    const { ipcRenderer } = window.require('electron');
                    await ipcRenderer.invoke('open-world-window');
                    // Send the response and citations to world window
                    ipcRenderer.send('perplexity-chunk', { content: answer, citations });
                }
                this.setStatus('Ready');
                this._awaitingNewResponse = true;
            } else {
                if (window.require) {
                    const { ipcRenderer } = window.require('electron');
                    await ipcRenderer.invoke('open-world-window');
                    ipcRenderer.send('perplexity-chunk', { content: 'No response received from Perplexity', citations: [] });
                }
                this.setStatus('Error');
            }
            
        } catch (error) {
            console.error('Perplexity search failed:', error);
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('open-world-window');
                ipcRenderer.send('perplexity-chunk', `Failed to search: ${error.message}`);
            }
            this.setStatus('Error');
        }
    }

    async handleAPIKeyHelp() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-external', 'https://cheatingdaddy.com/help/api-key');
        }
    }

    // Customize view event handlers
    handleProfileChange(profile) {
        this.selectedProfile = profile;
    }

    handleLanguageChange(language) {
        this.selectedLanguage = language;
    }

    handleScreenshotIntervalChange(interval) {
        this.selectedScreenshotInterval = interval;
    }

    handleImageQualityChange(quality) {
        this.selectedImageQuality = quality;
        localStorage.setItem('selectedImageQuality', quality);
    }

    handleAdvancedModeChange(advancedMode) {
        this.advancedMode = advancedMode;
        localStorage.setItem('advancedMode', advancedMode.toString());
    }

    handleBackClick() {
        this.currentView = 'assistant';
        // Resize back to header-only mode
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('resize-to-header');
        }
        this.requestUpdate();
    }

    // World button handler - open separate World window
    async handleWorldClick() {
        console.log('World button clicked, opening world window');
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            try {
                await ipcRenderer.invoke('open-world-window');
            } catch (error) {
                console.error('Failed to open world window:', error);
            }
        }
    }

    // Help view event handlers
    async handleExternalLinkClick(url) {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-external', url);
        }
    }

    // Assistant view event handlers
    async handleSendText(message) {
        const result = await window.cheddar.sendTextMessage(message);

        if (!result.success) {
            console.error('Failed to send message:', result.error);
            this.setStatus('Error sending message: ' + result.error);
        } else {
            this.setStatus('Message sent...');
            this._awaitingNewResponse = true;
        }
    }

    handleResponseIndexChanged(e) {
        this.currentResponseIndex = e.detail.index;
        this.shouldAnimateResponse = false;
        this.requestUpdate();
    }

    // Onboarding event handlers
    handleOnboardingComplete() {
        this.currentView = 'main';
    }

    async updated(changedProperties) {
        super.updated(changedProperties);

        // Only notify main process of view change if the view actually changed
        if (changedProperties.has('currentView') && window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('view-changed', this.currentView);

            // Manage header-only mode class on document for pointer events
            if (this.currentView === 'assistant') {
                document.documentElement.classList.add('header-only-mode');
            } else {
                document.documentElement.classList.remove('header-only-mode');
            }

            // Smooth animation using native window resize + CSS transitions
            const isExpandingView = ['customize', 'help', 'history', 'advanced'].includes(this.currentView);
            
            if (isExpandingView) {
                // Trigger resize immediately - CSS will handle content fade
                await ipcRenderer.invoke('animate-resize');
            } else if (this.currentView === 'assistant') {
                // Shrink to header
                await ipcRenderer.invoke('animate-resize-to-header');
            }
        }

        // Only update localStorage when these specific properties change
        if (changedProperties.has('selectedProfile')) {
            localStorage.setItem('selectedProfile', this.selectedProfile);
        }
        if (changedProperties.has('selectedLanguage')) {
            localStorage.setItem('selectedLanguage', this.selectedLanguage);
        }
        if (changedProperties.has('selectedScreenshotInterval')) {
            localStorage.setItem('selectedScreenshotInterval', this.selectedScreenshotInterval);
        }
        if (changedProperties.has('selectedImageQuality')) {
            localStorage.setItem('selectedImageQuality', this.selectedImageQuality);
        }
        if (changedProperties.has('layoutMode')) {
            this.updateLayoutMode();
        }
        if (changedProperties.has('advancedMode')) {
            localStorage.setItem('advancedMode', this.advancedMode.toString());
        }
    }

    renderCurrentView() {
        // Only re-render the view if it hasn't been cached or if critical properties changed
        const viewKey = `${this.currentView}-${this.selectedProfile}-${this.selectedLanguage}`;

        switch (this.currentView) {
            case 'login':
                return html`
                    <login-view></login-view>
                `;

            case 'onboarding':
                return html`
                    <onboarding-view .onComplete=${() => this.handleOnboardingComplete()} .onClose=${() => this.handleClose()}></onboarding-view>
                `;

            case 'main':
                return html`
                    <main-view
                        .onStart=${() => this.handleStart()}
                        .onAPIKeyHelp=${() => this.handleAPIKeyHelp()}
                        .onLayoutModeChange=${layoutMode => this.handleLayoutModeChange(layoutMode)}
                    ></main-view>
                `;

            case 'customize':
                return html`
                    <customize-view
                        .selectedProfile=${this.selectedProfile}
                        .selectedLanguage=${this.selectedLanguage}
                        .selectedScreenshotInterval=${this.selectedScreenshotInterval}
                        .selectedImageQuality=${this.selectedImageQuality}
                        .layoutMode=${this.layoutMode}
                        .advancedMode=${this.advancedMode}
                        .onProfileChange=${profile => this.handleProfileChange(profile)}
                        .onLanguageChange=${language => this.handleLanguageChange(language)}
                        .onScreenshotIntervalChange=${interval => this.handleScreenshotIntervalChange(interval)}
                        .onImageQualityChange=${quality => this.handleImageQualityChange(quality)}
                        .onLayoutModeChange=${layoutMode => this.handleLayoutModeChange(layoutMode)}
                        .onAdvancedModeChange=${advancedMode => this.handleAdvancedModeChange(advancedMode)}
                    ></customize-view>
                `;

            case 'help':
                return html` <help-view .onExternalLinkClick=${url => this.handleExternalLinkClick(url)}></help-view> `;

            case 'history':
                return html` <history-view></history-view> `;

            case 'advanced':
                return html` <advanced-view></advanced-view> `;

            case 'assistant':
                // Header-only view - no content below, all features in separate windows
                return html``;

            default:
                return html`<div>Unknown view: ${this.currentView}</div>`;
        }
    }

    render() {
        // Show loading screen while validating auth
        if (this.isValidatingAuth) {
            return html`
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .loader {
                        width: 40px;
                        height: 40px;
                        border: 3px solid transparent;
                        border-top: 3px solid rgba(255, 255, 255, 0.9);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        box-shadow: 0 0 15px rgba(255, 255, 255, 0.3), 
                                    0 0 30px rgba(255, 255, 255, 0.1);
                    }
                </style>
                <div class="window-container">
                    <div class="container" style="display: flex; align-items: center; justify-content: center; height: 100vh; background: rgba(0,0,0,0.95);">
                        <div style="text-align: center; color: white;">
                            <div class="loader" style="margin: 0 auto 15px auto;"></div>
                            <div style="font-size: 14px; opacity: 0.7;">Validating session...</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        const mainContentClass = `main-content ${
            this.currentView === 'assistant' ? 'assistant-view header-only' : this.currentView === 'onboarding' || this.currentView === 'login' ? 'onboarding-view' : 'with-border'
        }`;

        // Hide header on login screen, hide content area in assistant view
        const showHeader = this.currentView !== 'login';
        const showContent = this.currentView !== 'assistant';
        const windowContainerClass = `window-container${this.currentView === 'assistant' ? ' header-only-mode' : ''}`;

        return html`
            <div class="${windowContainerClass}">
                <div class="container">
                    ${showHeader ? html`
                        <app-header
                            ?compact=${this.layoutMode === 'compact'}
                            .currentView=${this.currentView}
                            .statusText=${this.statusText}
                            .startTime=${this.startTime}
                            .advancedMode=${this.advancedMode}
                            .onCustomizeClick=${() => this.handleCustomizeClick()}
                            .onHelpClick=${() => this.handleHelpClick()}
                            .onHistoryClick=${() => this.handleHistoryClick()}
                            .onAdvancedClick=${() => this.handleAdvancedClick()}
                            .onCloseClick=${() => this.handleClose()}
                            .onBackClick=${() => this.handleBackClick()}
                            .onHideToggleClick=${() => this.handleHideToggle()}
                            .isListening=${this.isRecording}
                            .isScreenCapturing=${this.sessionActive}
                            .onToggleListen=${() => this.handleToggleListen()}
                            .onToggleScreenCapture=${() => this.handleToggleScreenCapture()}
                            .onWorldClick=${() => this.handleWorldClick()}
                            .userPlan=${localStorage.getItem('userPlan') || 'FREE'}
                            ?isClickThrough=${this._isClickThrough}
                        ></app-header>
                    ` : ''}
                    ${showContent ? html`
                        <div class="${mainContentClass}">
                            <div class="view-container">${this.renderCurrentView()}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    updateLayoutMode() {
        // Apply or remove compact layout class to document root
        if (this.layoutMode === 'compact') {
            document.documentElement.classList.add('compact-layout');
        } else {
            document.documentElement.classList.remove('compact-layout');
        }
    }

    async handleLayoutModeChange(layoutMode) {
        this.layoutMode = layoutMode;
        localStorage.setItem('layoutMode', layoutMode);
        this.updateLayoutMode();

        // Notify main process about layout change for window resizing
        if (window.require) {
            try {
                const { ipcRenderer } = window.require('electron');
                // Use appropriate resize based on current view
                if (this.currentView === 'assistant') {
                    await ipcRenderer.invoke('resize-to-header');
                } else {
                    await ipcRenderer.invoke('update-sizes');
                }
            } catch (error) {
                console.error('Failed to update sizes in main process:', error);
            }
        }

        this.requestUpdate();
    }
}

customElements.define('cheating-daddy-app', CheatingDaddyApp);
