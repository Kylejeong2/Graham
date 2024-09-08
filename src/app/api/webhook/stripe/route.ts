import { stripe } from '@/configs/stripe'
import { clerk } from '@/configs/clerk-server'
import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe'
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { $users } from '@/lib/db/schema';
import { createRetellPhoneNumber } from '@/services/retellAI';
import { deleteRetellPhoneNumber } from '@/services/retellAI';
import { $agents } from '@/lib/db/schema';

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
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        console.log('Subscription deleted');
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
    const areaCode = session.metadata?.areaCode;
    const buyPhoneNumber = session.metadata?.phoneNumber;
    let phoneNumber;
    
    if(buyPhoneNumber) {
      try {
        const response = await createRetellPhoneNumber({
          area_code: areaCode,
          nickname: `Phone Number for ${user.firstName} ${user.lastName}`,
        });
        phoneNumber = response.phone_number;
      } catch (error) {
        console.error('Error fetching phone number by area code:', error);
        throw new Error('Failed to fetch phone number by area code');
        }
    }

    try {
      // Cancel any existing subscriptions
      await cancelExistingSubscriptions(customerId, subscription.id);

      // Update Clerk user data
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
          ...(phoneNumber ? { phoneNumbers: { push: phoneNumber } } : {}),
        },
      });
      console.log(`Clerk User ${userId} updated successfully`);

      // Update database user data
      await db.update($users).set({
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCustomerId: customerId,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        subscriptionName: `${planName} Plan`,
        isYearly: isYearly,
        subscriptionStatus: subscription.status,
        subscriptionCancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        ...(phoneNumber ? { phoneNumbers: { push: phoneNumber } } : {}),
      }).where(eq($users.id, userId));
      console.log(`Database User ${userId} updated successfully`);

      // Update agent with phone number if provided
      if (phoneNumber && userId) {
        await db.update($users)
          .set({ phoneNumbers: { push: { phoneNumber } } })
          .where(eq($users.id, userId));
        console.log(`Added phone number to user ${userId}`);
      }
    } catch (error) {
      console.error('Error updating user in Clerk or agent in database:', error);
      throw new Error('Failed to update user or agent data');
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
      // Update Clerk user data
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
      console.log(`Clerk User ${userId} updated successfully`);

      // Update database user data
      await db.update($users).set({
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCustomerId: customerId,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        subscriptionStatus: subscription.status,
        subscriptionCancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      }).where(eq($users.id, userId));
      console.log(`Database User ${userId} updated successfully`);
    } catch (error) {
      console.error('Error updating user in Clerk or database:', error);
      throw new Error('Failed to update user data');
    }
  } else {
    console.error(`User ${userId} not found`);
    throw new Error('User not found');
  }
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const phoneNumber = subscription.metadata?.phoneNumber;

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
      // Delete the Retell phone number
      const res = await deleteRetellPhoneNumber(phoneNumber);

      if(res.status === 204) {
        // Remove the phone number from the user in the database
        await db.update($users)
          .set({ phoneNumbers: { pull: phoneNumber } })
          .where(eq($users.id, userId));

        // Remove the phone number from any agents owned by the user
        await db.update($agents)
          .set({ phoneNumber: null })
          .where(and(eq($agents.userId, userId), eq($agents.phoneNumber, phoneNumber)));

        console.log(`Removed phone number ${phoneNumber} for user ${userId}`);
      } else {
        console.error(`Failed to remove phone number ${phoneNumber} for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error removing phone number ${phoneNumber}:`, error);
    }
  

    try {
      // Update Clerk user data
      await clerk.users.updateUser(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCustomerId: null,
          stripeCurrentPeriodEnd: null,
          subscriptionName: null,
          isYearly: null,
          subscriptionStatus: 'canceled',
          subscriptionCancelAt: null,
          phoneNumbers: (user.privateMetadata.phoneNumbers as string[]).filter(number => number !== phoneNumber),
        },
      });
      console.log(`Clerk User ${userId} updated successfully after subscription cancellation`);

      // Update database user data
      await db.update($users).set({
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCustomerId: null,
        stripeCurrentPeriodEnd: null,
        subscriptionName: null,
        isYearly: null,
        subscriptionStatus: 'canceled',
        subscriptionCancelAt: null,
        phoneNumbers: { pull: phoneNumber },
      }).where(eq($users.id, userId));
      console.log(`Database User ${userId} updated successfully after subscription cancellation`);
    } catch (error) {
      console.error('Error updating user in Clerk or database:', error);
      throw new Error('Failed to update user data');
    }
  } else {
    console.error(`User ${userId} not found`);
    throw new Error('User not found');
  }
}