import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { $usageRecords } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { agentId, minutes } = await req.json();

  try {
    // Record usage
    await db.insert($usageRecords).values({
      userId,
      agentId,
      minutesUsed: minutes.toString(),
      secondsUsed: (minutes * 60).toString(),
      voiceType: 'text-to-speech',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
  }
}