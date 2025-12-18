import { NextRequest, NextResponse } from 'next/server'
import { geminiProvider } from '@/lib/ai-providers/gemini'
import { auth } from '@/lib/auth'
import { createApiResponse, conversationSchema } from '@/lib/validation'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth.getAuthenticatedUser(request)
    const body = await request.json()
    
    // Validate request body
    const { sessionId, userInput, inputType, audioData, imageData, mimeType } = conversationSchema.parse(body)
    
    // Verify session belongs to user - check in memory first, then database
    let session = geminiProvider.getSession(sessionId)
    
    if (!session) {
      // Session not in memory, check database (happens after hot reloads)
      const dbSession = await prisma.aISession.findUnique({
        where: { id: sessionId },
        select: { userId: true, profile: true, language: true }
      })
      
      if (!dbSession || dbSession.userId !== user.id) {
        return NextResponse.json(
          createApiResponse(false, null, '', 'Invalid session or unauthorized access'),
          { status: 403 }
        )
      }
      
      // Restore session in memory by re-initializing with same sessionId
      try {
        await geminiProvider.restoreSession(sessionId, user.id, dbSession.profile, dbSession.language)
        session = geminiProvider.getSession(sessionId)
        if (!session) {
          throw new Error('Failed to restore session')
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
        return NextResponse.json(
          createApiResponse(false, null, '', 'Failed to restore session'),
          { status: 500 }
        )
      }
    } else if (session.userId !== user.id) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Invalid session or unauthorized access'),
        { status: 403 }
      )
    }

    // Handle different input types
    switch (inputType) {
      case 'text':
        if (!userInput) {
          return NextResponse.json(
            createApiResponse(false, null, '', 'Text message is required for text input'),
            { status: 400 }
          )
        }
        const textSuccess = await geminiProvider.sendText(sessionId, userInput)
        
        return NextResponse.json(
          createApiResponse(true, {
            success: textSuccess,
            sessionId,
            inputType,
            message: 'Text sent to realtime session. Responses will be received via WebSocket callbacks.'
          }, 'Text sent successfully to realtime session')
        )

      case 'image':
        if (!imageData || !mimeType) {
          return NextResponse.json(
            createApiResponse(false, null, '', 'Image data and mime type are required for image input'),
            { status: 400 }
          )
        }
        const imageMessage = userInput || "What do you see in this image? Please analyze it based on our conversation context."
        const imageSuccess = await geminiProvider.sendImage(sessionId, {
          data: imageData,
          mimeType,
        }, imageMessage)
        
        return NextResponse.json(
          createApiResponse(true, {
            success: imageSuccess,
            sessionId,
            inputType,
            message: 'Image sent to realtime session. Responses will be received via WebSocket callbacks.'
          }, 'Image sent successfully to realtime session')
        )

      case 'audio':
        if (!audioData || !mimeType) {
          return NextResponse.json(
            createApiResponse(false, null, '', 'Audio data and mime type are required for audio input'),
            { status: 400 }
          )
        }
        const audioSuccess = await geminiProvider.sendAudio(sessionId, {
          data: audioData,
          mimeType,
        })
        
        // For realtime audio, return success status since responses come via WebSocket
        return NextResponse.json(
          createApiResponse(true, {
            success: audioSuccess,
            sessionId,
            inputType,
            message: 'Audio sent to realtime session. Responses will be received via WebSocket callbacks.'
          }, 'Audio sent successfully to realtime session')
        )

      default:
        return NextResponse.json(
          createApiResponse(false, null, '', 'Invalid input type. Must be text, image, or audio'),
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Conversation processing error:', error)
    
    let errorMessage = 'Failed to process message'
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