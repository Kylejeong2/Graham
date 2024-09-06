import React from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { ArrowLeft, Plus, Coffee } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

import { CreateAgent } from '@/components/Common/CreateAgent';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '@/lib/db';
import { $agents } from '@/lib/db/schema';
import { checkSubscription } from '@/components/Dashboard/CheckSub';
import { Loader2 } from 'lucide-react'; 

type Props = {}

const DashboardPage = async (props: Props) => {
    const { userId } = auth();
    const agents = await db.select().from($agents).where(
        eq($agents.userId, userId!)
    );
    
    const subbed = await checkSubscription();

    while (subbed === undefined) {
        return (
            <div className='min-h-screen bg-[#F5E6D3] flex justify-center items-center'>
                <Loader2 className="w-16 h-16 animate-spin text-[#8B4513]" />
            </div>
        );
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
                            <h1 className='text-3xl font-bold text-[#8B4513]'>My Phone Agents</h1>
                        </div>
                        <UserButton />
                    </div>
                </header>

                <Separator className='bg-[#8B4513] opacity-20 my-6' />
                
                {!subbed || (subbed && agents.length >= 1) ? (
                    <Card className='bg-white shadow-lg'>
                        <CardContent className='p-6 text-center'>
                            <Coffee className='w-16 h-16 text-[#8B4513] mx-auto mb-4' />
                            <h2 className='text-xl text-[#5D4037] mb-2'>
                                {agents.length === 0 ? "You don't have any Agents yet!" : "Unlock More Agents!"}
                            </h2>
                            <p className='text-[#795548] mb-4'>
                                {agents.length === 0
                                    ? "Subscribe now to create Agents and access premium features."
                                    : "Upgrade to Enterprise to create more agents."}
                            </p>
                            <Link href="/subscription">
                                <Button className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white font-semibold py-3 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
                                    Upgrade to Premium
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className='space-y-6'>
                        <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                            <Card className='bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center h-[200px]'>
                                <CardContent>
                                    <CreateAgent>
                                        <Button variant="ghost" className='w-full h-full flex flex-col items-center justify-center text-[#8B4513] hover:bg-[#E6CCB2]'>
                                            <Plus className='w-12 h-12 mb-2' />
                                            <span>Create New Phone Agent</span>
                                        </Button>
                                    </CreateAgent>
                                </CardContent>
                            </Card>
                            {agents.map(agent => (
                                <Link href={`/agent/${agent.id}`} key={agent.id}>
                                    <Card className='bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                                        <CardHeader className='pb-2'>
                                            <Avatar className='w-16 h-16 mx-auto'>
                                                <AvatarFallback className='bg-[#E6CCB2] text-[#8B4513]'>
                                                    {agent.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </CardHeader>
                                        <CardContent className='text-center'>
                                            <CardTitle className='text-xl font-semibold text-[#8B4513] mb-1'>{agent.name}</CardTitle>
                                            <p className='text-sm text-[#795548]'>
                                                Created on {new Date(agent.createdAt).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;