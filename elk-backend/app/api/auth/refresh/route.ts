import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { createApiResponse } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body
    
    if (!refreshToken) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Refresh token is required'),
        { status: 400 }
      )
    }
    
    // Verify the refresh token
    let payload
    try {
      payload = auth.verifyToken(refreshToken)
    } catch (error) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Invalid or expired refresh token'),
        { status: 401 }
      )
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        subscription: true,
        usage: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'User not found'),
        { status: 401 }
      )
    }
    
    // Generate new tokens
    const newAccessToken = auth.generateToken({
      userId: user.id,
      email: user.email,
    })
    
    const newRefreshToken = auth.generateRefreshToken({
      userId: user.id,
      email: user.email,
    })
    
    // Store new session
    await auth.createSession(user.id, newAccessToken)
    
    // Clean up user data for response
    const { passwordHash, ...userWithoutPassword } = user
    
    return NextResponse.json(
      createApiResponse(true, {
        user: userWithoutPassword,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }, 'Token refreshed successfully')
    )
    
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      createApiResponse(false, null, '', 'Internal server error'),
      { status: 500 }
    )
  }
}
