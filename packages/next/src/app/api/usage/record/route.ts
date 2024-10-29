import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { $usageRecords } from '@/lib/db/schema';
import { createUsageRecord, retrieveSubscriptionItem } from '@/configs/stripe';
import { clerk } from '@/configs/clerk-server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { agentId, seconds, voiceType } = await req.json();

  try {
    const user = await clerk.users.getUser(userId);
    const stripeSubscriptionId = user.privateMetadata.stripeSubscriptionId as string;

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    const subscriptionItem = await retrieveSubscriptionItem(stripeSubscriptionId);
    
    const minutes = seconds / 60;
    const roundedMinutes = Math.ceil(minutes * 100) / 100; // Round up to 2 decimal places

    // Record usage in Stripe
    await createUsageRecord(subscriptionItem.id, Math.floor(seconds));

    // Record usage in database
    await db.insert($usageRecords).values({
      userId,
      agentId,
      secondsUsed: seconds.toString(),
      minutesUsed: roundedMinutes.toString(),
      voiceType,
    });

    return NextResponse.json({ success: true, minutesUsed: roundedMinutes });
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
  }
}