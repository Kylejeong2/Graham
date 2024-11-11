import { NextResponse } from 'next/server';
import { prisma } from "@graham/db";
import { SipClient } from 'livekit-server-sdk';

const livekit = new SipClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
  try {
    const { name, email, phoneNumber } = await req.json();

    if (!name || !email || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save lead to database
    await prisma.lead.create({
      data: { name, email, phoneNumber }
    });

    // Format phone number for SIP
    const formattedPhoneNumber = `+1${phoneNumber.replace(/\D/g, '')}`;

    // Create SIP participant
    const participant = await livekit.createSIPParticipant({
      sipTrunkId: process.env.LIVEKIT_DEMO_SIP_TRUNK_ID!,
      roomName: 'My outbound trunk',
      number: formattedPhoneNumber,
      opts: {
        playDialtone: true,
      }
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
