// WebSocket server for realtime audio streaming like desktop app

import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { geminiProvider } from './ai-providers/gemini'
import { auth } from './auth'

export interface WebSocketClient {
  ws: WebSocket
  userId: string
  sessionId: string | null
  isAlive: boolean
}

class RealtimeWebSocketServer {
  private wss: WebSocketServer | null = null
  private clients: Map<string, WebSocketClient> = new Map()

  initialize(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/ai/gemini/realtime'
    })

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request)
    })

    // Setup heartbeat to detect broken connections
    setInterval(() => {
      this.heartbeat()
    }, 30000) // Every 30 seconds

    console.log('WebSocket server initialized for realtime audio streaming')
  }

  private async handleConnection(ws: WebSocket, request: IncomingMessage) {
    try {
      // Extract auth token from query params or headers
      const url = new URL(request.url || '', `http://${request.headers.host}`)
      const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        ws.close(1008, 'Authentication required')
        return
      }

      // Authenticate user
      const user = await auth.verifyToken(token)
      if (!user) {
        ws.close(1008, 'Invalid authentication token')
        return
      }

      const clientId = `${user.userId}_${Date.now()}`
      const client: WebSocketClient = {
        ws,
        userId: user.userId,
        sessionId: null,
        isAlive: true
      }

      this.clients.set(clientId, client)

      console.log(`WebSocket client connected: ${clientId} for user: ${user.userId}`)

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        this.handleMessage(clientId, data)
      })

      // Handle client disconnect
      ws.on('close', () => {
        console.log(`WebSocket client disconnected: ${clientId}`)
        this.clients.delete(clientId)
      })

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error)
        this.clients.delete(clientId)
      })

      // Handle pong responses for heartbeat
      ws.on('pong', () => {
        const client = this.clients.get(clientId)
        if (client) {
          client.isAlive = true
        }
      })

      // Send connection success
      this.sendToClient(clientId, {
        type: 'connection',
        status: 'connected',
        message: 'WebSocket connection established'
      })

    } catch (error) {
      console.error('Error handling WebSocket connection:', error)
      ws.close(1011, 'Internal server error')
    }
  }

  private async handleMessage(clientId: string, data: Buffer) {
    try {
      const client = this.clients.get(clientId)
      if (!client) {
        return
      }

      const message = JSON.parse(data.toString())

      switch (message.type) {
        case 'initialize_session':
          await this.handleInitializeSession(clientId, message)
          break

        case 'send_audio':
          await this.handleSendAudio(clientId, message)
          break

        case 'send_text':
          await this.handleSendText(clientId, message)
          break

        case 'send_image':
          await this.handleSendImage(clientId, message)
          break

        case 'close_session':
          await this.handleCloseSession(clientId, message)
          break

        default:
          this.sendToClient(clientId, {
            type: 'error',
            message: `Unknown message type: ${message.type}`
          })
      }
    } catch (error) {
      console.error(`Error handling message from client ${clientId}:`, error)
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Failed to process message'
      })
    }
  }

  private async handleInitializeSession(clientId: string, message: any) {
    try {
      const client = this.clients.get(clientId)
      if (!client) return

      const { profile, language, customPrompt, googleSearchEnabled } = message

      // Initialize Gemini session with callbacks for realtime updates
      const sessionId = await geminiProvider.initializeSession(
        client.userId,
        profile || 'interview',
        language || 'en-US',
        customPrompt || '',
        googleSearchEnabled !== false,
        {
          onTranscription: (transcription: string) => {
            this.sendToClient(clientId, {
              type: 'transcription',
              data: transcription
            })
          },
          onResponse: (response: string) => {
            this.sendToClient(clientId, {
              type: 'response',
              data: response
            })
          },
          onComplete: (transcription: string, response: string) => {
            this.sendToClient(clientId, {
              type: 'complete',
              transcription,
              response
            })
          },
          onError: (error: string) => {
            this.sendToClient(clientId, {
              type: 'error',
              message: error
            })
          }
        }
      )

      client.sessionId = sessionId

      this.sendToClient(clientId, {
        type: 'session_initialized',
        sessionId,
        message: 'Realtime session initialized successfully'
      })

    } catch (error) {
      console.error('Error initializing session:', error)
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Failed to initialize session'
      })
    }
  }

  private async handleSendAudio(clientId: string, message: any) {
    try {
      const client = this.clients.get(clientId)
      if (!client || !client.sessionId) {
        this.sendToClient(clientId, {
          type: 'error',
          message: 'No active session'
        })
        return
      }

      const { audioData, mimeType } = message

      await geminiProvider.sendAudio(client.sessionId, {
        data: audioData,
        mimeType: mimeType || 'audio/pcm;rate=24000'
      })

      // Audio sent successfully (response will come via callbacks)
      
    } catch (error) {
      console.error('Error sending audio:', error)
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Failed to send audio'
      })
    }
  }

  private async handleSendText(clientId: string, message: any) {
    try {
      const client = this.clients.get(clientId)
      if (!client || !client.sessionId) {
        this.sendToClient(clientId, {
          type: 'error',
          message: 'No active session'
        })
        return
      }

      await geminiProvider.sendText(client.sessionId, message.text)

      // Text sent successfully (response will come via callbacks)
      
    } catch (error) {
      console.error('Error sending text:', error)
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Failed to send text'
      })
    }
  }

  private async handleSendImage(clientId: string, message: any) {
    try {
      const client = this.clients.get(clientId)
      if (!client || !client.sessionId) {
        this.sendToClient(clientId, {
          type: 'error',
          message: 'No active session'
        })
        return
      }

      const { imageData, mimeType } = message

      await geminiProvider.sendImage(client.sessionId, {
        data: imageData,
        mimeType
      })

      // Image sent successfully (response will come via callbacks)
      
    } catch (error) {
      console.error('Error sending image:', error)
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Failed to send image'
      })
    }
  }

  private async handleCloseSession(clientId: string, message: any) {
    try {
      const client = this.clients.get(clientId)
      if (!client || !client.sessionId) return

      await geminiProvider.closeSession(client.sessionId)
      client.sessionId = null

      this.sendToClient(clientId, {
        type: 'session_closed',
        message: 'Session closed successfully'
      })

    } catch (error) {
      console.error('Error closing session:', error)
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Failed to close session'
      })
    }
  }

  private sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
    }
  }

  private heartbeat() {
    const clientIds = Array.from(this.clients.keys())
    
    for (const clientId of clientIds) {
      const client = this.clients.get(clientId)
      if (!client) continue

      if (!client.isAlive) {
        console.log(`Removing dead WebSocket client: ${clientId}`)
        client.ws.terminate()
        this.clients.delete(clientId)
        continue
      }

      client.isAlive = false
      client.ws.ping()
    }
  }

  broadcast(message: any, excludeClientId?: string) {
    const clientIds = Array.from(this.clients.keys())
    
    for (const clientId of clientIds) {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message)
      }
    }
  }

  getClientCount(): number {
    return this.clients.size
  }
}

export const realtimeWebSocketServer = new RealtimeWebSocketServer()