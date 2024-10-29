import { NextResponse } from 'next/server';
import { createRetellPhoneCall } from '@/services/retellAI';
import { db } from '@/lib/db';
import { $leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { name, email, phoneNumber } = await req.json();

    // Validate input
    if (!name || !email || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the email already exists in the database
    const existingLead = await db.select().from($leads).where(eq($leads.email, email)).limit(1);

    if (existingLead.length === 0) {
      // Create a new lead in the database if the email doesn't exist
      await db.insert($leads).values({
        name,
        email,
        phoneNumber,
      });
    }

    const formattedPhoneNumber = `+1${phoneNumber.replace(/\D/g, '')}`;
    // Initiate the demo call using Retell AI
    const callResponse = await createRetellPhoneCall("+14158765628", formattedPhoneNumber);

    return NextResponse.json({ message: 'Demo call initiated successfully', callDetails: callResponse });
  } catch (error) {
    console.error('Error initiating demo call:', error);
    return NextResponse.json({ error: 'Failed to initiate demo call' }, { status: 500 });
  }
}
