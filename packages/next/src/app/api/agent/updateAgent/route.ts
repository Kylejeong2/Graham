import { prisma } from "@graham/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { 
            agentId, 
            systemPrompt, 
            voiceId, 
            voiceName, 
            phoneNumber,
            initiateConversation,
            initialMessage,
            ragDocumentId
        } = body;

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
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (initiateConversation !== undefined) updateData.initiateConversation = initiateConversation;
        if (initialMessage !== undefined) updateData.initialMessage = initialMessage;
        if (ragDocumentId !== undefined) updateData.ragDocumentId = ragDocumentId;

        const updatedAgent = await prisma.agent.update({
            where: { id: agentId },
            data: updateData
        });

        return NextResponse.json(updatedAgent);
    } catch (error) {
        console.error('Error updating agent:', error);
        return NextResponse.json(
            { error: 'Failed to update agent', details: (error as Error).message },
            { status: 500 }
        );
    }
}