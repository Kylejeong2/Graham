import { prisma } from '@graham/db'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerk } from '@/configs/clerk-server'

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fullName, businessName, businessAddress, phoneNumber, email } = await request.json()

    // Check if user exists, if not create them
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { businessAddress: true }
    })

    if (!user) {
      // Get Clerk user data
      const clerkUser = await clerk.users.getUser(userId)
      
      // Create new user with business address
      user = await prisma.user.create({
        data: {
          id: userId,
          email: email || clerkUser.emailAddresses[0].emailAddress,
          fullName: fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          businessAddress: businessAddress ? {
            create: {
              street: businessAddress.street,
              city: businessAddress.city,
              state: businessAddress.state,
              postalCode: businessAddress.postalCode,
              verified: businessAddress.verified
            }
          } : undefined
        },
        include: { businessAddress: true }
      })
    } else {
      // Update user with onboarding details
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          fullName,
          businessName,
          businessAddress: {
            upsert: {
              create: {
                street: businessAddress.street,
                city: businessAddress.city,
                state: businessAddress.state,
                postalCode: businessAddress.postalCode,
                verified: businessAddress.verified
              },
              update: {
                street: businessAddress.street,
                city: businessAddress.city,
                state: businessAddress.state,
                postalCode: businessAddress.postalCode,
                verified: businessAddress.verified
              }
            }
          },
          user_phoneNumber: phoneNumber,
          email,
        },
        include: { businessAddress: true }
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
