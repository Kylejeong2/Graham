import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { $users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { clerk } from '@/configs/clerk-server';

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user already exists in our database
    const existingUser = await db.select().from($users).where(eq($users.id, userId)).limit(1);

    if (existingUser.length === 0) {
      // User doesn't exist, so let's add them
      const clerkUser = await clerk.users.getUser(userId);

      await db.insert($users).values({
        id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({ message: 'User initialized successfully' }, { status: 201 });
    } else {
      return NextResponse.json({ message: 'User already initialized' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error initializing user:', error);
    return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 });
  }
}