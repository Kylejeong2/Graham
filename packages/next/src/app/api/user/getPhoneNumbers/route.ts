import { prisma } from '@graham/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    return NextResponse.json({ numbers: user?.phoneNumbers || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch phone numbers' }, { status: 500 });
  }
}
