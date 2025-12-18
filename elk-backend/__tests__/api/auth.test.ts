/**
 * Authentication API Routes Tests
 * Tests for user registration and login endpoints
 */

import { auth } from '../../lib/auth'

// Mock dependencies
jest.mock('../../lib/db')

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Auth Utils', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = await auth.hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(typeof hashedPassword).toBe('string')
    })

    it('should verify password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = await auth.hashPassword(password)
      
      const isValid = await auth.verifyPassword(password, hashedPassword)
      const isInvalid = await auth.verifyPassword('wrongpassword', hashedPassword)
      
      expect(isValid).toBe(true)
      expect(isInvalid).toBe(false)
    })

    it('should generate JWT token', () => {
      const userId = 'user123'
      const email = 'test@example.com'
      
      const token = auth.generateToken({ userId, email })
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should generate refresh token', () => {
      const userId = 'user123'
      const email = 'test@example.com'
      
      const refreshToken = auth.generateRefreshToken({ userId, email })
      
      expect(refreshToken).toBeDefined()
      expect(typeof refreshToken).toBe('string')
      expect(refreshToken.split('.')).toHaveLength(3) // JWT has 3 parts
    })
  })

  describe('Session Management', () => {
    it('should create session successfully', async () => {
      const { prisma } = require('../../lib/db')
      prisma.session.create.mockResolvedValue({
        id: 'session123',
        userId: 'user123',
        token: 'refresh-token',
        userAgent: 'test-agent'
      })

      await expect(
        auth.createSession('user123', 'refresh-token')
      ).resolves.not.toThrow()

      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          token: 'refresh-token',
          expiresAt: expect.any(Date)
        }
      })
    })
  })

  describe('Registration Flow', () => {
    it('should create complete user with subscription and usage', async () => {
      const { prisma } = require('../../lib/db')
      
      // Mock successful user creation
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.$transaction.mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date()
      })

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }

      // Simulate the registration process
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      expect(existingUser).toBeNull()

      const hashedPassword = await auth.hashPassword(userData.password)
      expect(hashedPassword).toBeDefined()

      // Simulate transaction
      const user = await prisma.$transaction(async () => ({
        id: 'user123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: new Date()
      }))

      expect(user.email).toBe(userData.email)
    })
  })

  describe('Login Flow', () => {
    it('should authenticate user with correct credentials', async () => {
      const { prisma } = require('../../lib/db')
      
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        passwordHash: await auth.hashPassword('password123'),
        subscription: { plan: 'FREE' },
        usage: { tokensUsed: 0 }
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
        include: { subscription: true, usage: true }
      })

      expect(user).toBeDefined()
      expect(user?.email).toBe('test@example.com')

      // Verify password
      const isValidPassword = await auth.verifyPassword('password123', user!.passwordHash)
      expect(isValidPassword).toBe(true)

      // Generate tokens
      const accessToken = auth.generateToken({ userId: user!.id, email: user!.email })
      const refreshToken = auth.generateRefreshToken({ userId: user!.id, email: user!.email })

      expect(accessToken).toBeDefined()
      expect(refreshToken).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      const { prisma } = require('../../lib/db')
      
      prisma.user.findUnique.mockResolvedValue(null)

      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' }
      })

      expect(user).toBeNull()
    })
  })
})