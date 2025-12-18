// Migrated and enhanced from cheating-daddy/src/utils/gemini.js
// Now using realtime API like the desktop app

import { GoogleGenAI } from '@google/genai'
import cuid from 'cuid'
import { getSystemPrompt } from '../prompts'
import { rateLimiter } from './rate-limiter'

export interface GeminiSession {
  id: string
  userId: string
  liveSession: any // GoogleGenAI live session
  profile: string
  language: string
  isActive: boolean
  tokensUsed: number
  startedAt: Date
  conversationHistory: any[]
  currentTranscription: string
  messageBuffer: string
  callbacks?: {
    onTranscription?: (transcription: string) => void
    onResponse?: (response: string) => void
    onComplete?: (transcription: string, response: string) => void
    onError?: (error: string) => void
  }
}

export interface AudioChunk {
  data: string // base64 encoded
  mimeType: string
  sampleRate?: number
  channels?: number
}

export interface ImageData {
  data: string // base64 encoded
  mimeType: string
  width?: number
  height?: number
}

export interface GeminiResponse {
  text?: string
  tokens?: number
  completed?: boolean
}

class GeminiProvider {
  private client: GoogleGenAI
  private sessions: Map<string, GeminiSession> = new Map()
  private reconnectionAttempts: Map<string, number> = new Map()
  private maxReconnectionAttempts = 3
  private reconnectionDelay = 2000
  // Prevent concurrent or rapid session initializations per user+profile
  private initLocks: Map<string, number> = new Map()
  // Prevent concurrent reconnection attempts per session
  private reconnectionLocks: Set<string> = new Set()

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || ''
    // Allow construction without an API key so Next.js build doesn't fail.
    // Validate presence of the API key when attempting to initialize sessions.
    this.client = new GoogleGenAI({
      vertexai: false,
      apiKey: apiKey,
    })
  }

  // Format speaker diarization results like desktop app
  formatSpeakerResults(results: any[]): string {
    let text = ''
    for (const result of results) {
      if (result.transcript && result.speakerId) {
        const speakerLabel = result.speakerId === 1 ? 'Interviewer' : 'Candidate'
        text += `[${speakerLabel}]: ${result.transcript}\n`
      }
    }
    return text
  }

  // Initialize a new Gemini realtime session (like desktop app)
  async initializeSession(
    userId: string,
    profile: string = 'interview',
    language: string = 'en-US',
    customPrompt: string = '',
    googleSearchEnabled: boolean = true,
    callbacks?: GeminiSession['callbacks']
  ): Promise<string> {
    try {
      console.log('Starting Gemini realtime session initialization for user:', userId)

      // If there's already an active session for this user+profile, return it
      const existingSession = Array.from(this.sessions.values()).find(s => s.userId === userId && s.profile === profile && s.isActive)
      if (existingSession) {
        console.log('Existing active session found for user, returning existing session id:', (existingSession as any).id)
        return (existingSession as any).id
      }

      const systemPrompt = getSystemPrompt(profile, customPrompt, googleSearchEnabled)
      const sessionId = cuid() // Generate proper CUID compatible with Zod

      // Prevent rapid duplicate initializations for the same user+profile
      const initKey = `${userId}:${profile}`
      const now = Date.now()
      const lastInit = this.initLocks.get(initKey) || 0
      const INIT_COOLDOWN_MS = 5000 // 5 seconds cooldown between attempts
      if (now - lastInit < INIT_COOLDOWN_MS) {
        console.warn('Initialization suppressed due to recent init for', initKey)
        if (existingSession) return (existingSession as any).id
        throw new Error('Session initialization suppressed due to recent attempt')
      }
      // Mark initialization start time
      this.initLocks.set(initKey, now)

      console.log('Creating Gemini live session with API key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing')

      // Get enabled tools like desktop app
      const enabledTools = googleSearchEnabled ? [{ googleSearch: {} }] : []

      // Create realtime live session exactly like desktop app
      const liveSession = await this.client.live.connect({
        model: 'gemini-live-2.5-flash-preview', // Same model as desktop app
        callbacks: {
          onopen: () => {
            console.log('Live session connected for user:', userId)
            callbacks?.onResponse?.('Live session connected')
          },
          onmessage: (message: any) => {
            const session = this.sessions.get(sessionId)
            if (!session) return

            console.log('Received message:', message)

            // Handle transcription like desktop app (use any to avoid strict SDK typing mismatches)
            try {
              const inputTranscription = (message as any).serverContent?.inputTranscription
              if (inputTranscription && inputTranscription.results) {
                const transcription = this.formatSpeakerResults(inputTranscription.results)
                session.currentTranscription += transcription
                callbacks?.onTranscription?.(transcription)
              }
            } catch (e) {
              console.debug('Transcription parse error (ignored):', e)
            }

            // Handle AI model response like desktop app
            try {
              const modelParts = (message as any).serverContent?.modelTurn?.parts
              if (modelParts && Array.isArray(modelParts)) {
                for (const part of modelParts) {
                  if (part?.text) {
                    session.messageBuffer += part.text
                    callbacks?.onResponse?.(session.messageBuffer)
                  }
                }
              }
            } catch (e) {
              console.debug('Model response parse error (ignored):', e)
            }

            // Handle generation complete like desktop app
            if ((message as any).serverContent?.generationComplete) {
              callbacks?.onResponse?.(session.messageBuffer)

              // Save conversation turn when we have both transcription and AI response
              if (session.currentTranscription && session.messageBuffer) {
                this.saveConversationTurn(sessionId, session.currentTranscription, session.messageBuffer)
                callbacks?.onComplete?.(session.currentTranscription, session.messageBuffer)
                session.currentTranscription = '' // Reset for next turn
              }

              session.messageBuffer = ''
            }

            if ((message as any).serverContent?.turnComplete) {
              console.log('Turn complete, listening...')
            }
          },
          onerror: (error) => {
            console.error('Live session error:', error.message)
            callbacks?.onError?.(error.message)

            // Check for API key errors like desktop app
            const isApiKeyError = error.message && (
              error.message.includes('API key not valid') ||
              error.message.includes('invalid API key') ||
              error.message.includes('authentication failed') ||
              error.message.includes('unauthorized')
            )

            if (isApiKeyError) {
              console.log('Error due to invalid API key - stopping reconnection attempts')
              this.reconnectionAttempts.delete(sessionId)
            }
          },
          onclose: (event) => {
            console.log('Live session closed:', event.reason)

            // Check for API key errors like desktop app
            const isApiKeyError = event.reason && (
              event.reason.includes('API key not valid') ||
              event.reason.includes('invalid API key') ||
              event.reason.includes('authentication failed') ||
              event.reason.includes('unauthorized')
            )

            if (isApiKeyError) {
              console.log('Session closed due to invalid API key')
              this.reconnectionAttempts.delete(sessionId)
              return
            }

            // Attempt automatic reconnection like desktop app
            const attempts = this.reconnectionAttempts.get(sessionId) || 0
            if (attempts < this.maxReconnectionAttempts) {
              console.log('Attempting automatic reconnection...')
              this.attemptReconnection(sessionId, userId, profile, language, customPrompt, googleSearchEnabled, callbacks)
            }
          },
        },
        config: {
          responseModalities: ['TEXT'],
          tools: enabledTools,
          // Note: removed `enableSpeakerDiarization` because the live API rejected it
          // If diarization is required, re-add using the exact supported fields from
          // the SDK/docs. For now we leave transcription configuration to defaults.
          contextWindowCompression: { slidingWindow: {} },
          speechConfig: { languageCode: language },
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
        } as any,
      })

      console.log('Live session created, storing session data')

      const geminiSession: GeminiSession = {
        id: sessionId,
        userId,
        liveSession,
        profile,
        language,
        isActive: true,
        tokensUsed: 0,
        startedAt: new Date(),
        conversationHistory: [],
        currentTranscription: '',
        messageBuffer: '',
        callbacks,
      }

      this.sessions.set(sessionId, geminiSession)

      console.log('Session stored successfully, session ID:', sessionId)

      // Check rate limits and track usage after successful initialization
      try {
        await rateLimiter.checkLimit(userId, 'gemini_session', 1)
        await rateLimiter.recordUsage(userId, 'gemini_session', 1)
      } catch (rateLimitError) {
        console.warn('Rate limiting error (non-fatal):', rateLimitError)
      }

      // Clear initialization lock for this user+profile
      try {
        const initKeyToClear = `${userId}:${profile}`
        this.initLocks.delete(initKeyToClear)
      } catch (e) {
        /* ignore */
      }

      return sessionId
    } catch (error) {
      // Clear init lock on error as well so future attempts can proceed
      try {
        const initKeyToClear = `${userId}:${profile}`
        this.initLocks.delete(initKeyToClear)
      } catch (e) {
        /* ignore */
      }

      console.error('Failed to initialize Gemini realtime session:', error)
      
      // Log more detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
      }
      
      throw new Error('Failed to initialize AI session')
    }
  }

  // Send audio data to Gemini realtime session (like desktop app)
  async sendAudio(sessionId: string, audioChunk: AudioChunk): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      throw new Error('Invalid or inactive session')
    }

    try {
      // Check rate limits
      await rateLimiter.checkLimit(session.userId, 'gemini_audio', this.calculateAudioTokens(audioChunk))

      console.log('Sending realtime audio for session:', sessionId)
      
      // Send audio to realtime session exactly like desktop app
      await session.liveSession.sendRealtimeInput({
        audio: {
          data: audioChunk.data,
          mimeType: audioChunk.mimeType,
        },
      })

      // Track audio usage
      const audioTokens = this.calculateAudioTokens(audioChunk)
      session.tokensUsed += audioTokens
      await rateLimiter.recordUsage(session.userId, 'gemini_audio', audioTokens)

      return true
    } catch (error) {
      console.error('Error sending audio to Gemini realtime session:', error)
      throw new Error('Failed to send audio data')
    }
  }

  // Send image data to Gemini realtime session
  async sendImage(sessionId: string, imageData: ImageData, message: string = "Please analyze this image based on our conversation context."): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      throw new Error('Invalid or inactive session')
    }

    try {
      // Check rate limits
      const imageTokens = this.calculateImageTokens(imageData.width || 1920, imageData.height || 1080)
      await rateLimiter.checkLimit(session.userId, 'gemini_image', imageTokens)

      console.log('Sending image to realtime session:', sessionId)

      // Convert base64 image to proper format for Gemini
      const imgData = imageData.data.startsWith('data:') 
        ? imageData.data.split(',')[1] 
        : imageData.data

      // Send image to realtime session like desktop app
      await session.liveSession.sendRealtimeInput({
        media: {
          data: imgData,
          mimeType: imageData.mimeType
        }
      })

      // Track image usage
      session.tokensUsed += imageTokens
      await rateLimiter.recordUsage(session.userId, 'gemini_image', imageTokens)

      return true
    } catch (error) {
      console.error('Error sending image to Gemini realtime session:', error)
      throw new Error('Failed to send image data')
    }
  }

  // Send text message to Gemini realtime session
  async sendText(sessionId: string, message: string): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      throw new Error('Invalid or inactive session')
    }

    try {
      // Check rate limits
      const textTokens = Math.ceil(message.length / 4) // Approximate token count
      await rateLimiter.checkLimit(session.userId, 'gemini_text', textTokens)

      console.log('Sending text to realtime session:', sessionId)

      // Send text message to realtime session like desktop app
      await session.liveSession.sendRealtimeInput({
        text: message.trim()
      })

      // Track text usage
      session.tokensUsed += textTokens
      await rateLimiter.recordUsage(session.userId, 'gemini_text', textTokens)

      return true
    } catch (error) {
      console.error('Error sending text to Gemini realtime session:', error)
      throw new Error('Failed to send text message')
    }
  }

  // Close Gemini realtime session
  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return // Session already closed or doesn't exist
    }

    try {
      if (session.liveSession && session.isActive) {
        await session.liveSession.close()
      }
      session.isActive = false
      this.sessions.delete(sessionId)
      this.reconnectionAttempts.delete(sessionId)
    } catch (error) {
      console.error('Error closing Gemini realtime session:', error)
      // Still remove from sessions map even if close fails
      this.sessions.delete(sessionId)
      this.reconnectionAttempts.delete(sessionId)
    }
  }

  // Restore session from database (for hot reloads/server restarts)
  async restoreSession(
    sessionId: string, 
    userId: string, 
    profile: string = 'interview', 
    language: string = 'en-US'
  ): Promise<void> {
    try {
      console.log('Restoring Gemini realtime session from database:', sessionId)

      // Re-initialize as new realtime session since live sessions can't be restored
      const newSessionId = await this.initializeSession(userId, profile, language, '', true)

      if (!newSessionId) {
        throw new Error('Failed to initialize new session during restore')
      }

      // Move the newly created session into the original sessionId slot so callers
      // that expect the DB session id can find it in memory.
      const newSession = this.sessions.get(newSessionId)
      if (!newSession) {
        throw new Error('Failed to find newly initialized session during restore')
      }

      // Remove the temporary session key and re-key it to the original sessionId
      this.sessions.delete(newSessionId)
      newSession.id = sessionId
      this.sessions.set(sessionId, newSession)

      console.log('Session restored successfully:', sessionId)

    } catch (error) {
      console.error('Failed to restore Gemini realtime session:', error)
      throw new Error('Failed to restore AI session')
    }
  }

  // Save conversation turn like desktop app
  private saveConversationTurn(sessionId: string, transcription: string, aiResponse: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const conversationTurn = {
      timestamp: Date.now(),
      transcription: transcription.trim(),
      ai_response: aiResponse.trim(),
    }

    session.conversationHistory.push(conversationTurn)
    console.log('Saved conversation turn:', conversationTurn)
  }

  // Attempt reconnection like desktop app
  private async attemptReconnection(
    sessionId: string,
    userId: string,
    profile: string,
    language: string,
    customPrompt: string,
    googleSearchEnabled: boolean,
    callbacks?: GeminiSession['callbacks']
  ): Promise<boolean> {
    // Avoid concurrent reconnection attempts for same session
    if (this.reconnectionLocks.has(sessionId)) {
      console.log('Reconnection already in progress for:', sessionId)
      return false
    }

    this.reconnectionLocks.add(sessionId)
    try {
      let attempts = this.reconnectionAttempts.get(sessionId) || 0
      while (attempts < this.maxReconnectionAttempts) {
        const delay = this.reconnectionDelay * Math.pow(2, attempts) // exponential backoff
        console.log(`Attempting reconnection ${attempts + 1}/${this.maxReconnectionAttempts} after ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))

        try {
          const newSessionId = await this.initializeSession(userId, profile, language, customPrompt, googleSearchEnabled, callbacks)
          if (newSessionId) {
            const oldSession = this.sessions.get(sessionId)
            const newSession = this.sessions.get(newSessionId)

            if (newSession) {
              // Preserve conversation history if possible
              if (oldSession && Array.isArray(oldSession.conversationHistory)) {
                newSession.conversationHistory = oldSession.conversationHistory
              }

              // Move new session into the old session id slot
              this.sessions.delete(newSessionId)
              this.sessions.set(sessionId, { ...newSession, id: sessionId })

              console.log('Live session reconnected for:', sessionId)
              this.reconnectionAttempts.delete(sessionId)
              return true
            }
          }
        } catch (err) {
          console.error(`Reconnection attempt ${attempts + 1} failed:`, err)
        }

        attempts += 1
        this.reconnectionAttempts.set(sessionId, attempts)
      }

      console.log('All reconnection attempts failed for session:', sessionId)
      return false
    } finally {
      this.reconnectionLocks.delete(sessionId)
    }
  }

  // Get session info
  getSession(sessionId: string): GeminiSession | undefined {
    return this.sessions.get(sessionId)
  }

  // Get all active sessions for a user
  getUserSessions(userId: string): GeminiSession[] {
    return Array.from(this.sessions.values()).filter(session => 
      session.userId === userId && session.isActive
    )
  }

  // Calculate image tokens based on Gemini 2.0 rules
  private calculateImageTokens(width: number, height: number): number {
    // Images ≤384px in both dimensions = 258 tokens
    if (width <= 384 && height <= 384) {
      return 258
    }

    // Larger images are tiled into 768x768 chunks, each = 258 tokens
    const tilesX = Math.ceil(width / 768)
    const tilesY = Math.ceil(height / 768)
    const totalTiles = tilesX * tilesY

    return totalTiles * 258
  }

  // Calculate audio tokens (32 tokens per second)
  private calculateAudioTokens(audioChunk: AudioChunk): number {
    // Estimate duration based on data size and sample rate
    const sampleRate = audioChunk.sampleRate || 24000
    const channels = audioChunk.channels || 1
    const bytesPerSample = 2 // 16-bit audio
    
    const audioBuffer = Buffer.from(audioChunk.data, 'base64')
    const durationSeconds = audioBuffer.length / (sampleRate * channels * bytesPerSample)
    
    return Math.ceil(durationSeconds * 32) // 32 tokens per second
  }

  // Cleanup inactive sessions
  async cleanupInactiveSessions(): Promise<void> {
    const now = Date.now()
    const maxInactiveTime = 30 * 60 * 1000 // 30 minutes

    const sessionIds = Array.from(this.sessions.keys())
    for (const sessionId of sessionIds) {
      const session = this.sessions.get(sessionId)
      if (session) {
        const inactiveTime = now - session.startedAt.getTime()
        if (inactiveTime > maxInactiveTime) {
          await this.closeSession(sessionId)
        }
      }
    }
  }
}

// Export singleton instance
export const geminiProvider = new GeminiProvider()