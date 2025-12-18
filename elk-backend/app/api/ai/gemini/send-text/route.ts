import { NextRequest, NextResponse } from 'next/server'
import { geminiProvider } from '@/lib/ai-providers/gemini'
import { auth } from '@/lib/auth'
import { createApiResponse } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth.getAuthenticatedUser(request)
    const body = await request.json()
    
    const { sessionId, text } = body
    
    if (!sessionId || !text) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Session ID and text are required'),
        { status: 400 }
      )
    }
    
    // Send text to Gemini session
    const response = await geminiProvider.sendText(sessionId, text)
    
    return NextResponse.json(
      createApiResponse(true, response, 'Text sent successfully')
    )
    
  } catch (error) {
    console.error('Send text error:', error)
    
    let errorMessage = 'Failed to send text'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('Session not found')) {
        errorMessage = error.message
        statusCode = 404
      } else if (error.message.includes('rate limit')) {
        errorMessage = error.message
        statusCode = 429
      }
    }
    
    return NextResponse.json(
      createApiResponse(false, null, '', errorMessage),
      { status: statusCode }
    )
  }
}
