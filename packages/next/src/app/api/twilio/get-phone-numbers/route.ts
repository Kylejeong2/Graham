import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    // Make sure to properly initialize the client with both credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
    throw new Error('Missing Twilio credentials');
    }

    const client = twilio(accountSid, authToken);
    const { areaCode, countryCode = 'US' } = await req.json();

    if (!areaCode) {
      return NextResponse.json({ error: 'Area code is required' }, { status: 400 });
    }

    const availableNumbers = await client.availablePhoneNumbers(countryCode)
      .local.list({
        areaCode,
        limit: 20,
        voiceEnabled: true,
        smsEnabled: true
      });

    return NextResponse.json({ 
      numbers: availableNumbers.map(num => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality,
        region: num.region,
        isoCountry: num.isoCountry,
        capabilities: num.capabilities
      }))
    });

  } catch (error: any) {
    console.error('Error details:', {
      status: error.status,
      code: error.code,
      message: error.message
    });
    
    if (error.code === 20003) {
      return NextResponse.json({ 
        error: 'Authentication failed. Please check Twilio credentials.' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch numbers' 
    }, { status: 500 });
  }
}
