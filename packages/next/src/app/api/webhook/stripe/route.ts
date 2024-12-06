import { stripe } from '@/configs/stripe'
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import type Stripe from 'stripe'
import { prisma } from "@graham/db";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  switch (event.type) {
    case 'checkout.session.completed': {
      const isPhoneNumberSubscription = session.metadata?.phoneNumber;

      await prisma.subscription.upsert({
        where: {
          userId: session.client_reference_id!
        },
        create: {
          userId: session.client_reference_id!,
          status: 'active',
          stripeCustomerId: session.customer as string,
          stripePriceId: session.subscription as string,
          stripeSubscriptionId: session.subscription as string,
          subscriptionStatus: 'active',
          stripeCurrentPeriodEnd: new Date(session.expires_at! * 1000),
          phoneNumberSubscriptionData: isPhoneNumberSubscription ? {
            phoneNumber: session.metadata?.phoneNumber,
            active: true,
            createdAt: new Date()
          } : {}
        },
        update: {
          status: 'active',
          stripeCustomerId: session.customer as string,
          stripePriceId: session.subscription as string,
          stripeSubscriptionId: session.subscription as string,
          subscriptionStatus: 'active',
          stripeCurrentPeriodEnd: new Date(session.expires_at! * 1000),
          phoneNumberSubscriptionData: isPhoneNumberSubscription ? {
            phoneNumber: session.metadata?.phoneNumber,
            active: true,
            createdAt: new Date()
          } : {}
        }
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.update({
        where: { stripeCustomerId: subscription.customer as string },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.update({
        where: { stripeCustomerId: deletedSubscription.customer as string },
        data: {
          status: 'inactive',
          stripePriceId: null,
          stripeSubscriptionId: null,
          phoneNumberSubscriptionData: {
            active: false,
            canceledAt: new Date()
          }
        }
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}