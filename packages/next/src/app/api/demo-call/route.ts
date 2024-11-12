import { NextResponse } from 'next/server';
import { prisma } from "@graham/db";
import { SipClient } from 'livekit-server-sdk';

export async function POST(req: Request) {
  if (!process.env.LIVEKIT_URL || !process.env.LIVEKIT_API_KEY || 
      !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_DEMO_SIP_TRUNK_ID) {
    throw new Error('Missing required LiveKit configuration');
  }

  const livekit = new SipClient(
    process.env.LIVEKIT_URL!,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );

  try {
    const { name, email, phoneNumber } = await req.json();

    if (!name || !email || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save lead to database
    await prisma.lead.upsert({
      where: { email },
      update: { 
        name,
        phoneNumber,
      },
      create: {
        name,
        email,
        phoneNumber,
      }
    });

    // Format phone number for SIP
    const formattedPhoneNumber = `${phoneNumber.replace(/\D/g, '')}`;

    // Create SIP participant
    const participant = await livekit.createSipParticipant(
      process.env.LIVEKIT_DEMO_SIP_TRUNK_ID!,
      formattedPhoneNumber,
      'demo-worker',
      {
        playDialtone: true,
      }
    ).catch(error => {
      console.error('LiveKit SIP error details:', {
        error: error.message,
        trunkId: process.env.LIVEKIT_DEMO_SIP_TRUNK_ID,
        phoneNumber: formattedPhoneNumber,
        fullError: error
      });
      
      throw new Error(`LiveKit SIP error: ${error.message}`);
    });

    if (!participant) {
      throw new Error('Failed to create SIP participant');
    }

    return NextResponse.json({ message: 'Demo call initiated successfully' });
  } catch (error) {
    console.error('Error initiating demo call:', error);
    return NextResponse.json({ error: 'Failed to initiate demo call' }, { status: 500 });
  }
}
