import { stripe } from '@/configs/stripe'
import { clerk } from '@/configs/clerk-server'
import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe'

// to listen run this: stripe listen --forward-to localhost:3000/api/webhook/stripe

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function cancelExistingSubscriptions(customerId: string, newSubscriptionId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
  });

  for (const subscription of subscriptions.data) {
    if (subscription.id !== newSubscriptionId) {
      await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });
    }
  }
}

export async function POST(request: NextRequest) {
  const buf = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig!, endpointSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.log(`❌ Error message: ${errorMessage}`);

    return NextResponse.json(
      { error: { message: `Webhook Error: ${errorMessage}` } },
      { status: 400 }
    );
  }
  
  // console.log(`✅ Received event: ${event.type} (ID: ${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        console.log('Checkout session completed');
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event);
        console.log('Subscription changed');
        break;
     
      default:
        // console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(`❌ Error processing event ${event.type}:`, error);
    return NextResponse.json(
      { error: { message: `Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}` } },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const customerId = subscription.customer as string;

  const userId = session.client_reference_id;
  if (!userId) {
    console.error('No userId found in session.client_reference_id');
    throw new Error('No userId found');
  }

  let user;
  try {
    user = await clerk.users.getUser(userId);
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    throw new Error('Failed to fetch user data');
  }

  if (user) {
    const planName = session.metadata?.plan;
    const isYearly = session.metadata?.isYearly === 'true';

    try {
      // Cancel any existing subscriptions
      await cancelExistingSubscriptions(customerId, subscription.id);

      await clerk.users.updateUser(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCustomerId: customerId,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          subscriptionName: `${planName} Plan`,
          isYearly: isYearly,
          subscriptionStatus: subscription.status,
          subscriptionCancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        },
      });
      console.log(`User ${userId} updated successfully`);
    } catch (error) {
      console.error('Error updating user in Clerk:', error);
      throw new Error('Failed to update user data');
    }
  } else {
    console.error(`User ${userId} not found`);
    throw new Error('User not found');
  }
}

async function handleSubscriptionChange(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId found in subscription.metadata.userId');
    throw new Error('No userId found');
  }

  let user;
  try {
    user = await clerk.users.getUser(userId);
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    throw new Error('Failed to fetch user data');
  }

  if (user) {
    try {
      await clerk.users.updateUser(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCustomerId: customerId,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          subscriptionStatus: subscription.status,
          subscriptionCancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        },
      });
      console.log(`User ${userId} updated successfully`);
    } catch (error) {
      console.error('Error updating user in Clerk:', error);
      throw new Error('Failed to update user data');
    }
  } else {
    console.error(`User ${userId} not found`);
    throw new Error('User not found');
  }
}