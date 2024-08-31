import { clerk } from "@/configs/clerk-server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await clerk.users.getUser(userId);
    
    // Check the user's metadata for subscription status and type
    const hasSubscription = user.publicMetadata.hasSubscription === true;

    return NextResponse.json({ hasSubscription });

  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}