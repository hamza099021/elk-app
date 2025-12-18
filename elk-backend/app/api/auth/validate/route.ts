import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { createApiResponse } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from token
    const user = await auth.getAuthenticatedUser(request)
    
    // Fetch full user data with subscription
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: true,
        usage: true,
      },
    })
    
    if (!fullUser) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'User not found'),
        { status: 401 }
      )
    }
    
    // Clean up user data for response
    const { passwordHash, ...userWithoutPassword } = fullUser
    
    return NextResponse.json(
      createApiResponse(true, {
        user: userWithoutPassword,
        valid: true,
      }, 'Token is valid')
    )
    
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      createApiResponse(false, { valid: false }, '', 'Invalid or expired token'),
      { status: 401 }
    )
  }
}
