import { NextRequest, NextResponse } from 'next/server'
import { geminiProvider } from '@/lib/ai-providers/gemini'
import { auth } from '@/lib/auth'
import { createApiResponse, conversationSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth.getAuthenticatedUser(request)
    const body = await request.json()
    
    // Validate request body
    const { sessionId, audioData, mimeType } = conversationSchema.parse(body)
    
    if (!audioData || !mimeType) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Audio data and mime type are required'),
        { status: 400 }
      )
    }
    
    // Verify session belongs to user
    const session = geminiProvider.getSession(sessionId)
    if (!session || session.userId !== user.id) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Invalid session or unauthorized access'),
        { status: 403 }
      )
    }
    
    // Send audio to Gemini realtime session (returns boolean, responses come via callbacks/WebSocket)
    const success = await geminiProvider.sendAudio(sessionId, {
      data: audioData,
      mimeType,
    })

    return NextResponse.json(
      createApiResponse(true, {
        success,
        sessionId,
        message: 'Audio sent to realtime session. Responses will be received via WebSocket callbacks.'
      }, 'Audio sent successfully to realtime session')
    )
  } catch (error) {
    console.error('Audio processing error:', error)
    
    let errorMessage = 'Failed to process audio'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('limit exceeded')) {
        errorMessage = error.message
        statusCode = 429
      } else if (error.message.includes('Invalid session')) {
        errorMessage = error.message
        statusCode = 404
      }
    }
    
    return NextResponse.json(
      createApiResponse(false, null, '', errorMessage),
      { status: statusCode }
    )
  }
}