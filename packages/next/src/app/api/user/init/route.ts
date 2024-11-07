import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerk } from '@/configs/clerk-server';
import { prisma } from "@graham/db";

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      // User doesn't exist, so let's add them
      const clerkUser = await clerk.users.getUser(userId);

      await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          fullName: `${clerkUser.firstName} ${clerkUser.lastName}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
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