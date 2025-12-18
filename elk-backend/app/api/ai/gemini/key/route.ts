import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createApiResponse } from '@/lib/validation'

// This endpoint provides the Gemini API key to authenticated clients
// The key is stored server-side, so clients don't need to manage it
export async function GET(request: NextRequest) {
  try {
    // Authenticate user - only logged in users can get the key
    const user = await auth.getAuthenticatedUser(request)
    
    const geminiKey = process.env.GEMINI_API_KEY
    
    if (!geminiKey) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Gemini API key not configured on server'),
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      createApiResponse(true, {
        apiKey: geminiKey,
      }, 'API key retrieved successfully')
    )
    
  } catch (error) {
    console.error('Get API key error:', error)
    return NextResponse.json(
      createApiResponse(false, null, '', 'Authentication required'),
      { status: 401 }
    )
  }
}
