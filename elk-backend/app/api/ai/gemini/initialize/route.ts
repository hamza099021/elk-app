import { NextRequest, NextResponse } from 'next/server'
import { geminiProvider } from '@/lib/ai-providers/gemini'
import { auth } from '@/lib/auth'
import { createApiResponse, createAISessionSchema } from '@/lib/validation'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth.getAuthenticatedUser(request)
    const body = await request.json()
    
    // Validate request body
    const { sessionType, profile, language } = createAISessionSchema.parse(body)
    const customPrompt = body.customPrompt || ''
    const googleSearchEnabled = body.googleSearchEnabled !== false
    
    // Initialize Gemini session
    const sessionId = await geminiProvider.initializeSession(
      user.id,
      profile,
      language,
      customPrompt,
      googleSearchEnabled
    )
    
    // Store session in database
    await prisma.aISession.create({
      data: {
        id: sessionId,
        userId: user.id,
        sessionType,
        profile,
        language,
      },
    })
    
    return NextResponse.json(
      createApiResponse(true, {
        sessionId,
        profile,
        language,
        googleSearchEnabled,
      }, 'AI session initialized successfully')
    )
    
  } catch (error) {
    console.error('AI session initialization error:', error)
    
    let errorMessage = 'Failed to initialize AI session'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('limit exceeded')) {
        errorMessage = error.message
        statusCode = 429
      } else if (error.message.includes('Validation error')) {
        errorMessage = error.message
        statusCode = 400
      }
    }
    
    return NextResponse.json(
      createApiResponse(false, null, '', errorMessage),
      { status: statusCode }
    )
  }
}