import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { $waitlist } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if the email already exists in the waitlist
    const existingEntry = await db.select().from($waitlist).where(eq($waitlist.email, email)).execute();

    if (existingEntry.length > 0) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    // Insert the new email into the waitlist
    await db.insert($waitlist).values({ email }).execute();

    return NextResponse.json({ message: 'Successfully joined the waitlist' }, { status: 201 });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
