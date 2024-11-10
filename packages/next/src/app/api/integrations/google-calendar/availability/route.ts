import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCalendarAvailability } from '@/lib/google-calendar';

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const { agentId, startTime, endTime } = await req.json();

        if (!userId || !agentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const busySlots = await getCalendarAvailability(
            userId,
            agentId,
            new Date(startTime),
            new Date(endTime)
        );

        return NextResponse.json({ busySlots });
    } catch (error) {
        console.error('Failed to check calendar availability:', error);
        return NextResponse.json(
            { error: 'Failed to check calendar availability' }, 
            { status: 500 }
        );
    }
}