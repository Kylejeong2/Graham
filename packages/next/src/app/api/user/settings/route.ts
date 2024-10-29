import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { $userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { stopLossAmount } = await req.json();
  try {
    await db
      .insert($userSettings)
      .values({
        userId,
        stopLossAmount,
      })
      .onConflictDoUpdate({
        target: $userSettings.userId,
        set: { stopLossAmount },
        where: eq($userSettings.userId, userId),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Failed to update user settings' }, { status: 500 });
  }
}