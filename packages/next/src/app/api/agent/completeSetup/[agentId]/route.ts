import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { $agents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
    req: Request,
    { params }: { params: { agentId: string } }
) {
    try {
        const { agentId } = params;
        const { llmId, llmWebsocketUrl, retellAgentId, isSetupComplete } = await req.json();

        const updatedAgent = await db
            .update($agents)
            .set({ 
                llmId, 
                llmWebsocketUrl, 
                retellAgentId, 
                isSetupComplete 
            })
            .where(eq($agents.id, agentId))
            .returning();

        return NextResponse.json(updatedAgent[0]);
    } catch (error) {
        console.error('Error updating agent:', error);
        return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
    }
}