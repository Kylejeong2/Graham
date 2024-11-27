import { prisma } from "@graham/db";
import { NextResponse } from "next/server";

export async function GET( req: Request ) {
  try {
    const { agentId } = await req.json();

    const agent = await prisma.agent.findUnique({
      where: {
        id: agentId,
      },
    });

    if (!agent) {
      return new NextResponse("Agent not found", { status: 404 });
    }

    const calls = await prisma.usageRecord.findMany({
      where: {
        agentId,
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });

    return NextResponse.json(calls);
  } catch (error) {
    console.error("[CALLS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}