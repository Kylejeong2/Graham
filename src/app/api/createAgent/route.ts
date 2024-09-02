import { db } from "@/lib/db";
import { $agents } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { name } = body;

  try {
    const agent_ids = await db
      .insert($agents)
      .values({
        name,
        userId,
      })
      .returning({
        insertedId: $agents.id,
      });

    return NextResponse.json({
      agent_id: agent_ids[0].insertedId,
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    return new NextResponse("Failed to create agent", {
      status: 500,
    });
  }
}