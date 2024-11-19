import { NextResponse } from 'next/server'
import { stripe } from '@/configs/stripe'
import { prisma } from '@graham/db'

export async function POST(req: Request) {
  try {
    const { planId, userId, successUrl, cancelUrl, quantity, metadata } = await req.json()

    // Validate required fields
    if (!planId || !userId || !successUrl || !cancelUrl || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 401 })
    }

    // Fetch the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    const subscription = await prisma.subscription.findFirst({
      where: {
        user: {
          id: userId
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let stripeCustomerId = subscription?.stripeCustomerId

    // Create a new customer if one doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName || undefined,
      })
      stripeCustomerId = customer.id
      await prisma.subscription.update({
        where: { id: subscription?.id },
        data: { stripeCustomerId }
      })
    }

    // Fetch the price ID based on the planId
    const product = await stripe.products.retrieve(planId)
    const price = await stripe.prices.retrieve(product.default_price as string)

    if (!price) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 402 })
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: quantity,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: metadata || {},
    })

    return NextResponse.json({ url: session.url, success: true })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', success: false },
      { status: 500 }
    )
  }
}