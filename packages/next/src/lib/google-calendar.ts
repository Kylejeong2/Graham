import { google } from 'googleapis';
import { prisma } from '@graham/db';

export async function getGoogleCalendarClient(userId: string, agentId: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/google-calendar/callback`
    );

    const integration = await prisma.googleCalendarIntegration.findUnique({
        where: {
            userId_agentId: {
                userId,
                agentId
            }
        }
    });

    if (!integration) {
        throw new Error('No Google Calendar integration found');
    }

    // Check if token needs refresh
    if (integration.expiresAt < new Date()) {
        oauth2Client.setCredentials({
            refresh_token: integration.refreshToken
        });

        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Update tokens in database
        await prisma.googleCalendarIntegration.update({
            where: {
                id: integration.id
            },
            data: {
                accessToken: credentials.access_token!,
                expiresAt: new Date(Date.now() + (credentials.expiry_date || 3600000))
            }
        });

        oauth2Client.setCredentials(credentials);
    } else {
        oauth2Client.setCredentials({
            access_token: integration.accessToken,
            refresh_token: integration.refreshToken
        });
    }

    return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function getCalendarAvailability(
    userId: string, 
    agentId: string, 
    startTime: Date, 
    endTime: Date
) {
    const calendar = await getGoogleCalendarClient(userId, agentId);
    
    const response = await calendar.freebusy.query({
        requestBody: {
            timeMin: startTime.toISOString(),
            timeMax: endTime.toISOString(),
            items: [{ id: 'primary' }]
        }
    });

    return response.data.calendars?.primary?.busy || [];
}