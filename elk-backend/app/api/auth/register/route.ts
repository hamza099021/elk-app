import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { registerSchema, createApiResponse } from '@/lib/validation'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const { email, password, firstName, lastName } = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'User with this email already exists'),
        { status: 400 }
      )
    }
    
    // Hash password
    const passwordHash = await auth.hashPassword(password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    })
    
    // Create free subscription for new user
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })
    
    // Create initial usage record
    await prisma.usage.create({
      data: {
        userId: user.id,
      },
    })
    
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
    
    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.firstName || 'User').catch(err => 
      console.error('Failed to send welcome email:', err)
    );
    
    return NextResponse.json(
      createApiResponse(true, {
        user,
        accessToken,
        refreshToken,
      }, 'User registered successfully')
    )
    
  } catch (error) {
    console.error('Registration error:', error)
    
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