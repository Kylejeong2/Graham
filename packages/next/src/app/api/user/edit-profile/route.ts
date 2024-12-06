import { prisma } from '@graham/db';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { businessAddress } = await request.json();

        // Basic validation
        if (!businessAddress.street || !businessAddress.city || 
            !businessAddress.state || !businessAddress.postalCode) {
            return NextResponse.json(
                { error: 'All address fields are required' }, 
                { status: 400 }
            );
        }

        // Verify address format
        if (!/^\d{5}$/.test(businessAddress.postalCode)) {
            return NextResponse.json(
                { error: 'Invalid ZIP code format' }, 
                { status: 400 }
            );
        }

        if (!/^[A-Z]{2}$/i.test(businessAddress.state)) {
            return NextResponse.json(
                { error: 'Invalid state format' }, 
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                businessAddress: {
                    upsert: {
                        create: {
                            ...businessAddress,
                            verified: true
                        },
                        update: {
                            ...businessAddress,
                            verified: true
                        }
                    }
                }
            },
            include: {
                businessAddress: true
            }
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' }, 
            { status: 500 }
        );
    }
}
