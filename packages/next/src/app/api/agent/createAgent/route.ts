import { prisma } from "@graham/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { Agent } from "@graham/db";

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { name } = body;

  try {
    const agent = await prisma.agent.create({
      data: {
        name,
        userId,
      },
      select: {
        id: true
      }
    });

    return NextResponse.json({
      agent: agent as Agent,
      agent_id: agent.id,
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    return new NextResponse("Failed to create agent", {
      status: 500,
    });
  }
}