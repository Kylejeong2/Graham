import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerk } from '@/configs/clerk-server'
import { stripe } from '@/configs/stripe'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newPlan, isYearly, currentPlan, action } = await req.json()
    if (!newPlan || !currentPlan || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await clerk.users.getUser(userId)
    const currentSubscriptionId = user.privateMetadata.stripeSubscriptionId as string

    if (!currentSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Fetch the current subscription
    const currentSubscription = await stripe.subscriptions.retrieve(currentSubscriptionId)

    // Get the new price ID based on the new plan and billing cycle
    const newPriceId = await getStripePriceId(newPlan, isYearly)

    let updatedSubscription

    if (action === 'upgrade') {
      // Upgrade: Immediate change with prorated charges
      updatedSubscription = await stripe.subscriptions.update(currentSubscriptionId, {
        items: [
          {
            id: currentSubscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'always_invoice',
      })
    } else if (action === 'downgrade') {
      // Downgrade: Schedule the change for the end of the current billing period
      const currentPeriodEnd = new Date(currentSubscription.current_period_end * 1000)

      updatedSubscription = await stripe.subscriptions.update(currentSubscriptionId, {
        items: [
          {
            id: currentSubscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'none',
        trial_end: Math.floor(currentPeriodEnd.getTime() / 1000),
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update Clerk metadata
    await clerk.users.updateUser(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        stripeSubscriptionId: updatedSubscription.id,
        subscriptionName: `${newPlan} Plan`,
        isYearly: isYearly,
        subscriptionStatus: updatedSubscription.status,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: action === 'upgrade' ? 'Subscription upgraded successfully' : 'Subscription will be downgraded at the end of the current billing period',
      newSubscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      }
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

async function getStripePriceId(plan: string, isYearly: boolean): Promise<string> {
  // This function should return the appropriate Stripe Price ID based on the plan and billing cycle
  // You'll need to implement this based on your Stripe product and price structure
  // For example:
  const priceMap = {
    'Free': {
      monthly: 'price_monthly_free_id',
      yearly: 'price_yearly_free_id',
    },
    'Basic': {
      monthly: 'price_monthly_basic_id',
      yearly: 'price_yearly_basic_id',
    },
    'Pro': {
      monthly: 'price_monthly_pro_id',
      yearly: 'price_yearly_pro_id',
    }
    // Add other plans as needed
  }

  const planPrices = priceMap[plan as keyof typeof priceMap]
  if (!planPrices) {
    throw new Error('Invalid plan selected')
  }

  return isYearly ? planPrices.yearly : planPrices.monthly
}