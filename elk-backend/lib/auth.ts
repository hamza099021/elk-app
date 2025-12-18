import * as jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'

export interface AuthUser {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
}

export interface TokenPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

export const auth = {
  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  },

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  },

  // Generate JWT token
  generateToken(payload: { userId: string; email: string }, expiresIn: string = JWT_EXPIRES_IN): string {
    return (jwt as any).sign(payload, JWT_SECRET, { expiresIn })
  },

  // Verify JWT token
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload
    } catch (error) {
      throw new AuthError('Invalid or expired token')
    }
  },

  // Generate refresh token
  generateRefreshToken(payload: { userId: string; email: string }): string {
    return this.generateToken(payload, REFRESH_TOKEN_EXPIRES_IN)
  },

  // Extract token from Authorization header
  extractToken(request: NextRequest): string {
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AuthError('No token provided')
    }
    return authorization.slice(7)
  },

  // Get authenticated user from request
  async getAuthenticatedUser(request: NextRequest): Promise<AuthUser> {
    try {
      const token = this.extractToken(request)
      const payload = this.verifyToken(token)
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      })

      if (!user) {
        throw new AuthError('User not found')
      }

      return user
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Authentication failed')
    }
  },

  // Create session in database
  async createSession(userId: string, token: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    })
  },

  // Delete session from database
  async deleteSession(token: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { token },
    })
  },

  // Validate session exists and is not expired
  async validateSession(token: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { token },
    })

    if (!session || session.expiresAt < new Date()) {
      return false
    }

    return true
  },

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  },
}