import { NextResponse } from 'next/server'
import { stripe } from '@/configs/stripe'
import { clerk } from '@/configs/clerk-server'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await clerk.users.getUser(userId)
    const stripeSubscriptionId = user.privateMetadata.stripeSubscriptionId as string | undefined

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    })

    const cancelAtDate = new Date(subscription.current_period_end * 1000).toISOString()

    await clerk.users.updateUser(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        stripeSubscriptionId: subscription.id,
        subscriptionCancelAt: cancelAtDate,
        subscriptionStatus: 'active', // It's still active until the end of the period
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription will be canceled at the end of the billing period',
      cancelAt: cancelAtDate
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json({ error: 'Error cancelling subscription' }, { status: 500 })
  }
}