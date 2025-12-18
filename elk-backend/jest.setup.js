import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret'
process.env.GEMINI_API_KEY = 'test-gemini-api-key'
process.env.GOOGLE_API_KEY = 'test-google-api-key'
process.env.PERPLEXITY_API_KEY = 'test-perplexity-api-key'
process.env.PAYPAL_CLIENT_ID = 'test-paypal-client-id'
process.env.PAYPAL_CLIENT_SECRET = 'test-paypal-client-secret'

// Mock Prisma Client
jest.mock('./lib/db', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    subscription: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    usage: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    aISession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    conversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    rateLimit: {
      findFirst: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))