import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { $agents } from '@/lib/db/schema'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agents = await db.select().from($agents).where(
    eq($agents.userId, userId)
  )

  return NextResponse.json({ count: agents.length })
}