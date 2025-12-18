import { auth } from '../lib/auth'
import { prisma } from '../lib/db'

// Mock Prisma
jest.mock('../lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = await auth.hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123'
      const hashedPassword = await auth.hashPassword(password)
      
      const isValid = await auth.verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hashedPassword = await auth.hashPassword(password)
      
      const isValid = await auth.verifyPassword(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const payload = { userId: 'user123', email: 'test@example.com' }
      const token = auth.generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const payload = { userId: 'user123', email: 'test@example.com' }
      const token = auth.generateToken(payload)
      
      const decoded = auth.verifyToken(token)
      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
    })

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here'
      
      expect(() => {
        auth.verifyToken(invalidToken)
      }).toThrow()
    })
  })

  describe('createSession', () => {
    it('should create session in database', async () => {
      const userId = 'user123'
      const token = 'token123'
      
      const mockCreate = prisma.session.create as jest.Mock
      mockCreate.mockResolvedValue({ userId, token })
      
      await auth.createSession(userId, token)
      
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId,
          token,
          expiresAt: expect.any(Date),
        },
      })
    })
  })

  describe('validateSession', () => {
    it('should return true for valid session', async () => {
      const token = 'valid_token'
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      
      const mockFindUnique = prisma.session.findUnique as jest.Mock
      mockFindUnique.mockResolvedValue({
        token,
        expiresAt: futureDate,
      })
      
      const isValid = await auth.validateSession(token)
      expect(isValid).toBe(true)
    })

    it('should return false for expired session', async () => {
      const token = 'expired_token'
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      
      const mockFindUnique = prisma.session.findUnique as jest.Mock
      mockFindUnique.mockResolvedValue({
        token,
        expiresAt: pastDate,
      })
      
      const isValid = await auth.validateSession(token)
      expect(isValid).toBe(false)
    })

    it('should return false for non-existent session', async () => {
      const token = 'nonexistent_token'
      
      const mockFindUnique = prisma.session.findUnique as jest.Mock
      mockFindUnique.mockResolvedValue(null)
      
      const isValid = await auth.validateSession(token)
      expect(isValid).toBe(false)
    })
  })
})