import { z } from 'zod'

// User registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
})

// User login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Password reset schema
export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long'),
})

// Update profile schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
})

// AI session schema
export const createAISessionSchema = z.object({
  sessionType: z.enum(['LIVE_CONVERSATION', 'SCREEN_QA', 'WEB_QUERY']),
  profile: z.string().min(1, 'Profile is required').max(50, 'Profile name too long').default('interview'),
  language: z.string().min(1, 'Language is required').max(10, 'Language code too long').default('en-US'),
})

// Conversation schema
export const conversationSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID'),
  userInput: z.string().max(10000, 'Input too long').optional(),
  inputType: z.enum(['text', 'audio', 'image']),
  audioData: z.string().optional(), // base64 encoded audio
  imageData: z.string().optional(), // base64 encoded image
  mimeType: z.string().optional(),
})

// Usage tracking schema
export const usageUpdateSchema = z.object({
  featureType: z.enum(['SCREEN_QA', 'AUDIO_MINUTES', 'WEB_QUERIES']),
  amount: z.number().min(0, 'Amount must be positive').max(10000, 'Amount too large'),
})

// PayPal subscription schema
export const createSubscriptionSchema = z.object({
  plan: z.enum(['FREE', 'PRO']),
  paypalSubscriptionId: z.string().optional(),
})

// Generic API response schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
})

// Helper function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`)
  }
  return result.data
}

// Helper function to create API response
export function createApiResponse(success: boolean, data?: any, message?: string, error?: string) {
  return {
    success,
    ...(data && { data }),
    ...(message && { message }),
    ...(error && { error }),
  }
}