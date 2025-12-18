# Elk AI Backend - Realtime Audio Integration

This backend now supports **realtime audio streaming** exactly like the desktop app, using Gemini's live API for live audio processing and transcription.

## Key Changes Made

### 1. Updated Dependencies
- ✅ Changed from `@google/generative-ai` to `@google/genai` (same as desktop app)
- ✅ Added WebSocket support with `ws` package
- ✅ Updated `next.config.js` for WebSocket compatibility

### 2. Realtime Gemini Provider (`lib/ai-providers/gemini.ts`)
- ✅ **Replaced standard Gemini API with realtime API** (`gemini-live-2.5-flash-preview`)
- ✅ **Live session callbacks** (`onopen`, `onmessage`, `onerror`, `onclose`)
- ✅ **Speaker diarization** (2 speakers: Interviewer/Candidate)
- ✅ **Automatic reconnection** (like desktop app)
- ✅ **Real-time audio streaming** via `sendRealtimeInput({ audio })`

### 3. WebSocket Server (`lib/websocket-server.ts`)
- ✅ **Persistent connections** for realtime streaming
- ✅ **Authentication** via JWT tokens
- ✅ **Real-time callbacks** (transcription, responses, completion)
- ✅ **Session management** (initialize, send audio/text/image, close)
- ✅ **Heartbeat mechanism** for connection health

### 4. Updated API Routes
- ✅ **`/api/ai/gemini/send-audio`**: Returns success status, responses via WebSocket
- ✅ **`/api/ai/gemini/conversation`**: Handles realtime sessions
- ✅ **`/api/ai/gemini/initialize`**: Creates realtime sessions with callbacks

### 5. Custom Server (`server.js`)
- ✅ **WebSocket integration** with Next.js
- ✅ **Production-ready** server setup

## Audio Flow Comparison

### Desktop App Flow:
```
Audio Capture → Base64 PCM → sendRealtimeInput(audio) → Gemini Live → Transcription + AI Response
```

### Backend Flow (Now):
```
Client → WebSocket → Base64 PCM → sendRealtimeInput(audio) → Gemini Live → WebSocket Callbacks → Client
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd elk-backend
npm install
```

### 2. Environment Variables
Ensure `.env` has:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret
# ... other vars
```

### 3. Run the Server
```bash
# Development with WebSocket support
npm run dev

# Production
npm run build
npm start
```

## Testing Realtime Audio

### 1. Using the Test Script
```bash
# Update TEST_TOKEN in test-realtime-audio.js
node test-realtime-audio.js
```

### 2. WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/api/ai/gemini/realtime?token=YOUR_JWT_TOKEN')

// Initialize session
ws.send(JSON.stringify({
  type: 'initialize_session',
  profile: 'interview',
  language: 'en-US'
}))

// Send audio (base64 PCM)
ws.send(JSON.stringify({
  type: 'send_audio',
  audioData: 'base64_pcm_data_here',
  mimeType: 'audio/pcm;rate=24000'
}))
```

### 3. Expected WebSocket Messages
```javascript
// Session initialized
{ type: 'session_initialized', sessionId: 'abc123' }

// Real-time transcription
{ type: 'transcription', data: '[Interviewer]: Hello, how are you?' }

// AI response chunks
{ type: 'response', data: 'Hello! I am doing well...' }

// Complete turn
{ type: 'complete', transcription: '...', response: '...' }
```

## Audio Format Requirements

Same as desktop app:
- **Format**: PCM (raw audio)
- **Sample Rate**: 24,000 Hz
- **Channels**: 1 (mono) or 2 (stereo, converted to mono)
- **Bit Depth**: 16-bit
- **Encoding**: Base64
- **MIME Type**: `audio/pcm;rate=24000`

## API Endpoints

### HTTP Endpoints (for compatibility)
- `POST /api/ai/gemini/initialize` - Initialize session
- `POST /api/ai/gemini/send-audio` - Send audio (returns success, responses via WS)
- `POST /api/ai/gemini/conversation` - Send text/image/audio

### WebSocket Endpoint (recommended for realtime)
- `ws://localhost:3000/api/ai/gemini/realtime` - Full realtime streaming

## Architecture Benefits

1. **Real-time Processing**: Audio streams directly to Gemini Live API
2. **Desktop App Parity**: Uses exact same models and configuration
3. **Persistent Connections**: WebSocket for low-latency streaming
4. **Scalable**: Multiple concurrent realtime sessions
5. **Fallback Support**: HTTP endpoints for simple requests

## Next Steps

1. **Connect Desktop App**: Update desktop app to use backend WebSocket instead of direct Gemini API
2. **Mobile App**: Build mobile clients using WebSocket connection
3. **Web Interface**: Create web-based realtime audio interface
4. **Load Balancing**: Scale WebSocket servers for production

## Troubleshooting

### Common Issues:
1. **"Invalid API key"**: Check `GEMINI_API_KEY` in `.env`
2. **WebSocket connection fails**: Ensure server runs on correct port
3. **Audio not processing**: Verify base64 PCM format matches desktop app
4. **Session timeout**: Check authentication token validity

### Debug Mode:
```bash
DEBUG_AUDIO=1 npm run dev
```

This will log detailed audio processing information like the desktop app.