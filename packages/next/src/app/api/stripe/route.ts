import { NextResponse } from 'next/server';
import { stripe } from '@/configs/stripe';
import { clerk } from '@/configs/clerk-server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, price, isYearly } = await req.json();

  const user = await clerk.users.getUser(userId);
  let stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
    });
    stripeCustomerId = customer.id;
    await clerk.users.updateUser(userId, {
      privateMetadata: { ...user.privateMetadata, stripeCustomerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${plan} Plan`,
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
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/profile/${userId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription`,
  });

  return NextResponse.json({ sessionId: session.id });
}

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await clerk.users.getUser(userId);
  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined;

  if (!stripeCustomerId) {
    return NextResponse.json({ hasSubscription: false });
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'active',
  });

  return NextResponse.json({ hasSubscription: subscriptions.data.length > 0 });
}