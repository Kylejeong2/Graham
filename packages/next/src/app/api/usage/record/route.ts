import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@graham/db";
import { createUsageRecord, retrieveSubscriptionItem } from '@/configs/stripe';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { agentId, seconds } = await req.json();

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        user: {
          id: userId
        },
        status: 'active'
      }
    });

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    const subscriptionItem = await retrieveSubscriptionItem(subscription.stripeSubscriptionId);
    
    const minutes = seconds / 60;
    const roundedMinutes = Math.ceil(minutes * 100) / 100;

    await createUsageRecord(subscriptionItem.id, Math.floor(seconds));

    await prisma.usageRecord.create({
      data: {
        userId,
        agentId,
        seconds,
        minutes: roundedMinutes,
      }
    });

    return NextResponse.json({ success: true, minutesUsed: roundedMinutes });
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
  }
}