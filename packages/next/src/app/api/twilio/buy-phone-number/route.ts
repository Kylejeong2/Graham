import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { prisma } from '@graham/db';

export async function POST(req: Request) {
  try {
    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
    const { userId, phoneNumber } = await req.json();

    const purchasedNumber = await client.incomingPhoneNumbers
      .create({ phoneNumber });

    // Update the user's phone numbers
    await prisma.user.update({
      where: { id: userId },
      data: { phoneNumbers: { push: purchasedNumber.phoneNumber } }
    });

    return NextResponse.json({ 
      number: purchasedNumber.phoneNumber,
      sid: purchasedNumber.sid 
    });

  } catch (error) {
    console.error('Error buying number:', error);
    return NextResponse.json({ error: 'Failed to purchase number' }, { status: 500 });
  }
} 