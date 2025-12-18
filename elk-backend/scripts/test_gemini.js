#!/usr/bin/env node
// Test script for Gemini Live model (gemini-live-2.5-flash-preview)
// Requires: npm i @google/genai

const { GoogleGenAI } = require('@google/genai')

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || ""
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set. Set environment variable and retry.')
    process.exit(1)
  }

  const client = new GoogleGenAI({ vertexai: false, apiKey })

  console.log('Checking Gemini Live model: gemini-live-2.5-flash-preview')

  try {
    // Open a live session and send a text message to verify model response
    // Note: callbacks must be provided to `connect()` — assigning `live.callbacks` later
    // does not reliably register handlers with the SDK. We assemble parts here.
    let messageBuffer = 'Give me basics of software development. Keep it less than 100 words.'
    const live = await client.live.connect({
      model: 'gemini-live-2.5-flash-preview',
      callbacks: {
        onopen: () => console.log('Live connection opened'),
        onmessage: (msg) => {
          try {
            const sc = (msg && msg.serverContent) || {}

            // Collect model generated text parts
            const parts = sc.modelTurn?.parts || []
            if (Array.isArray(parts) && parts.length > 0) {
              for (const p of parts) {
                if (p?.text) {
                  messageBuffer += p.text
                  console.log('Partial response:', messageBuffer)
                }
              }
            }

            // On generationComplete, print final assembled text
            if (sc.generationComplete) {
              console.log('\n=== Final Assembled Response ===')
              console.log(messageBuffer.trim())
              console.log('=== End Response ===\n')
            }
          } catch (e) {
            console.debug('Parse live message error:', e)
          }
        },
        onerror: (e) => console.error('SDK live error:', e?.message || e),
        onclose: () => console.log('Live connection closed')
      },
      // Keep config minimal for a quick check
      config: { responseModalities: ['TEXT'] },
    })

    if (!live) {
      console.error('Unexpected response: live object not returned')
      process.exit(2)
    }

    console.log('SUCCESS: Live session created. Sending a test text message...')

    // Send the requested message
    try {
      await live.sendRealtimeInput({ text: 'Give me the basics of software development.' })
    } catch (e) {
      console.error('Failed to send realtime input:', e?.message || e)
    }

    // Wait a bit to receive streaming responses (increase if needed)
    await new Promise((resolve) => setTimeout(resolve, 12000))

    try {
      await live.close()
    } catch (e) {
      console.warn('Warning closing live session:', e?.message || e)
    }

    console.log('Done')
    process.exit(0)

  } catch (err) {
    console.error('Gemini test failed')
    if (err && err.response) {
      console.error('Status:', err.response.status)
      console.error('Body:', JSON.stringify(err.response.data, null, 2))
    } else if (err && err.message) {
      console.error('Error message:', err.message)
    } else {
      console.error(err)
    }
    process.exit(3)
  }
}

main()
