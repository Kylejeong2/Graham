import { NextResponse } from 'next/server';
import { prisma } from "@graham/db";

export async function PATCH(req: Request) {
    try {
        const { systemPrompt, voiceId, voiceName, agentId } = await req.json();
        
        // Validate required fields
        if (!agentId) {
            return NextResponse.json(
                { error: 'Agent ID is required' },
                { status: 400 }
            );
        }

        // Check if agent exists
        const existingAgent = await prisma.agent.findUnique({
            where: { id: agentId }
        });

        if (!existingAgent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        const updateData: any = {};
        if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;
        if (voiceId !== undefined) updateData.voiceId = voiceId;
        if (voiceName !== undefined) updateData.voiceName = voiceName;

        const updatedAgent = await prisma.agent.update({
            where: { id: agentId },
            data: updateData
        });

        // console.log('Agent updated successfully:', updatedAgent);
        return NextResponse.json(updatedAgent);

    } catch (error) {
        console.error('Error updating agent:', error);
        return NextResponse.json(
            { error: 'Failed to update agent', details: (error as Error).message },
            { status: 500 }
        );
    }
}