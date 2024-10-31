// TODO: demo call setup

// import { NextResponse } from 'next/server';
// import { prisma } from "@graham/db";

// export async function POST(req: Request) {
//   try {
//     const { name, email, phoneNumber } = await req.json();

//     // Validate input
//     if (!name || !email || !phoneNumber) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     // Check if the email already exists in the database
//     const existingLead = await prisma.lead.findUnique({
//       where: { email }
//     });

//     if (!existingLead) {
//       // Create a new lead in the database if the email doesn't exist
//       await prisma.lead.create({
//         data: {
//           name,
//           email,
//           phoneNumber,
//         }
//       });
//     }

//     const formattedPhoneNumber = `+1${phoneNumber.replace(/\D/g, '')}`;
//     // Initiate the demo call using Retell AI
//     // const callResponse = await createRetellPhoneCall("+14158765628", formattedPhoneNumber);

//     return NextResponse.json({ message: 'Demo call initiated successfully' });
//   } catch (error) {
//     console.error('Error initiating demo call:', error);
//     return NextResponse.json({ error: 'Failed to initiate demo call' }, { status: 500 });
//   }
// }
