import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { createApiResponse, usageUpdateSchema } from '@/lib/validation'

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
    const { featureType, amount } = usageUpdateSchema.parse(body)
    
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
    let newCount = 0
    let limitExceeded = false
    
    if (featureType === 'SCREEN_QA') {
      newCount = usage.screenQaCount + amount
      limitExceeded = newCount > limits.screenQaLimit
    } else if (featureType === 'AUDIO_MINUTES') {
      newCount = usage.audioMinutes + amount
      limitExceeded = newCount > limits.audioMinutesLimit
    } else if (featureType === 'WEB_QUERIES') {
      newCount = usage.webQueriesCount + amount
      limitExceeded = newCount > limits.webQueriesLimit
    }
    
    if (limitExceeded) {
      return NextResponse.json(
        createApiResponse(false, {
          limitExceeded: true,
          currentPlan: subscription.plan,
          limits,
        }, '', 'Usage limit exceeded for your current plan'),
        { status: 403 }
      )
    }
    
    // Update usage
    const updateData: any = {}
    if (featureType === 'SCREEN_QA') {
      updateData.screenQaCount = newCount
    } else if (featureType === 'AUDIO_MINUTES') {
      updateData.audioMinutes = newCount
    } else if (featureType === 'WEB_QUERIES') {
      updateData.webQueriesCount = newCount
    }
    
    const updatedUsage = await prisma.usage.update({
      where: { userId: user.id },
      data: updateData,
    })
    
    // Create usage history entry
    await prisma.usageHistory.create({
      data: {
        usageId: usage.id,
        featureType,
        amount,
      },
    })
    
    return NextResponse.json(
      createApiResponse(true, {
        usage: updatedUsage,
        remaining: {
          screenQa: limits.screenQaLimit - updatedUsage.screenQaCount,
          audioMinutes: limits.audioMinutesLimit - updatedUsage.audioMinutes,
          webQueries: limits.webQueriesLimit - updatedUsage.webQueriesCount,
        },
      }, 'Usage tracked successfully')
    )
    
  } catch (error) {
    console.error('Track usage error:', error)
    
    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        createApiResponse(false, null, '', error.message),
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      createApiResponse(false, null, '', 'Failed to track usage'),
      { status: 500 }
    )
  }
}
