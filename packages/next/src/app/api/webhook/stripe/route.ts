// Might not need this if everything is invoice based.


// import { stripe } from '@/configs/stripe'
// import { NextRequest, NextResponse } from "next/server";
// import Stripe from 'stripe'
// import { prisma } from "@graham/db";

// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// async function cancelExistingSubscriptions(customerId: string, newSubscriptionId: string) {
//   const subscriptions = await stripe.subscriptions.list({
//     customer: customerId,
//     status: 'active',
//   });

//   for (const subscription of subscriptions.data) {
//     if (subscription.id !== newSubscriptionId) {
//       await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });
//     }
//   }
// }

// export async function POST(req: NextRequest) {
//   const body = await req.text();
//   const sig = req.headers.get('stripe-signature')!;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
//   } catch (err: any) {
//     return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
//   }

//   const session = event.data.object as Stripe.Checkout.Session;

//   switch (event.type) {
//     case 'checkout.session.completed':
//       const user = await prisma.user.update({
//         where: { id: session.client_reference_id! },
//         data: {
//           stripeCustomerId: session.customer as string,
//           stripePriceId: session.subscription as string,
//           stripeSubscriptionId: session.subscription as string,
//           subscriptionStatus: 'active',
//           stripeCurrentPeriodEnd: new Date(session.expires_at! * 1000)
//         }
//       });
//       break;

//     case 'customer.subscription.updated':
//       const subscription = event.data.object as Stripe.Subscription;
//       await prisma.user.update({
//         where: { stripeCustomerId: subscription.customer as string },
//         data: {
//           stripePriceId: subscription.items.data[0].price.id,
//           stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
//         }
//       });
//       break;

//     case 'customer.subscription.deleted':
//       const deletedSubscription = event.data.object as Stripe.Subscription;
//       await prisma.user.update({
//         where: { stripeCustomerId: deletedSubscription.customer as string },
//         data: {
//           subscriptionStatus: 'inactive',
//           stripePriceId: null,
//           stripeSubscriptionId: null
//         }
//       });
//       break;
//   }

//   return NextResponse.json({ received: true });
// }