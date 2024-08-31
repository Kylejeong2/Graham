import { clerk } from '@/configs/clerk-server';
import { db } from '@/lib/db';
import { $compadres } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import { CompadreTitleBar } from '@/components/Compadre/CompadreTitleBar';
import { ChatInterface } from '@/components/Compadre/ChatInterface';

type Props = {
    params: {
        compadreId: string
    }
};

const CompadrePage = async ({params: { compadreId }}: Props) => {
    const {userId} = await auth()
    
    if (!userId){
        return redirect('/dashboard');
    }

    const user = await clerk.users.getUser(userId);

    const serializedUser = user ? {
        id: user.id, 
        firstName: user.firstName,
        lastName: user.lastName,
    } : null; 

    const compadres = await db.select().from($compadres).where(
        and(
            eq($compadres.id, compadreId),
            eq($compadres.userId, userId)
    ))

    if (compadres.length != 1) {
        return redirect('/dashboard');
    }

    const compadre = compadres[0];
    const characteristicsArray = Array.isArray(compadre.characteristics)
        ? compadre.characteristics
        : typeof compadre.characteristics === 'string'
            ? (compadre.characteristics as string).split(',')
            : [];

    return (
        <div className='min-h-screen grainy p-8'>
            <div className='max-w-6xl mx-auto'>
                <CompadreTitleBar 
                    compadre={{...compadre, characteristics: characteristicsArray}} 
                    user={serializedUser}
                />

                <div className="h-4"></div>
                <div className='border-stone-200 shadow-xl border rounded-lg px-16 py-8 w-full'>
                    <ChatInterface 
                        user={serializedUser}
                        compadreName={compadre.name}
                        compadreId={compadre.id} 
                        characteristics={characteristicsArray.join(',')}
                    />
                </div>
            </div>
        </div>
    )
}

export default CompadrePage;