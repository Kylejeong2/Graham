import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { $compadres } from '@/lib/db/schema'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const compadres = await db.select().from($compadres).where(
    eq($compadres.userId, userId)
  )

  return NextResponse.json({ count: compadres.length })
}