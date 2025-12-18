/**
 * Test script for realtime audio integration with Gemini
 * This tests the same functionality as the desktop app but through the backend
 */

const WebSocket = require('ws')
const fs = require('fs')
const path = require('path')

// Test configuration
const WS_URL = 'ws://localhost:3000/api/ai/gemini/realtime'
const TEST_TOKEN = 'your-test-token-here' // Replace with actual auth token
const AUDIO_FILE_PATH = path.join(__dirname, 'test-audio.pcm') // Optional: test with actual audio file

class RealtimeAudioTest {
  constructor() {
    this.ws = null
    this.sessionId = null
    this.connected = false
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log('Connecting to WebSocket server...')
      
      this.ws = new WebSocket(`${WS_URL}?token=${TEST_TOKEN}`)
      
      this.ws.on('open', () => {
        console.log('✅ WebSocket connected successfully')
        this.connected = true
        resolve(true)
      })
      
      this.ws.on('message', (data) => {
        this.handleMessage(JSON.parse(data.toString()))
      })
      
      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message)
        reject(error)
      })
      
      this.ws.on('close', () => {
        console.log('🔌 WebSocket connection closed')
        this.connected = false
      })
    })
  }

  handleMessage(message) {
    console.log('📨 Received message:', message.type)
    
    switch (message.type) {
      case 'connection':
        console.log('✅ Connection established:', message.message)
        break
        
      case 'session_initialized':
        this.sessionId = message.sessionId
        console.log('✅ Session initialized:', this.sessionId)
        break
        
      case 'transcription':
        console.log('🎤 Transcription:', message.data)
        break
        
      case 'response':
        console.log('🤖 AI Response:', message.data)
        break
        
      case 'complete':
        console.log('✅ Turn complete')
        console.log('   Transcription:', message.transcription)
        console.log('   Response:', message.response)
        break
        
      case 'error':
        console.error('❌ Error:', message.message)
        break
        
      case 'session_closed':
        console.log('🔒 Session closed:', message.message)
        this.sessionId = null
        break
        
      default:
        console.log('❓ Unknown message type:', message.type, message)
    }
  }

  async initializeSession(profile = 'interview', language = 'en-US') {
    if (!this.connected) {
      throw new Error('WebSocket not connected')
    }
    
    console.log('🚀 Initializing Gemini session...')
    
    this.ws.send(JSON.stringify({
      type: 'initialize_session',
      profile,
      language,
      customPrompt: 'You are an AI assistant helping with interview preparation.',
      googleSearchEnabled: true
    }))
    
    // Wait for session to be initialized
    return new Promise((resolve) => {
      const checkSession = () => {
        if (this.sessionId) {
          resolve(this.sessionId)
        } else {
          setTimeout(checkSession, 100)
        }
      }
      checkSession()
    })
  }

  sendText(text) {
    if (!this.connected || !this.sessionId) {
      throw new Error('No active session')
    }
    
    console.log('📝 Sending text:', text)
    
    this.ws.send(JSON.stringify({
      type: 'send_text',
      text
    }))
  }

  sendAudio(audioData, mimeType = 'audio/pcm;rate=24000') {
    if (!this.connected || !this.sessionId) {
      throw new Error('No active session')
    }
    
    console.log('🎵 Sending audio data...')
    
    this.ws.send(JSON.stringify({
      type: 'send_audio',
      audioData,
      mimeType
    }))
  }

  sendTestAudioChunk() {
    // Generate test PCM audio data (sine wave)
    const sampleRate = 24000
    const frequency = 440 // A4 note
    const duration = 1 // 1 second
    const samples = sampleRate * duration
    
    const buffer = Buffer.alloc(samples * 2) // 16-bit samples
    
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 32767
      buffer.writeInt16LE(sample, i * 2)
    }
    
    const base64Audio = buffer.toString('base64')
    this.sendAudio(base64Audio, 'audio/pcm;rate=24000')
  }

  sendRealAudioFile() {
    if (!fs.existsSync(AUDIO_FILE_PATH)) {
      console.log('⚠️ No test audio file found at:', AUDIO_FILE_PATH)
      return false
    }
    
    try {
      const audioBuffer = fs.readFileSync(AUDIO_FILE_PATH)
      const base64Audio = audioBuffer.toString('base64')
      this.sendAudio(base64Audio, 'audio/pcm;rate=24000')
      return true
    } catch (error) {
      console.error('❌ Error reading audio file:', error.message)
      return false
    }
  }

  async closeSession() {
    if (!this.connected || !this.sessionId) {
      return
    }
    
    console.log('🔒 Closing session...')
    
    this.ws.send(JSON.stringify({
      type: 'close_session'
    }))
  }

  close() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

async function runTest() {
  const test = new RealtimeAudioTest()
  
  try {
    console.log('🧪 Starting Realtime Audio Integration Test')
    console.log('=' .repeat(50))
    
    // Connect to WebSocket
    await test.connect()
    
    // Initialize session
    const sessionId = await test.initializeSession()
    console.log('Session ID:', sessionId)
    
    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Test 1: Send text message
    console.log('\n📝 Test 1: Sending text message...')
    test.sendText('Hello! Can you hear me? This is a test message for the realtime session.')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Test 2: Send generated test audio
    console.log('\n🎵 Test 2: Sending generated test audio...')
    test.sendTestAudioChunk()
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Test 3: Send real audio file if available
    console.log('\n🎧 Test 3: Sending real audio file (if available)...')
    const audioSent = test.sendRealAudioFile()
    if (audioSent) {
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
    
    // Test 4: Another text message
    console.log('\n📝 Test 4: Sending follow-up text...')
    test.sendText('Did you receive and process the audio correctly? What did you hear?')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Close session
    await test.closeSession()
    
    console.log('\n✅ Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    test.close()
    process.exit(0)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  console.log('Usage:')
  console.log('1. Update TEST_TOKEN with a valid authentication token')
  console.log('2. Make sure the backend server is running on localhost:3000')
  console.log('3. Run: node test-realtime-audio.js')
  console.log('')
  
  if (TEST_TOKEN === 'your-test-token-here') {
    console.error('❌ Please update TEST_TOKEN with a valid authentication token')
    process.exit(1)
  }
  
  runTest()
}

module.exports = RealtimeAudioTest