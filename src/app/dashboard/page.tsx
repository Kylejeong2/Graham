import React from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { ArrowLeft, Plus, Coffee } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

import CreateCompadre from '@/components/Common/CreateCompadre';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '@/lib/db';
import { $compadres } from '@/lib/db/schema';

type Props = {}

const DashboardPage = async (props: Props) => {
    const { userId } = auth();
    const compadres = await db.select().from($compadres).where(
        eq($compadres.userId, userId!)
    );
    
    let subbed = false;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/checkSubscription`, {
            method: 'GET',
            headers: {
                Cookie: cookies().toString(),
            },
        });
        const data = await response.json();
        subbed = data.hasSubscription;
    } catch (error) {
        console.error('Error checking subscription:', error);
        subbed = false;
    }

    return (
        <div className='min-h-screen bg-[#F5E6D3] text-[#5D4037]'>
            <div className='max-w-7xl mx-auto p-6 md:p-10'>
                <header className='mb-8'>
                    <div className='flex justify-between items-center'>
                        <div className='flex items-center space-x-4'>
                            <Link href="/">
                                <Button variant="outline" className='border-[#8B4513] text-white hover:bg-[#E6CCB2]'>
                                    <ArrowLeft className='mr-2 w-4 h-4'/>Back
                                </Button>
                            </Link>
                            <h1 className='text-3xl font-bold text-[#8B4513]'>My Compadres</h1>
                        </div>
                        <UserButton />
                    </div>
                </header>

                <Separator className='bg-[#8B4513] opacity-20 my-6' />
                
                {compadres.length === 0 ? (
                    <Card className='bg-white shadow-lg'>
                        <CardContent className='p-6 text-center'>
                            <Coffee className='w-16 h-16 text-[#8B4513] mx-auto mb-4' />
                            <h2 className='text-xl text-[#5D4037] mb-2'>You don&apos;t have any Compadres yet!</h2>
                            <p className='text-[#795548] mb-4'>Create your first Compadre to get started.</p>
                            <CreateCompadre />
                        </CardContent>
                    </Card>
                ) : (
                    <div className='space-y-6'>
                        <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                            {(compadres.length < 1 || subbed) && (
                                <Card className='bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center h-[200px]'>
                                    <CardContent>
                                        <CreateCompadre>
                                            <Button variant="ghost" className='w-full h-full flex flex-col items-center justify-center text-[#8B4513] hover:bg-[#E6CCB2]'>
                                                <Plus className='w-12 h-12 mb-2' />
                                                <span>Create New Compadre</span>
                                            </Button>
                                        </CreateCompadre>
                                    </CardContent>
                                </Card>
                            )}
                            {compadres.map(compadre => (
                                <Link href={`/compadre/${compadre.id}`} key={compadre.id}>
                                    <Card className='bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                                        <CardHeader className='pb-2'>
                                            <Avatar className='w-16 h-16 mx-auto'>
                                                <AvatarImage src={compadre.imageUrl || ""} alt={compadre.name} />
                                                <AvatarFallback className='bg-[#E6CCB2] text-[#8B4513]'>
                                                    {compadre.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </CardHeader>
                                        <CardContent className='text-center'>
                                            <CardTitle className='text-xl font-semibold text-[#8B4513] mb-1'>{compadre.name}</CardTitle>
                                            <p className='text-sm text-[#795548]'>
                                                Created on {new Date(compadre.createdAt).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                        
                        {compadres.length >= 1 && !subbed && (
                            <Card className='bg-[#E6CCB2] border-[#8B4513] shadow-lg max-w-2xl mx-auto'>
                                <CardContent className='p-6'>
                                    <h3 className='text-2xl font-semibold text-[#8B4513] mb-2'>Unlock More Compadres!</h3>
                                    <p className="text-[#5D4037] mb-4">You&apos;ve created your first Compadre. Subscribe now to create unlimited Compadres and access premium features.</p>
                                    <Link href="/subscription">
                                        <Button className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white font-semibold py-3 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
                                            Upgrade to Premium
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;