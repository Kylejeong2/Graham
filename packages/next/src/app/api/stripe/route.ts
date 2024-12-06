import { NextResponse } from 'next/server';
import { stripe } from '@/configs/stripe';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@graham/db';

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, price } = await req.json();

  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  let stripeCustomerId = subscription?.stripeCustomerId;

  if (!stripeCustomerId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const customer = await stripe.customers.create({
      email: user.email,
      ...(user.fullName ? { name: user.fullName } : {})
    });

    stripeCustomerId = customer.id;

    await prisma.subscription.create({
      data: {
        userId,
        status: 'incomplete',
        stripeCustomerId: customer.id,
        updatedAt: new Date()
      }
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
            interval: 'month',
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

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      user: {
        id: userId
      },
      status: 'active',
      stripeSubscriptionId: { not: null }
    }
  });

  return NextResponse.json({ hasSubscription: !!subscription });
}