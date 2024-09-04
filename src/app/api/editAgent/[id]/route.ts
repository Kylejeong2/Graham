import { db } from "@/lib/db";
import { $agents } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { name, phoneNumber, systemPrompt, isActive, voiceType, retellAgentId, retellPhoneNumberId, areaCode } = body;

  try {
    const updatedAgent = await db
      .update($agents)
      .set({
        name,
        phoneNumber,
        systemPrompt,
        isActive,
        voiceType,
        retellAgentId,
        retellPhoneNumberId,
        areaCode,
      })
      .where(eq($agents.id, params.id))
      .returning();

    return NextResponse.json(updatedAgent[0]);
  } catch (error) {
    console.error("Error updating agent:", error);
    return new NextResponse("Failed to update agent", {
      status: 500,
    });
  }
}