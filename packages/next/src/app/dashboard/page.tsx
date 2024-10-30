import React from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { ArrowLeft, Plus, Coffee } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@graham/db";

import { CreateAgent } from '@/components/Common/CreateAgent';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const DashboardPage = async () => {
    const { userId } = auth();
    const agents = await prisma.agent.findMany({
        where: {
            userId: userId!
        }
    });

    const user = await prisma.user.findUnique({
        where: {
            id: userId!
        }
    });

    const isSubscribed = user?.subscriptionStatus === 'active';

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
                            <h1 className='text-3xl font-bold text-[#8B4513]'>My Agents</h1>
                        </div>
                        <UserButton />
                    </div>
                </header>

                <Separator className='bg-[#8B4513] opacity-20 my-6' />
                
                {agents.length === 0 ? (
                    <Card className='bg-white shadow-lg'>
                        <CardContent className='p-6 text-center'>
                            <Coffee className='w-16 h-16 text-[#8B4513] mx-auto mb-4' />
                            <h2 className='text-xl text-[#5D4037] mb-2'>You don&apos;t have any Agents yet!</h2>
                            <p className='text-[#795548] mb-4'>Create your first Agent to get started.</p>
                            <CreateAgent />
                        </CardContent>
                    </Card>
                ) : (
                    <div className='space-y-6'>
                        <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                            {(agents.length < 1 && isSubscribed) && (
                                <Card className='bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center h-[200px]'>
                                    <CardContent>
                                        <CreateAgent>
                                            <Button variant="ghost" className='w-full h-full flex flex-col items-center justify-center text-[#8B4513] hover:bg-[#E6CCB2]'>
                                                <Plus className='w-12 h-12 mb-2' />
                                                <span>Create New Agent</span>
                                            </Button>
                                        </CreateAgent>
                                    </CardContent>
                                </Card>
                            )}
                            {agents.map(agent => (
                                <Link href={`/agent/${agent.id}`} key={agent.id}>
                                    <Card className='bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                                        <CardHeader className='pb-2'>
                                            <Avatar className='w-16 h-16 mx-auto'>
                                                {/* <AvatarImage src={""} alt={agent.name} /> */}
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
                        {(agents.length >= 1 || !isSubscribed) && (
                            <Card className='bg-[#E6CCB2] border-[#8B4513] shadow-lg max-w-2xl mx-auto'>
                                <CardContent className='p-6'>
                                    <h3 className='text-2xl font-semibold text-[#8B4513] mb-2'>Unlock More Agents!</h3>
                                    <p className="text-[#5D4037] mb-4">You&apos;ve created your first Agent. You'll need an enterprise plan for more agents.</p>
                                    <Link href="/subscription">
                                        <Button className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white font-semibold py-3 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
                                            Upgrade to Enterprise
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