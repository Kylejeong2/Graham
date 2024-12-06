import { prisma } from "@graham/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { callId: string } }
) {
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

    await prisma.usageRecord.delete({
      where: {
        id: params.callId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CALL_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}