import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGoogleCalendarClient } from '@/lib/google-calendar';

export async function DELETE(
    req: Request,
    { params }: { params: { eventId: string } }
) {
    try {
        const { userId } = auth();
        const { agentId } = await req.json();

        if (!userId || !agentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const calendar = await getGoogleCalendarClient(userId, agentId);
        
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: params.eventId,
            sendUpdates: 'all' // Notify attendees
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete calendar event:', error);
        return NextResponse.json(
            { error: 'Failed to delete calendar event' }, 
            { status: 500 }
        );
    }
}