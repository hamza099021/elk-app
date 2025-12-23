import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendPasswordSetupEmail } from '@/lib/email';
import { createId } from '@paralleldrive/cuid2';
import crypto from 'crypto';

// PayPal webhook event types we care about
const SUBSCRIPTION_ACTIVATED = 'BILLING.SUBSCRIPTION.ACTIVATED';
const SUBSCRIPTION_CANCELLED = 'BILLING.SUBSCRIPTION.CANCELLED';
const SUBSCRIPTION_EXPIRED = 'BILLING.SUBSCRIPTION.EXPIRED';
const SUBSCRIPTION_SUSPENDED = 'BILLING.SUBSCRIPTION.SUSPENDED';
const PAYMENT_SALE_COMPLETED = 'PAYMENT.SALE.COMPLETED';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const webhookId = request.headers.get('paypal-transmission-id');
    const transmissionSig = request.headers.get('paypal-transmission-sig');
    const transmissionTime = request.headers.get('paypal-transmission-time');
    const certUrl = request.headers.get('paypal-cert-url');
    const authAlgo = request.headers.get('paypal-auth-algo');

    console.log('PayPal Webhook received:', {
      eventType: body.event_type,
      webhookId,
      subscriptionId: body.resource?.id,
    });

    // Verify webhook signature (in production)
    if (process.env.PAYPAL_ENVIRONMENT === 'live') {
      // TODO: Implement PayPal webhook signature verification
      // https://developer.paypal.com/api/rest/webhooks/rest/
    }

    const eventType = body.event_type;
    const resource = body.resource;

    switch (eventType) {
      case SUBSCRIPTION_ACTIVATED:
        await handleSubscriptionActivated(resource);
        break;

      case PAYMENT_SALE_COMPLETED:
        await handlePaymentCompleted(resource);
        break;

      case SUBSCRIPTION_CANCELLED:
      case SUBSCRIPTION_EXPIRED:
      case SUBSCRIPTION_SUSPENDED:
        await handleSubscriptionDeactivated(resource);
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionActivated(resource: any) {
  const subscriptionId = resource.id;
  const subscriberEmail = resource.subscriber?.email_address;
  const planId = resource.plan_id;

  console.log('Subscription activated:', {
    subscriptionId,
    subscriberEmail,
    planId,
  });

  if (!subscriberEmail) {
    console.error('No subscriber email in webhook');
    return;
  }

  // Find user by email
  let user = await prisma.user.findUnique({
    where: { email: subscriberEmail },
    include: { subscription: true },
  });

  // If user doesn't exist, create one
  if (!user) {
    const newUser = await prisma.user.create({
      data: {
        email: subscriberEmail,
        passwordHash: '', // No password for PayPal-only users
        firstName: resource.subscriber?.name?.given_name || null,
        lastName: resource.subscriber?.name?.surname || null,
      },
    });

    // Reload with subscription relation
    user = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: { subscription: true },
    });

    if (!user) {
      console.error('Failed to reload user after creation');
      return;
    }
  }

  // Update or create subscription
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (user.subscription) {
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        plan: 'PRO',
        status: 'ACTIVE',
        paypalSubscriptionId: subscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'PRO',
        status: 'ACTIVE',
        paypalSubscriptionId: subscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      },
    });
  }

  // Send password setup email if user doesn't have a password
  if (!user.passwordHash) {
    // Create password reset token
    const token = createId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        used: false,
      },
    });

    // Send email with setup link
    await sendPasswordSetupEmail(user.email, token);
  }

  console.log(`User ${subscriberEmail} upgraded to PRO`);
}

async function handlePaymentCompleted(resource: any) {
  const subscriptionId = resource.billing_agreement_id;
  
  if (!subscriptionId) return;

  // Update subscription period
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
  });

  if (subscription) {
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        status: 'ACTIVE',
      },
    });

    console.log(`Subscription ${subscriptionId} renewed`);
  }
}

async function handleSubscriptionDeactivated(resource: any) {
  const subscriptionId = resource.id;

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        plan: 'FREE', // Downgrade to free
      },
    });

    console.log(`Subscription ${subscriptionId} deactivated`);
  }
}
