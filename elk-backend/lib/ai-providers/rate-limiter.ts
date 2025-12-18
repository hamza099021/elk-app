// Enhanced rate limiting system migrated from cheating-daddy/src/utils/renderer.js

import { prisma } from '../db'

export interface RateLimit {
  requests: number
  tokens: number
  windowStart: Date
}

export interface PlanLimits {
  screenQaPerMonth: number
  audioMinutesPerMonth: number
  webQueriesPerMonth: number
  tokensPerMinute: number
  requestsPerMinute: number
}

export class RateLimitError extends Error {
  constructor(message: string, public retryAfter?: number) {
    super(message)
    this.name = 'RateLimitError'
  }
}

class RateLimiter {
  private readonly windowMs: number
  private readonly planLimits: Record<string, PlanLimits>

  constructor() {
    this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') // 1 minute default
    
    this.planLimits = {
      FREE: {
        screenQaPerMonth: parseInt(process.env.FREE_PLAN_SCREEN_QA_LIMIT || '10'),
        audioMinutesPerMonth: parseInt(process.env.FREE_PLAN_AUDIO_MINUTES_LIMIT || '20'),
        webQueriesPerMonth: parseInt(process.env.FREE_PLAN_WEB_QUERIES_LIMIT || '0'),
        tokensPerMinute: 1000,
        requestsPerMinute: 10,
      },
      BASIC: {
        screenQaPerMonth: parseInt(process.env.BASIC_PLAN_SCREEN_QA_LIMIT || '100'),
        audioMinutesPerMonth: parseInt(process.env.BASIC_PLAN_AUDIO_MINUTES_LIMIT || '200'),
        webQueriesPerMonth: parseInt(process.env.BASIC_PLAN_WEB_QUERIES_LIMIT || '50'),
        tokensPerMinute: 5000,
        requestsPerMinute: 50,
      },
      PRO: {
        screenQaPerMonth: parseInt(process.env.PRO_PLAN_SCREEN_QA_LIMIT || '900'),
        audioMinutesPerMonth: parseInt(process.env.PRO_PLAN_AUDIO_MINUTES_LIMIT || '600'),
        webQueriesPerMonth: parseInt(process.env.PRO_PLAN_WEB_QUERIES_LIMIT || '100'),
        tokensPerMinute: 10000,
        requestsPerMinute: 100,
      },
    }
  }

  // Check if request is within rate limits
  async checkLimit(userId: string, endpoint: string, tokens: number = 1): Promise<void> {
    try {
      // Get user's subscription plan
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
          usage: true,
        },
      })

      if (!user) {
        throw new RateLimitError('User not found')
      }

      // If no subscription, create a default FREE subscription
      if (!user.subscription) {
        const now = new Date()
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        await prisma.subscription.create({
          data: {
            userId: userId,
            plan: 'FREE',
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: nextMonth,
          },
        })
        
        // Reload user with subscription
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            subscription: true,
            usage: true,
          },
        })
        
        if (!updatedUser?.subscription) {
          throw new RateLimitError('Failed to create subscription')
        }
        
        user.subscription = updatedUser.subscription
      }

      // If no usage record, create one
      if (!user.usage) {
        await prisma.usage.create({
          data: {
            userId: userId,
            screenQaCount: 0,
            audioMinutes: 0,
            webQueriesCount: 0,
            lastResetDate: new Date(),
          },
        })
        
        // Reload user with usage
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            subscription: true,
            usage: true,
          },
        })
        
        if (updatedUser?.usage) {
          user.usage = updatedUser.usage
        }
      }

      const planLimits = this.planLimits[user.subscription.plan]
      if (!planLimits) {
        throw new RateLimitError('Invalid subscription plan')
      }

      // Check monthly usage limits
      await this.checkMonthlyLimits(user.usage, planLimits, endpoint, tokens)

      // Check per-minute rate limits
      await this.checkMinuteLimits(userId, endpoint, planLimits, tokens)
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error
      }
      console.error('Rate limiter error:', error)
      // For development, allow requests if database fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('Rate limiting disabled in development due to database error')
        return
      }
      throw new RateLimitError('Rate limiting service unavailable')
    }
  }

  // Check monthly usage limits based on feature type
  private async checkMonthlyLimits(
    usage: any,
    planLimits: PlanLimits,
    endpoint: string,
    amount: number
  ): Promise<void> {
    if (!usage) return

    // Reset usage if it's a new month
    const now = new Date()
    const lastReset = new Date(usage.lastResetDate)
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await this.resetMonthlyUsage(usage.userId)
      return // Fresh month, no limits apply
    }

    // Check specific feature limits
    switch (endpoint) {
      case 'screen_qa':
        if (usage.screenQaCount + 1 > planLimits.screenQaPerMonth) {
          throw new RateLimitError(
            `Monthly screen Q&A limit exceeded. Current: ${usage.screenQaCount}/${planLimits.screenQaPerMonth}`
          )
        }
        break

      case 'audio_processing':
        const audioMinutes = amount / 60 // Convert seconds to minutes
        if (usage.audioMinutes + audioMinutes > planLimits.audioMinutesPerMonth) {
          throw new RateLimitError(
            `Monthly audio limit exceeded. Current: ${usage.audioMinutes.toFixed(1)}/${planLimits.audioMinutesPerMonth} minutes`
          )
        }
        break

      case 'web_queries':
        if (usage.webQueriesCount + 1 > planLimits.webQueriesPerMonth) {
          throw new RateLimitError(
            `Monthly web queries limit exceeded. Current: ${usage.webQueriesCount}/${planLimits.webQueriesPerMonth}`
          )
        }
        break
    }
  }

  // Check per-minute rate limits
  private async checkMinuteLimits(
    userId: string,
    endpoint: string,
    planLimits: PlanLimits,
    tokens: number
  ): Promise<void> {
    const windowStart = new Date(Date.now() - this.windowMs)

    // Get current window usage
    const currentUsage = await prisma.rateLimit.findFirst({
      where: {
        userId,
        endpoint,
        windowStart: {
          gte: windowStart,
        },
      },
    })

    const currentRequests = currentUsage?.requests || 0
    const currentTokens = currentUsage?.tokens || 0

    // Check limits
    if (currentRequests >= planLimits.requestsPerMinute) {
      const retryAfter = Math.ceil(this.windowMs / 1000)
      throw new RateLimitError(
        `Rate limit exceeded: ${currentRequests}/${planLimits.requestsPerMinute} requests per minute`,
        retryAfter
      )
    }

    if (currentTokens + tokens > planLimits.tokensPerMinute) {
      const retryAfter = Math.ceil(this.windowMs / 1000)
      throw new RateLimitError(
        `Token limit exceeded: ${currentTokens + tokens}/${planLimits.tokensPerMinute} tokens per minute`,
        retryAfter
      )
    }
  }

  // Record usage after successful request
  async recordUsage(userId: string, endpoint: string, tokens: number = 1): Promise<void> {
    try {
      const windowStart = new Date()
      windowStart.setSeconds(0, 0) // Round to minute

      // Update rate limit record
      await prisma.rateLimit.upsert({
        where: {
          userId_endpoint_windowStart: {
            userId,
            endpoint,
            windowStart,
          },
        },
        update: {
          requests: { increment: 1 },
          tokens: { increment: tokens },
        },
        create: {
          userId,
          endpoint,
          requests: 1,
          tokens,
          windowStart,
        },
      })

      // Update monthly usage
      await this.updateMonthlyUsage(userId, endpoint, tokens)
    } catch (error) {
      console.error('Failed to record usage:', error)
      // Don't throw error for usage tracking failures
    }
  }

  // Update monthly usage counters
  private async updateMonthlyUsage(userId: string, endpoint: string, amount: number): Promise<void> {
    const usage = await prisma.usage.findUnique({
      where: { userId },
    })

    if (!usage) {
      // Create initial usage record
      await prisma.usage.create({
        data: { userId },
      })
      return
    }

    // Reset if new month
    const now = new Date()
    const lastReset = new Date(usage.lastResetDate)
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await this.resetMonthlyUsage(userId)
    }

    // Update specific counters
    const updateData: any = {}
    
    switch (endpoint) {
      case 'screen_qa':
        updateData.screenQaCount = { increment: 1 }
        break
      case 'audio_processing':
        updateData.audioMinutes = { increment: amount / 60 } // Convert to minutes
        break
      case 'web_queries':
        updateData.webQueriesCount = { increment: 1 }
        break
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.usage.update({
        where: { userId },
        data: updateData,
      })

      // Record in usage history
      const featureType = this.getFeatureType(endpoint)
      if (featureType) {
        await prisma.usageHistory.create({
          data: {
            usageId: usage.id,
            featureType,
            amount,
          },
        })
      }
    }
  }

  // Reset monthly usage counters
  private async resetMonthlyUsage(userId: string): Promise<void> {
    await prisma.usage.update({
      where: { userId },
      data: {
        screenQaCount: 0,
        audioMinutes: 0,
        webQueriesCount: 0,
        lastResetDate: new Date(),
      },
    })
  }

  // Get current usage for a user
  async getCurrentUsage(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        usage: true,
      },
    })

    if (!user || !user.subscription) {
      throw new Error('User or subscription not found')
    }

    const planLimits = this.planLimits[user.subscription.plan]
    const usage = user.usage

    return {
      plan: user.subscription.plan,
      limits: planLimits,
      current: usage ? {
        screenQaCount: usage.screenQaCount,
        audioMinutes: usage.audioMinutes,
        webQueriesCount: usage.webQueriesCount,
        lastResetDate: usage.lastResetDate,
      } : {
        screenQaCount: 0,
        audioMinutes: 0,
        webQueriesCount: 0,
        lastResetDate: new Date(),
      },
      remaining: usage ? {
        screenQa: Math.max(0, planLimits.screenQaPerMonth - usage.screenQaCount),
        audioMinutes: Math.max(0, planLimits.audioMinutesPerMonth - usage.audioMinutes),
        webQueries: Math.max(0, planLimits.webQueriesPerMonth - usage.webQueriesCount),
      } : planLimits,
    }
  }

  // Convert endpoint to feature type enum
  private getFeatureType(endpoint: string): 'SCREEN_QA' | 'AUDIO_MINUTES' | 'WEB_QUERIES' | null {
    switch (endpoint) {
      case 'screen_qa':
        return 'SCREEN_QA'
      case 'audio_processing':
        return 'AUDIO_MINUTES'
      case 'web_queries':
        return 'WEB_QUERIES'
      default:
        return null
    }
  }

  // Clean up old rate limit records
  async cleanupOldRecords(): Promise<void> {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago

    await prisma.rateLimit.deleteMany({
      where: {
        windowStart: {
          lt: cutoffDate,
        },
      },
    })
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()