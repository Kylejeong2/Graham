import { auth } from '@clerk/nextjs/server'
import { prisma } from "@graham/db";
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  const count = await prisma.agent.count({
    where: {
      userId: user?.id
    }
  });

  return NextResponse.json({ count })
}