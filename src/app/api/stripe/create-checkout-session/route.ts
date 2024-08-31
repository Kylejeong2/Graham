import { NextResponse } from 'next/server'
import { stripe } from '@/configs/stripe'
import { clerk } from '@/configs/clerk-server'

export async function POST(req: Request) {
  try {
    const { plan, price, isYearly, userId } = await req.json()

    // Fetch user data
    const user = await clerk.users.getUser(userId).catch(error => {
      console.error('Error fetching user from Clerk:', error)
      throw new Error('Failed to fetch user data')
    })

    let stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined

    if (!stripeCustomerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
      }).catch(error => {
        console.error('Error creating Stripe customer:', error)
        throw new Error('Failed to create Stripe customer')
      })

      stripeCustomerId = customer.id

      // Update Clerk user with Stripe customer ID
      await clerk.users.updateUser(userId, {
        privateMetadata: { ...user.privateMetadata, stripeCustomerId },
      }).catch(error => {
        console.error('Error updating user in Clerk:', error)
        throw new Error('Failed to update user data')
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: userId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan} Plan`,
              metadata: {
                plan_type: plan,
                is_yearly: isYearly.toString(),
              },
            },
            unit_amount: price * 100,
            recurring: {
              interval: isYearly ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/profile/${userId}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription`,
      metadata: {
        userId,
        plan,
        isYearly: isYearly.toString(),
        createdAt: new Date().toISOString(),
        source: 'web_app',
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
          isYearly: isYearly.toString(),
          createdAt: new Date().toISOString(),
          source: 'web_app',
        },
      },
    }).catch(error => {
      console.error('Error creating Stripe checkout session:', error)
      throw new Error('Failed to create checkout session')
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error in checkout process:', error)
    return NextResponse.json({ error: 'An error occurred during the checkout process' }, { status: 500 })
  }
}