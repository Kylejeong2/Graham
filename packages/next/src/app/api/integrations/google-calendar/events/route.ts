import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGoogleCalendarClient } from '@/lib/google-calendar';

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const { agentId, event } = await req.json();

        if (!userId || !agentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const calendar = await getGoogleCalendarClient(userId, agentId);
        
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: event.summary,
                description: event.description,
                start: {
                    dateTime: event.startTime,
                    timeZone: event.timeZone,
                },
                end: {
                    dateTime: event.endTime,
                    timeZone: event.timeZone,
                },
                attendees: event.attendees,
            },
        });

        return NextResponse.json({ event: response.data });
    } catch (error) {
        console.error('Failed to create calendar event:', error);
        return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
    }
}