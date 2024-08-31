import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { $compadres } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, characteristics } = body;
        const id = params.id;

        if (!id || !name || !characteristics) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate that the compadre belongs to the authenticated user
        const existingCompadre = await db.select().from($compadres).where(eq($compadres.id, id)).limit(1);
        if (existingCompadre.length === 0 || existingCompadre[0].userId !== userId) {
            return NextResponse.json({ error: 'Compadre not found or unauthorized' }, { status: 404 });
        }

        // Update the compadre in the database
        await db.update($compadres)
            .set({
                name: name,
                characteristics: characteristics,
            })
            .where(eq($compadres.id, id));

        return NextResponse.json({ message: 'Compadre updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating compadre:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}