import { prisma } from "@graham/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { agentId } = await req.json(); // TODO: take phone number to delete

    // Fetch the agent from the database
    const agent = await prisma.agent.findUnique({
        where: { id: agentId }
    });

    if (!agent) {
        return new NextResponse('Agent not found', { status: 404 });
    }

    // Delete the agent from the database
    await prisma.agent.delete({
        where: { id: agentId }
    });

    return new NextResponse('ok', { status: 200 });
}