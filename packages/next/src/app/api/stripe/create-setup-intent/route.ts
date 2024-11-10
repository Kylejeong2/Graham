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

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // Create or get Stripe customer
    let stripeCustomerId = user?.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(
        user?.email || 'pending@example.com', 
        user?.fullName || 'Pending User',
        userId
      )
      stripeCustomerId = customer.id
      
      // Save Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId }
      })
    }

    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'Stripe customer ID not found' }, { status: 400 })
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      usage: 'off_session',
    })

    return NextResponse.json({ clientSecret: setupIntent.client_secret }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
      }
    })
  } catch (error) {
    console.error('Error creating setup intent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}