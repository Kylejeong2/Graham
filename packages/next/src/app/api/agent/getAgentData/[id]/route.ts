import { prisma } from "@graham/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        if (!params?.id) {
            return NextResponse.json(
                { error: 'Agent ID is required' }, 
                { status: 400 }
            );
        }

        const agent = await prisma.agent.findFirst({ 
            where: { id: params.id }
        });

        if (!agent) {
            return NextResponse.json(
                { error: 'Agent not found' }, 
                { status: 404 }
            );
        }

        return NextResponse.json(agent);
    } catch (error) {
        console.error('Error fetching agent data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agent data' }, 
            { status: 500 }
        );
    }
}   