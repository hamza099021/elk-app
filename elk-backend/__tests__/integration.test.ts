/**
 * Phase 1 Integration Tests
 * End-to-end tests for the complete backend system
 */

describe('Phase 1 Backend Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('System Components', () => {
    it('should have all required dependencies installed', () => {
      // Test that core dependencies are available
      expect(() => require('@prisma/client')).not.toThrow()
      expect(() => require('jsonwebtoken')).not.toThrow()
      expect(() => require('bcryptjs')).not.toThrow()
      expect(() => require('@google/genai')).not.toThrow()
      expect(() => require('zod')).not.toThrow()
      expect(() => require('framer-motion')).not.toThrow()
    })

    it('should have all core modules available', () => {
      // Test that our core modules can be imported
      expect(() => require('../lib/db')).not.toThrow()
      expect(() => require('../lib/auth')).not.toThrow()
      expect(() => require('../lib/validation')).not.toThrow()
      expect(() => require('../lib/prompts')).not.toThrow()
      // PayPal module requires credentials, so we'll test it separately
      expect(() => require('../lib/validation')).not.toThrow()
    })

    it('should have AI provider modules available', () => {
      // Test that AI providers can be imported
      expect(() => require('../lib/ai-providers/gemini')).not.toThrow()
      expect(() => require('../lib/ai-providers/perplexity')).not.toThrow()
      expect(() => require('../lib/ai-providers/rate-limiter')).not.toThrow()
    })
  })

  describe('Environment Configuration', () => {
    it('should have required environment variables defined in test setup', () => {
      // These should be set in jest.setup.js
      expect(process.env.JWT_SECRET).toBe('test-jwt-secret')
      expect(process.env.JWT_REFRESH_SECRET).toBe('test-jwt-refresh-secret')
      expect(process.env.GOOGLE_API_KEY).toBe('test-google-api-key')
      expect(process.env.PERPLEXITY_API_KEY).toBe('test-perplexity-api-key')
      expect(process.env.DATABASE_URL).toBe('postgresql://test:test@localhost:5432/test')
    })
  })

  describe('Authentication System Integration', () => {
    it('should provide complete auth workflow', async () => {
      const { auth } = require('../lib/auth')
      
      // Test password hashing
      const password = 'testpassword123'
      const hashedPassword = await auth.hashPassword(password)
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)

      // Test password verification
      const isValid = await auth.verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)

      // Test token generation
      const token = auth.generateToken({ userId: 'user123', email: 'test@example.com' })
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      // Test token verification
      const decoded = auth.verifyToken(token)
      expect(decoded.userId).toBe('user123')
      expect(decoded.email).toBe('test@example.com')
    })
  })

  describe('Validation System Integration', () => {
    it('should validate authentication data correctly', () => {
      const { registerSchema, loginSchema } = require('../lib/validation')
      
      // Test valid registration data
      const validRegistration = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }
      expect(() => registerSchema.parse(validRegistration)).not.toThrow()

      // Test invalid registration data
      const invalidRegistration = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: '',
        lastName: ''
      }
      expect(() => registerSchema.parse(invalidRegistration)).toThrow()

      // Test valid login data
      const validLogin = {
        email: 'test@example.com',
        password: 'password123'
      }
      expect(() => loginSchema.parse(validLogin)).not.toThrow()
    })

    it('should validate AI session data correctly', () => {
      const { createAISessionSchema, conversationSchema } = require('../lib/validation')
      
      // Test valid AI session data
      const validSession = {
        profile: 'interview',
        language: 'en',
        sessionType: 'LIVE_CONVERSATION'
      }
      expect(() => createAISessionSchema.parse(validSession)).not.toThrow()

      // Test valid conversation data
      const validConversation = {
        sessionId: 'cludh4r8s0000qzrmz3g00000',
        userInput: 'Hello, AI assistant!',
        inputType: 'text'
      }
      expect(() => conversationSchema.parse(validConversation)).not.toThrow()
    })
  })

  describe('Prompts System Integration', () => {
    it('should provide all required prompts', () => {
      const { getSystemPrompt, profilePrompts } = require('../lib/prompts')
      
      // Test that all profiles have prompts
      const profiles = ['interview', 'sales', 'meeting', 'presentation', 'negotiation', 'exam']
      
      profiles.forEach(profile => {
        const prompt = getSystemPrompt(profile)
        expect(prompt).toBeDefined()
        expect(typeof prompt).toBe('string')
        expect(prompt.length).toBeGreaterThan(0)
      })

      // Test that profilePrompts object exists
      expect(profilePrompts).toBeDefined()
      expect(typeof profilePrompts).toBe('object')
    })
  })

  describe('Database Schema Integration', () => {
    it('should have Prisma client available', () => {
      const { prisma } = require('../lib/db')
      
      expect(prisma).toBeDefined()
      expect(typeof prisma).toBe('object')
      
      // Test that core models are available
      expect(prisma.user).toBeDefined()
      expect(prisma.subscription).toBeDefined()
      expect(prisma.usage).toBeDefined()
      expect(prisma.session).toBeDefined()
      // AISession model should be available
      expect(prisma.aISession).toBeDefined()
      expect(prisma.conversation).toBeDefined()
    })
  })

  describe('PayPal Integration', () => {
    it('should have PayPal module structure', () => {
      // Set required env vars temporarily for this test
      const originalClientId = process.env.PAYPAL_CLIENT_ID
      const originalClientSecret = process.env.PAYPAL_CLIENT_SECRET
      
      process.env.PAYPAL_CLIENT_ID = 'test-client-id'
      process.env.PAYPAL_CLIENT_SECRET = 'test-client-secret'
      
      try {
        const { paypalProvider } = require('../lib/paypal')
        expect(paypalProvider).toBeDefined()
        expect(typeof paypalProvider).toBe('object')
      } finally {
        // Restore original values
        if (originalClientId) process.env.PAYPAL_CLIENT_ID = originalClientId
        if (originalClientSecret) process.env.PAYPAL_CLIENT_SECRET = originalClientSecret
      }
    })
  })

  describe('API Routes Structure', () => {
    it('should have authentication routes', () => {
      expect(() => require('../app/api/auth/register/route')).not.toThrow()
      expect(() => require('../app/api/auth/login/route')).not.toThrow()
    })

    it('should have AI provider routes', () => {
      expect(() => require('../app/api/ai/gemini/initialize/route')).not.toThrow()
      expect(() => require('../app/api/ai/gemini/send-audio/route')).not.toThrow()
      expect(() => require('../app/api/ai/perplexity/search/route')).not.toThrow()
    })
  })

  describe('Frontend Components Structure', () => {
    it('should have main app component', () => {
      expect(() => require('../app/page')).not.toThrow()
    })

    it('should have layout component', () => {
      expect(() => require('../app/layout')).not.toThrow()
    })
  })

  describe('Configuration Files', () => {
    it('should have proper TypeScript configuration', () => {
      const fs = require('fs')
      const path = require('path')
      
      const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json')
      expect(fs.existsSync(tsconfigPath)).toBe(true)
      
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
      expect(tsconfig.compilerOptions).toBeDefined()
      expect(tsconfig.compilerOptions.strict).toBe(true)
    })

    it('should have proper Prisma configuration', () => {
      const fs = require('fs')
      const path = require('path')
      
      const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
      expect(fs.existsSync(schemaPath)).toBe(true)
    })

    it('should have proper Tailwind configuration', () => {
      const fs = require('fs')
      const path = require('path')
      
      const tailwindPath = path.join(__dirname, '..', 'tailwind.config.js')
      expect(fs.existsSync(tailwindPath)).toBe(true)
    })
  })
})