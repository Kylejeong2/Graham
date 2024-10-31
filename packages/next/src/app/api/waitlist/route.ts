import { NextResponse } from 'next/server';
import { prisma } from "@graham/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if the email already exists in the waitlist
    const existingEntry = await prisma.waitlist.findUnique({
      where: { email }
    });

    if (existingEntry) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    // Insert the new email into the waitlist
    await prisma.waitlist.create({
      data: { email }
    });

    return NextResponse.json({ message: 'Successfully joined the waitlist' }, { status: 201 });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
