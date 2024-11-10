import { prisma } from "@graham/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { agentId, deletePhoneNumber } = await req.json(); 

    const agent = await prisma.agent.findUnique({
        where: { id: agentId }
    });

    if (deletePhoneNumber) {
        await prisma.user.update({
            where: { id: agent?.userId },
            data: {
                phoneNumbers: {
                    set: {
                        array_remove: agent?.phoneNumber
                    }
                }
            }
        })
    }

    if (!agent) {
        return new NextResponse('Agent not found', { status: 404 });
    }

    // Delete the agent from the database
    await prisma.agent.delete({
        where: { id: agentId }
    });

    return new NextResponse('ok', { status: 200 });
}