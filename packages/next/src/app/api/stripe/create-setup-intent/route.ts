import { NextResponse } from 'next/server'
import { stripe } from '@/configs/stripe'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@graham/db'
import { createStripeCustomer } from '@/configs/stripe'

export async function POST() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    // Create or get Stripe customer
    let stripeCustomerId = subscription?.stripeCustomerId
    if (!stripeCustomerId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      const customer = await createStripeCustomer(
        user?.email || 'pending@example.com',
        user?.fullName || 'Pending User',
        userId
      )
      stripeCustomerId = customer.id

      // Create or update subscription
      await prisma.$transaction([
        prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            status: 'active',
            stripeCustomerId,
            phoneNumberSubscriptionData: {},
            updatedAt: new Date()
          },
          update: { 
            stripeCustomerId,
            status: 'active'
          }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { hasPaymentSetup: true }
        })
      ])
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      usage: 'off_session',
    })

    return NextResponse.json({ 
      clientSecret: setupIntent.client_secret,
      redirectUrl: '/dashboard'  
    })
  } catch (error) {
    console.error('Error creating setup intent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}