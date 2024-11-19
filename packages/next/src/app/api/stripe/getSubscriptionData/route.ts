import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/configs/stripe";
import { NextResponse } from "next/server";
import { plans } from "@/constants/plans";
import { prisma } from "@graham/db";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      user: {
        id: userId
      }
    }
  });

  if (!subscription) {
    return NextResponse.json({
      isSubscribed: false
    });
  }

  const { stripeCustomerId, stripePriceId, stripeSubscriptionId, stripeCurrentPeriodEnd,
    subscriptionName, subscriptionStatus, subscriptionCancelAt } = subscription;

  const isSubscribed = stripePriceId && stripeCurrentPeriodEnd && new Date(stripeCurrentPeriodEnd).getTime() + 86_400_000 > Date.now();

  const plan = isSubscribed
    ? plans.find(
        (plan) => plan.id.toLowerCase() === subscriptionName?.toLowerCase()
      )
    : null;

  let isCanceled = false;
  if (isSubscribed && stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return NextResponse.json({
    ...plan,
    subscriptionName,
    stripeSubscriptionId, 
    stripeCurrentPeriodEnd,
    stripeCustomerId,
    isSubscribed,
    isCanceled,
    subscriptionCancelAt,
    subscriptionStatus
  });
}