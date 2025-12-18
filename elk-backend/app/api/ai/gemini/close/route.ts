import { NextRequest, NextResponse } from 'next/server'
import { geminiProvider } from '@/lib/ai-providers/gemini'
import { auth } from '@/lib/auth'
import { createApiResponse } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth.getAuthenticatedUser(request)
    const body = await request.json()
    
    const { sessionId } = body
    
    if (!sessionId) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Session ID is required'),
        { status: 400 }
      )
    }
    
    // Close Gemini session
    await geminiProvider.closeSession(sessionId)
    
    return NextResponse.json(
      createApiResponse(true, { closed: true }, 'Session closed successfully')
    )
    
  } catch (error) {
    console.error('Close session error:', error)
    
    return NextResponse.json(
      createApiResponse(false, null, '', 'Failed to close session'),
      { status: 500 }
    )
  }
}
