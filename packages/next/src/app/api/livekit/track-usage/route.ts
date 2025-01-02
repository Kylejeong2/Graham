import { NextResponse } from 'next/server';
import { prisma } from '@graham/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, durationInSeconds } = await req.json();
    if (!agentId || !durationInSeconds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create usage record
    await prisma.usageRecord.create({
      data: {
        userId,
        agentId,
        durationInMinutes: Math.ceil(durationInSeconds / 60), // Round up to nearest minute (prorated to minutes)
        timestamp: new Date(),
        billed: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 