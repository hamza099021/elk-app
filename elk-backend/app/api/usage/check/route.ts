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

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth.getAuthenticatedUser(request)
    
    const body = await request.json()
    const { featureType, amount } = body
    
    if (!featureType || !['SCREEN_QA', 'AUDIO_MINUTES', 'WEB_QUERIES'].includes(featureType)) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Invalid feature type'),
        { status: 400 }
      )
    }
    
    // Get subscription and usage
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    })
    
    if (!subscription) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'No subscription found'),
        { status: 404 }
      )
    }
    
    const usage = await prisma.usage.findUnique({
      where: { userId: user.id },
    })
    
    if (!usage) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'No usage record found'),
        { status: 404 }
      )
    }
    
    // Get plan limits
    const limits = getPlanLimits(subscription.plan)
    
    // Check if usage would exceed limit
    let canUse = true
    let currentUsage = 0
    let limit = 0
    
    if (featureType === 'SCREEN_QA') {
      currentUsage = usage.screenQaCount
      limit = limits.screenQaLimit
      canUse = (currentUsage + (amount || 1)) <= limit
    } else if (featureType === 'AUDIO_MINUTES') {
      currentUsage = usage.audioMinutes
      limit = limits.audioMinutesLimit
      canUse = (currentUsage + (amount || 1)) <= limit
    } else if (featureType === 'WEB_QUERIES') {
      currentUsage = usage.webQueriesCount
      limit = limits.webQueriesLimit
      canUse = (currentUsage + (amount || 1)) <= limit
    }
    
    return NextResponse.json(
      createApiResponse(true, {
        canUse,
        currentUsage,
        limit,
        remaining: limit - currentUsage,
        plan: subscription.plan,
      })
    )
    
  } catch (error) {
    console.error('Check usage error:', error)
    
    return NextResponse.json(
      createApiResponse(false, null, '', 'Failed to check usage'),
      { status: 500 }
    )
  }
}
