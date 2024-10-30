import { prisma } from "@graham/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { name, phoneNumber, systemPrompt, voiceType, areaCode } = body;

  try {
    const updatedAgent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        name,
        phoneNumber,
        systemPrompt,
        voiceType,
        areaCode,
      }
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error("Error updating agent:", error);
    return new NextResponse("Failed to update agent", {
      status: 500,
    });
  }
}