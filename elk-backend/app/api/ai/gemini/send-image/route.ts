import { NextRequest, NextResponse } from 'next/server'
import { geminiProvider } from '@/lib/ai-providers/gemini'
import { auth } from '@/lib/auth'
import { createApiResponse } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth.getAuthenticatedUser(request)
    const body = await request.json()
    
    const { sessionId, imageData, mimeType, prompt } = body
    
    if (!sessionId || !imageData) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Session ID and image data are required'),
        { status: 400 }
      )
    }
    
    // Send image to Gemini session
    const response = await geminiProvider.sendImage(
      sessionId,
      {
        data: imageData,
        mimeType: mimeType || 'image/png',
      },
      prompt
    )
    
    return NextResponse.json(
      createApiResponse(true, response, 'Image processed successfully')
    )
    
  } catch (error) {
    console.error('Send image error:', error)
    
    let errorMessage = 'Failed to process image'
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
