import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { createApiResponse } from '@/lib/validation'

// Get plan limits based on subscription plan
function getPlanLimits(plan: 'FREE' | 'PRO') {
  if (plan === 'PRO') {
    return {
      screenQaLimit: parseInt(process.env.PRO_PLAN_SCREEN_QA_LIMIT || '900'),
      audioMinutesLimit: parseInt(process.env.PRO_PLAN_AUDIO_MINUTES_LIMIT || '600'),
      webQueriesLimit: parseInt(process.env.PRO_PLAN_WEB_QUERIES_LIMIT || '100'),
    }
  }
  
  return {
    screenQaLimit: parseInt(process.env.FREE_PLAN_SCREEN_QA_LIMIT || '10'),
    audioMinutesLimit: parseInt(process.env.FREE_PLAN_AUDIO_MINUTES_LIMIT || '20'),
    webQueriesLimit: parseInt(process.env.FREE_PLAN_WEB_QUERIES_LIMIT || '0'),
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth.getAuthenticatedUser(request)
    
    // Get subscription and usage
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    })
    
    const usage = await prisma.usage.findUnique({
      where: { userId: user.id },
    })
    
    if (!subscription) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'No subscription found'),
        { status: 404 }
      )
    }
    
    // Get plan limits
    const limits = getPlanLimits(subscription.plan)
    
    // Check if usage needs to be reset (monthly reset)
    const now = new Date()
    const lastReset = usage?.lastResetDate || subscription.currentPeriodStart
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceReset >= 30) {
      // Reset usage counters
      await prisma.usage.update({
        where: { userId: user.id },
        data: {
          screenQaCount: 0,
          audioMinutes: 0,
          webQueriesCount: 0,
          lastResetDate: now,
        },
      })
      
      // Update current period
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      })
      
      return NextResponse.json(
        createApiResponse(true, {
          subscription: {
            ...subscription,
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
          usage: {
            screenQaCount: 0,
            audioMinutes: 0,
            webQueriesCount: 0,
            lastResetDate: now,
          },
          limits,
          remaining: {
            screenQa: limits.screenQaLimit,
            audioMinutes: limits.audioMinutesLimit,
            webQueries: limits.webQueriesLimit,
          },
        })
      )
    }
    
    return NextResponse.json(
      createApiResponse(true, {
        subscription,
        usage: usage || {
          screenQaCount: 0,
          audioMinutes: 0,
          webQueriesCount: 0,
        },
        limits,
        remaining: {
          screenQa: limits.screenQaLimit - (usage?.screenQaCount || 0),
          audioMinutes: limits.audioMinutesLimit - (usage?.audioMinutes || 0),
          webQueries: limits.webQueriesLimit - (usage?.webQueriesCount || 0),
        },
      })
    )
    
  } catch (error) {
    console.error('Get subscription status error:', error)
    
    return NextResponse.json(
      createApiResponse(false, null, '', 'Failed to get subscription status'),
      { status: 500 }
    )
  }
}
