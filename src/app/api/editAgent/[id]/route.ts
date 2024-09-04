import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { $agents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, phoneNumber, isActive, systemPrompt, voiceType, businessHours, customResponses } = body;
        const id = params.id;

        if (!id || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate that the agent belongs to the authenticated user
        const existingAgent = await db.select().from($agents).where(eq($agents.id, id)).limit(1);
        if (existingAgent.length === 0 || existingAgent[0].userId !== userId) {
            return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 });
        }

        // Update the agent in the database
        await db.update($agents)
            .set({
                name,
                phoneNumber,
                isActive,
                systemPrompt,
                voiceType,
                businessHours,
                customResponses
            })
            .where(eq($agents.id, id));

        return NextResponse.json({ message: 'Agent updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating agent:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}