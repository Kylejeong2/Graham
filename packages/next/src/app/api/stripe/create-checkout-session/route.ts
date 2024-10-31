import { NextResponse } from 'next/server'
import { stripe } from '@/configs/stripe'
import { clerk } from '@/configs/clerk-server'

export async function POST(req: Request) {
  try {
    const { planId, userId, successUrl, cancelUrl } = await req.json()

    // Validate required fields
    if (!planId || !userId || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch the user
    const user = await clerk.users.getUser(userId)
    let stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined

    // Create a new customer if one doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
      })
      stripeCustomerId = customer.id
      await clerk.users.updateUser(userId, {
        privateMetadata: { ...user.privateMetadata, stripeCustomerId },
      })
    }

    // Fetch the price ID based on the planId
    const product = await stripe.products.retrieve(planId)
    const price = await stripe.prices.retrieve(product.default_price as string)

    if (!price) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}