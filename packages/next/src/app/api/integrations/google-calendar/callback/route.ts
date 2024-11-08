import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@graham/db';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/google-calendar/callback`
);

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/error?message=Invalid authorization`);
    }

    try {
        const { userId, agentId } = JSON.parse(state);
        
        // Get tokens from Google
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

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL}/agent/setup?success=true&integration=google-calendar`
        );
    } catch (error) {
        console.error('Google Calendar callback error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/error?message=Failed to authenticate`);
    }
}