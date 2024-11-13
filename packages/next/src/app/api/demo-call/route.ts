// import { NextResponse } from 'next/server';
// import { prisma } from "@graham/db";
// import { SipClient } from 'livekit-server-sdk';
// import twilio from 'twilio';

// export async function POST(req: Request) {
//   if (!process.env.LIVEKIT_URL || !process.env.LIVEKIT_API_KEY || 
//       !process.env.LIVEKIT_API_SECRET || !process.env.TWILIO_ACCOUNT_SID ||
//       !process.env.TWILIO_AUTH_TOKEN) {
//     throw new Error('Missing required configuration');
//   }

//   const livekit = new SipClient(
//     process.env.LIVEKIT_URL!,
//     process.env.LIVEKIT_API_KEY,
//     process.env.LIVEKIT_API_SECRET
//   );

//   const twilioClient = twilio(
//     process.env.TWILIO_ACCOUNT_SID!,
//     process.env.TWILIO_AUTH_TOKEN!
//   );

//   try {
//     const { name, email, phoneNumber } = await req.json();
//     console.log('Received request data:', { name, email, phoneNumber });

//     if (!name || !email || !phoneNumber) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     // Save lead to database
//     await prisma.lead.upsert({
//       where: { email },
//       update: { name, phoneNumber },
//       create: { name, email, phoneNumber }
//     });

//     // Format phone number for SIP
//     const formattedPhoneNumber = `+1${phoneNumber.replace(/\D/g, '')}`;

//     // Generate unique credentials for this call
//     const sipUsername = `demo_${Date.now()}`;
//     const sipPassword = `${Math.random().toString(36).slice(2,8)}Aa1${Math.random().toString(36).slice(2,8)}`;

//     await twilioClient.sip.credentialLists('CL12e1bd27acda42bc16c00906cf1fcf45')
//       .credentials
//       .create({
//         username: sipUsername,
//         password: sipPassword
//       });

//     const trunk = await livekit.createSipOutboundTrunk(
//       'demo-trunk',
//       'graham-demo-worker.pstn.twilio.com',
//       [formattedPhoneNumber],
//       {
//         auth_username: sipUsername,
//         auth_password: sipPassword,
//         transport: 0,
//       }
//     );
//     console.log('Created trunk with ID:', trunk.sipTrunkId);

//     console.log('Creating SIP participant');
//     const participant = await livekit.createSipParticipant(
//       trunk.sipTrunkId,
//       formattedPhoneNumber,
//       'demo-worker',
//       {
//         playDialtone: true,
//         participantIdentity: sipUsername,
//         participantName: name
//       }
//     );

//     if (!participant) {
//       console.error('Participant creation failed');
//       throw new Error('Failed to create SIP participant');
//     }
//     console.log('Successfully created participant');

//     return NextResponse.json({ message: 'Demo call initiated successfully' });
//   } catch (error) {
//     console.error('Error initiating demo call:', error);
//     return NextResponse.json(
//       { error: 'Failed to initiate demo call' }, 
//       { status: 500 }
//     );
//   }
// }

import { prisma } from '@graham/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, phoneNumber } = await req.json();
    console.log('Received request data:', { name, email, phoneNumber });

    if (!name || !email || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!name || !email || !phoneNumber) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      
    // Save lead to database
    await prisma.lead.upsert({
      where: { email },
      update: { name, phoneNumber },
      create: { name, email, phoneNumber }
    });
    
    // Return static phone number instead of initiating call
    return NextResponse.json({ 
      message: 'Demo call initiated successfully',
      phoneNumber: '8778815735'
    });
  } catch (error) {
    console.error('Error processing demo request:', error);
    return NextResponse.json(
      { error: 'Failed to process demo request' }, 
      { status: 500 }
    );
  }
}
