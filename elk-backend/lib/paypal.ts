// PayPal subscription management integration

export interface PayPalConfig {
  clientId: string
  clientSecret: string
  environment: 'sandbox' | 'live'
}

export interface PayPalPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  trialDays?: number
  features: string[]
}

export interface PayPalSubscription {
  id: string
  planId: string
  status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED' | 'EXPIRED'
  userId: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
}

class PayPalProvider {
  private config: PayPalConfig
  private baseURL: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    this.config = {
      clientId: process.env.PAYPAL_CLIENT_ID!,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      environment: (process.env.PAYPAL_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox',
    }

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('PayPal credentials are required')
    }

    this.baseURL = this.config.environment === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com'
  }

  // Get PayPal access token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    try {
      const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')
      
      const response = await fetch(`${this.baseURL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      })

      if (!response.ok) {
        throw new Error(`PayPal auth failed: ${response.status}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000 // Refresh 1 min early

      if (!this.accessToken) {
        throw new Error('PayPal did not return an access token')
      }

      return this.accessToken
    } catch (error) {
      console.error('PayPal authentication error:', error)
      throw new Error('Failed to authenticate with PayPal')
    }
  }

  // Create subscription plans
  async createPlans(): Promise<{ free: PayPalPlan; pro: PayPalPlan }> {
    const accessToken = await this.getAccessToken()

    // Pro plan configuration
    const proPlanData = {
      product_id: await this.createProduct('Elk Pro Plan', 'Professional AI assistant features'),
      name: 'Elk Pro Monthly',
      description: 'Monthly subscription for Elk Pro features',
      billing_cycles: [
        {
          frequency: {
            interval_unit: 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // Infinite
          pricing_scheme: {
            fixed_price: {
              value: '9.99',
              currency_code: 'USD',
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: '0',
        inclusive: false,
      },
    }

    try {
      const response = await fetch(`${this.baseURL}/v1/billing/plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(proPlanData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create plan: ${response.status}`)
      }

      const plan = await response.json()

      return {
        free: {
          id: 'free',
          name: 'Free Plan',
          description: 'Basic features with limited usage',
          price: 0,
          currency: 'USD',
          interval: 'month',
          features: [
            '10 Screen Q&A queries per month',
            '20 minutes of audio processing per month',
            'Basic AI profiles',
          ],
        },
        pro: {
          id: plan.id,
          name: 'Pro Plan',
          description: 'Full access to all Elk features',
          price: 9.99,
          currency: 'USD',
          interval: 'month',
          features: [
            '900 Screen Q&A queries per month',
            '10 hours of audio processing per month',
            '100 web research queries per month',
            'All AI profiles',
            'Priority support',
          ],
        },
      }
    } catch (error) {
      console.error('Error creating PayPal plans:', error)
      throw new Error('Failed to create subscription plans')
    }
  }

  // Create PayPal product
  private async createProduct(name: string, description: string): Promise<string> {
    const accessToken = await this.getAccessToken()

    const productData = {
      name,
      description,
      type: 'SERVICE',
      category: 'SOFTWARE',
    }

    const response = await fetch(`${this.baseURL}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.status}`)
    }

    const product = await response.json()
    return product.id
  }

  // Create subscription
  async createSubscription(planId: string, userId: string): Promise<{ subscriptionId: string; approvalUrl: string }> {
    const accessToken = await this.getAccessToken()

    const subscriptionData = {
      plan_id: planId,
      subscriber: {
        email_address: await this.getUserEmail(userId),
      },
      application_context: {
        brand_name: 'Elk AI Assistant',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
        return_url: `${process.env.NEXTAUTH_URL}/api/payments/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/api/payments/cancel`,
      },
    }

    try {
      const response = await fetch(`${this.baseURL}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create subscription: ${response.status}`)
      }

      const subscription = await response.json()
      const approvalUrl = subscription.links.find((link: any) => link.rel === 'approve')?.href

      return {
        subscriptionId: subscription.id,
        approvalUrl,
      }
    } catch (error) {
      console.error('Error creating PayPal subscription:', error)
      throw new Error('Failed to create subscription')
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
    const accessToken = await this.getAccessToken()

    try {
      const response = await fetch(`${this.baseURL}/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get subscription: ${response.status}`)
      }

      const subscription = await response.json()

      return {
        id: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        userId: '', // Will be filled from database
        currentPeriodStart: new Date(subscription.billing_info?.next_billing_time),
        currentPeriodEnd: new Date(subscription.billing_info?.last_payment?.time),
      }
    } catch (error) {
      console.error('Error getting PayPal subscription:', error)
      throw new Error('Failed to get subscription details')
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, reason: string = 'User requested cancellation'): Promise<void> {
    const accessToken = await this.getAccessToken()

    const cancelData = {
      reason,
    }

    try {
      const response = await fetch(`${this.baseURL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(cancelData),
      })

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to cancel subscription: ${response.status}`)
      }
    } catch (error) {
      console.error('Error canceling PayPal subscription:', error)
      throw new Error('Failed to cancel subscription')
    }
  }

  // Handle webhook events
  async handleWebhook(headers: Record<string, string>, body: string): Promise<{ eventType: string; subscriptionId: string; newStatus?: string }> {
    try {
      // Verify webhook signature (simplified - in production, use proper verification)
      const event = JSON.parse(body)
      
      const eventType = event.event_type
      const subscriptionId = event.resource?.id

      if (!subscriptionId) {
        throw new Error('No subscription ID in webhook')
      }

      let newStatus: string | undefined

      switch (eventType) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          newStatus = 'ACTIVE'
          break
        case 'BILLING.SUBSCRIPTION.CANCELLED':
          newStatus = 'CANCELLED'
          break
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
          newStatus = 'SUSPENDED'
          break
        case 'BILLING.SUBSCRIPTION.EXPIRED':
          newStatus = 'EXPIRED'
          break
        case 'PAYMENT.SALE.COMPLETED':
          // Handle successful payment
          break
        case 'PAYMENT.SALE.DENIED':
          // Handle failed payment
          break
      }

      return {
        eventType,
        subscriptionId,
        newStatus,
      }
    } catch (error) {
      console.error('Error handling PayPal webhook:', error)
      throw new Error('Failed to process webhook')
    }
  }

  // Get user email from database
  private async getUserEmail(userId: string): Promise<string> {
    // This would be implemented to fetch user email from database
    // For now, return a placeholder
    return 'user@example.com'
  }

  // Verify webhook signature (production implementation needed)
  private verifyWebhookSignature(headers: Record<string, string>, body: string): boolean {
    // Implementation needed for production security
    // PayPal provides webhook signature verification
    return true
  }
}

// Export singleton instance
export const paypalProvider = new PayPalProvider()