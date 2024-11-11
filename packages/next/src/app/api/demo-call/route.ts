import { NextResponse } from 'next/server';
import { prisma } from "@graham/db";
import { RoomServiceClient } from 'livekit-server-sdk';

// Initialize LiveKit client
const livekit = new RoomServiceClient(
  process.env.LIVEKIT_API_ENDPOINT!,
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
    const lead = await prisma.lead.create({
      data: { name, email, phoneNumber }
    });

    // Format phone number for SIP
    const formattedPhoneNumber = `+1${phoneNumber.replace(/\D/g, '')}`;
    const participantId = `demo-${lead.id}`;

    // Create or get room
    const room = await livekit.createRoom({
      name: 'demo-worker',
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 2,
    });

    // Create SIP participant
    const participant = await livekit.createSIPParticipant({
      roomName: room.name,
      participantIdentity: participantId,
      participantName: name,
      sipCallTo: formattedPhoneNumber,
      sipTrunkId: process.env.LIVEKIT_DEMO_SIP_TRUNK_ID!,
      playRingtone: true,
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
