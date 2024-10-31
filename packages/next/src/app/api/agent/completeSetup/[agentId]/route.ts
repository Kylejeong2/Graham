// TODO: setup agent creation with backend
import { NextResponse } from 'next/server';
import { prisma } from "@graham/db";

export async function PATCH(
    req: Request,
    { params }: { params: { agentId: string } }
) {
    try {
        const { agentId } = params;
        const { isSetupComplete } = await req.json();

        const updatedAgent = await prisma.agent.update({
            where: { id: agentId },
            data: { 
                isSetupComplete 
            }
        });

        return NextResponse.json(updatedAgent);
    } catch (error) {
        console.error('Error updating agent:', error);
        return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
    }
}