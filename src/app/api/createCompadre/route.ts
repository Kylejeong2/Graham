import { db } from "@/lib/db";
import { $compadres } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { name, characteristics } = body;

  try {
    const compadre_ids = await db
      .insert($compadres)
      .values({
        name,
        userId,
        characteristics,
      })
      .returning({
        insertedId: $compadres.id,
      });

    return NextResponse.json({
      compadre_id: compadre_ids[0].insertedId,
    });
  } catch (error) {
    console.error("Error creating compadre and chatroom:", error);
    return new NextResponse("Failed to create compadre and chatroom", {
      status: 500,
    });
  }
}