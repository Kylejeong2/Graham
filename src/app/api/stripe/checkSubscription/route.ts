import { clerk } from "@/configs/clerk-server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db"
import { $users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    const user = (await db.select().from($users).where(eq($users.id, userId)))[0];
    
    // Check the user's metadata for subscription status and type
    const hasSubscription = (user.subscriptionStatus === "active");

    return NextResponse.json({ hasSubscription });

  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}