import { auth } from "@clerk/nextjs/server";
import { clerk } from "@/configs/clerk-server";
import { storeSubscriptionPlans, stripe } from "@/configs/stripe";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const user = await clerk.users.getUser(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined;
  const stripePriceId = user.privateMetadata.stripePriceId as string | undefined;
  const stripeSubscriptionId = user.privateMetadata.stripeSubscriptionId as string | undefined;
  const stripeCurrentPeriodEnd = user.privateMetadata.stripeCurrentPeriodEnd as string | undefined;
  const subscriptionName = user.privateMetadata.subscriptionName as string | undefined;
  const isSubscribed = stripePriceId && stripeCurrentPeriodEnd && new Date(stripeCurrentPeriodEnd).getTime() + 86_400_000 > Date.now();
  const isYearly = user.privateMetadata.isYearly as boolean | undefined;
  const subscriptionCancelAt = user.privateMetadata.subscriptionCancelAt as string | undefined;
  const subscriptionStatus = user.privateMetadata.subscriptionStatus as string | undefined;

  const plan = isSubscribed
    ? storeSubscriptionPlans.find(
        (plan) => plan.stripePriceId === stripePriceId
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
    subscriptionStatus,
    isYearly,
  });
}