import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerk } from '@/configs/clerk-server';
import { createPortalSession } from '@/configs/stripe';

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await clerk.users.getUser(userId);
    const stripeCustomerId = user.privateMetadata.stripeCustomerId as string;

    if (!stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/profile/${userId}`;
    const portalUrl = await createPortalSession(stripeCustomerId, returnUrl);

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}