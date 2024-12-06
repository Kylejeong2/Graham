import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@graham/db";

export async function GET() {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { 
        user: {
          id: userId
        },
        // status: { in: ['active', 'enterprise'] },
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if(!user?.hasPaymentSetup) {
      return NextResponse.json({ hasSubscription: false, user, subscriptionStatus: subscription?.status });
    }

    return NextResponse.json({ hasSubscription: true, user, subscriptionStatus: subscription?.status });

  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}