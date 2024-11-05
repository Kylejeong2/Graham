import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@graham/db";

import { CreateAgent } from '@/components/Agent/CreateAgent';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
    const { userId } = auth();

    if(!userId) {
        redirect('/sign-in');
    }
    
    const user = await prisma.user.findUnique({
        where: {
            id: userId!
        }
    });

    const agents = await prisma.agent.findMany({
        where: {
            userId: user?.id
        }
    });

    const isSubscribed = user?.subscriptionStatus === 'active';

    return (
        <div className='min-h-screen bg-white text-blue-900'>
            <div className='max-w-7xl mx-auto p-6 md:p-10'>
                <header className='mb-8'>
                    <div className='flex justify-between items-center'>
                        <div className='flex items-center space-x-4'>
                            <Link href="/">
                                <Button variant="outline" className='border-blue-600 text-blue-600 hover:bg-blue-100'>
                                    <ArrowLeft className='mr-2 w-4 h-4'/>Back
                                </Button>
                            </Link>
                            <h1 className='text-3xl font-bold text-black'>My Workers</h1>
                        </div>
                        {/* <UserButton /> */}
                    </div>
                </header>

                <Separator className='bg-blue-500 my-6' />
                
                {agents.length === 0 ? (
                    <Card className='bg-white shadow-lg'>
                        <CardContent className='p-6 text-center'>
                            {/* <Coffee className='w-16 h-16 text-blue-600 mx-auto mb-4' /> */}
                            <h2 className='text-xl text-blue-900 mb-2'>You don&apos;t have any Agents yet!</h2>
                            <p className='text-blue-700 mb-4'>Create your first Agent to get started.</p>
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
                                            <Button variant="ghost" className='w-full h-full flex flex-col items-center justify-center text-blue-600 hover:bg-blue-50'>
                                                <Plus className='w-12 h-12 mb-2' />
                                                <span>Create New Agent</span>
                                            </Button>
                                        </CreateAgent>
                                    </CardContent>
                                </Card>
                            )}
                            {agents.map(agent => (
                                <Link href={`/dashboard/agent/${agent.id}`} key={agent.id}>
                                    <Card className='bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                                        <CardHeader className='pb-2'>
                                            <Avatar className='w-16 h-16 mx-auto'>
                                                <AvatarFallback className='bg-blue-100 text-black'>
                                                    {agent.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </CardHeader>
                                        <CardContent className='text-center'>
                                            <CardTitle className='text-xl font-semibold text-blue-900 mb-1'>{agent.name}</CardTitle>
                                            <p className='text-sm text-blue-700'>
                                                Created on {new Date(agent.createdAt).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                        {(agents.length >= 1 || !isSubscribed) && (
                            <Card className='bg-blue-50 border-blue-200 shadow-lg max-w-2xl mx-auto'>
                                <CardContent className='p-6'>
                                    <h3 className='text-2xl font-semibold text-blue-900 mb-2'>Unlock More Agents!</h3>
                                    <p className="text-blue-700 mb-4">You&apos;ve created your first Agent. You'll need an enterprise plan for more agents.</p>
                                    <Link href="/contact">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
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