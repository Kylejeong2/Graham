import { prisma } from "@graham/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { phoneNumber, systemPrompt, voiceId, areaCode } = body;

  try {
    const updatedAgent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        phoneNumber,
        systemPrompt,
        voiceId,
        areaCode,
      }
    });

    return NextResponse.json(updatedAgent, { status: 200 });
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: 'Failed to update agent' }, 
      { status: 500 }
    );
  }
}