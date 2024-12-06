import { NextResponse } from 'next/server';
import { prisma } from '@graham/db';

export async function GET(request: Request) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);

    } catch (error) {
        console.error('Error fetching user info:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user information' },
            { status: 500 }
        );
    }
}
