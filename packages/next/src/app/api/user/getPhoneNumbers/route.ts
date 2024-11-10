import { prisma } from '@graham/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    return NextResponse.json({ phoneNumbers: user?.phoneNumbers })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
