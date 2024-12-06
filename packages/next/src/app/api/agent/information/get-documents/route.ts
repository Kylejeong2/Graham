import { NextResponse } from 'next/server';
import { prisma } from '@graham/db';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const documents = await prisma.businessDocument.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                uploadedAt: true
            },
            orderBy: {
                uploadedAt: 'desc'
            }
        });

        return NextResponse.json(documents);

    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}
