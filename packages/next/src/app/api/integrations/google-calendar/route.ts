import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@graham/db';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/google-calendar/callback`
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/calendar.readonly'
        ],
        state: JSON.stringify({ userId })
    });

    return NextResponse.json({ url: authUrl });
}

export async function POST(req: Request) {
    try {
        const { code, agentId } = await req.json();
        const { userId } = auth();
        
        if (!userId || !agentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/google-calendar/callback`
        );

        const { tokens } = await oauth2Client.getToken(code);
        
        // Store tokens in database
        await prisma.googleCalendarIntegration.upsert({
            where: {
                userId_agentId: {
                    userId,
                    agentId
                }
            },
            create: {
                userId,
                agentId,
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token!,
                expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600000)),
            },
            update: {
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token!,
                expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600000)),
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Google Calendar integration error:', error);
        return NextResponse.json({ error: 'Failed to integrate with Google Calendar' }, { status: 500 });
    }
}
