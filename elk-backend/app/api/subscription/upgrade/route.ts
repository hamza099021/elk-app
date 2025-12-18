import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { createApiResponse } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth.getAuthenticatedUser(request)
    
    const body = await request.json()
    const { plan, paypalSubscriptionId } = body
    
    if (!plan || (plan !== 'PRO' && plan !== 'FREE')) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Invalid plan specified'),
        { status: 400 }
      )
    }
    
    // Get existing subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    })
    
    if (!existingSubscription) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'No subscription found'),
        { status: 404 }
      )
    }
    
    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        plan,
        paypalSubscriptionId: paypalSubscriptionId || existingSubscription.paypalSubscriptionId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    
    // Reset usage when upgrading
    await prisma.usage.update({
      where: { userId: user.id },
      data: {
        screenQaCount: 0,
        audioMinutes: 0,
        webQueriesCount: 0,
        lastResetDate: new Date(),
      },
    })
    
    return NextResponse.json(
      createApiResponse(true, { subscription: updatedSubscription }, 'Subscription updated successfully')
    )
    
  } catch (error) {
    console.error('Upgrade subscription error:', error)
    
    return NextResponse.json(
      createApiResponse(false, null, '', 'Failed to upgrade subscription'),
      { status: 500 }
    )
  }
}
