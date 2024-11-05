import { prisma } from '@graham/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, fullName, businessName, phoneNumber } = await request.json()

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        businessName,
        user_phoneNumber: phoneNumber
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
