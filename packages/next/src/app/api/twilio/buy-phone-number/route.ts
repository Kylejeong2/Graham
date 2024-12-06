import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { prisma } from '@graham/db';

export async function POST(req: Request) {
  try {
    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
    const { userId, phoneNumber, agentId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        phoneNumbers: true,
        businessAddress: true,
        businessName: true
      }
    });

    if (!user?.businessAddress) {
      return NextResponse.json(
        { error: 'Business address required to purchase phone number' }, 
        { status: 400 }
      );
    }

    const emergencyAddress = await client.addresses.create({
      customerName: user.businessName || 'Business',
      street: user.businessAddress.street,
      city: user.businessAddress.city,
      region: user.businessAddress.state,
      postalCode: user.businessAddress.postalCode,
      isoCountry: user.businessAddress.country,
      emergencyEnabled: true
    });

    const purchasedNumber = await client.incomingPhoneNumbers
      .create({ 
        phoneNumber,
        addressSid: emergencyAddress.sid,
        emergencyStatus: 'Active',
        emergencyAddressSid: emergencyAddress.sid
      });

    let currentNumbers = [];
    try {
      currentNumbers = Array.isArray(user?.phoneNumbers) ? 
        user.phoneNumbers : 
        JSON.parse(user?.phoneNumbers as string) || [];
    } catch (e) {
      currentNumbers = [];
    }

    await prisma.user.update({
      where: { id: userId },
      data: { 
        phoneNumbers: [...currentNumbers, phoneNumber]
      }
    });

    await prisma.agent.update({
      where: { id: agentId },
      data: { phoneNumber }
    });

    return NextResponse.json({ 
      number: phoneNumber,
      sid: purchasedNumber.sid 
    });

  } catch (error) {
    console.error('Error buying number:', error);
    return NextResponse.json(
      { error: 'Failed to purchase number' }, 
      { status: 500 }
    );
  }
} 