import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@graham/db";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { redirect } from 'next/navigation';
import AgentMap from '@/components/dashboard/AgentMap';
import type { User } from '@graham/db';
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

    const subscription = await prisma.subscription.findFirst({
        where: {
            user: {
                id: user?.id
            }
        }
    });

    const isSubscribed = subscription?.status === 'active';
    const isEnterprise = subscription?.status === 'enterprise';

    return (
        <div className='h-full bg-white text-blue-900'>
            <div className='max-w-7xl mx-auto p-6 md:p-10'>
                <header className='mb-8'>
                    <div className='flex justify-between items-center'>
                        <div className='flex items-center space-x-4'>
                            <Link href="/">
                                <Button variant="outline" className='border-blue-600 text-blue-600 hover:bg-blue-100'>
                                    <ArrowLeft className='mr-2 w-4 h-4'/>Back
                                </Button>
                            </Link>
                            <h1 className='text-3xl font-bold text-black'>My Agents</h1>
                        </div>
                        {/* <UserButton /> */}
                    </div>
                </header>

                <Separator className='bg-blue-500 my-6' />
                
                <AgentMap agents={agents} isSubscribed={isSubscribed} isEnterprise={isEnterprise} user={user as User} />
            </div>
        </div>
    );
}

export default DashboardPage;