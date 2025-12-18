import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { loginSchema, createApiResponse } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const { email, password } = loginSchema.parse(body)
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
        usage: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Invalid email or password'),
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await auth.verifyPassword(password, user.passwordHash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Invalid email or password'),
        { status: 401 }
      )
    }
    
    // Generate tokens
    const accessToken = auth.generateToken({
      userId: user.id,
      email: user.email,
    })
    
    const refreshToken = auth.generateRefreshToken({
      userId: user.id,
      email: user.email,
    })
    
    // Store session
    await auth.createSession(user.id, accessToken)
    
    // Clean up user data for response
    const { passwordHash, ...userWithoutPassword } = user
    
    return NextResponse.json(
      createApiResponse(true, {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      }, 'Login successful')
    )
    
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        createApiResponse(false, null, '', error.message),
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      createApiResponse(false, null, '', 'Internal server error'),
      { status: 500 }
    )
  }
}