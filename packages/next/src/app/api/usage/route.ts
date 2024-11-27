import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from "@graham/db";
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { agentId, minutes } = await req.json();

  try {
    // Record usage
    await prisma.usageRecord.create({
      data: {
        userId,
        agentId,
        minutes,
        seconds: minutes * 60,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
  }
}