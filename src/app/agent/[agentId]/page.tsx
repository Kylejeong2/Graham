import { clerk } from '@/configs/clerk-server';
import { db } from '@/lib/db';
import { $agents, $users, AgentType, UserType } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react'
import { AgentTitleBar } from '@/components/Agent/AgentTitleBar';
import { AgentSetup } from '@/components/Agent/AgentSetup';
import { AgentTesting } from '@/components/Agent/AgentTesting';
import { AgentAnalytics } from '@/components/Agent/AgentAnalytics';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type Props = {
    params: {
        agentId: string
    }
};

const AgentPage = async ({params: { agentId }}: Props) => {
    const {userId} = auth()
    
    if (!userId){
        return redirect('/dashboard');
    }

    const user = await db.select().from($users).where(eq($users.id, userId))

    const serializedUser: UserType | null = user.length > 0 ? {
        id: user[0].id, 
        name: user[0].name ?? '',
        email: user[0].email,
        phoneNumbers: user[0].phoneNumbers as string[] ?? [],
        createdAt: user[0].createdAt,
        updatedAt: user[0].updatedAt,
        emailVerified: user[0].emailVerified,
        image: user[0].image,
        stripeCustomerId: user[0].stripeCustomerId,
    } : null; 

    const agents = await db.select().from($agents).where(
        and(
            eq($agents.id, agentId),
            eq($agents.userId, userId)
    ))

    if (agents.length !== 1) {
        return redirect('/dashboard');
    }

    const agent: AgentType = agents[0];

    // Ensure the logged-in user owns the agent
    if (agent.userId !== userId) {
        return redirect('/dashboard');
    }

    return (
        <div className='min-h-screen bg-[#F5E6D3] py-4 px-10'>
            <div className='max-w-8xl mx-auto space-y-4'>
                <AgentTitleBar 
                    user={serializedUser}
                    agent={agent}
                />

                <Tabs defaultValue="setup" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-[#E6CCB2] p-1 rounded-lg shadow-md">
                        <TabsTrigger 
                            value="setup"
                            className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
                        >
                            Setup
                        </TabsTrigger>
                        <TabsTrigger 
                            value="testing"
                            className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
                        >
                            Testing
                        </TabsTrigger>
                        {/* <TabsTrigger 
                            value="analytics"
                            className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
                        >
                            Analytics
                        </TabsTrigger> */}
                    </TabsList>
                    <TabsContent value="setup" className="mt-6">
                        <AgentSetup agent={agent} user={serializedUser} />
                    </TabsContent>
                    <TabsContent value="testing" className="mt-6">
                        <AgentTesting agent={agent} />
                    </TabsContent>
                    {/* <TabsContent value="analytics" className="mt-6">
                        <AgentAnalytics agent={agent} />
                    </TabsContent> */}
                </Tabs>
            </div>
        </div>
    ) 
}

export default AgentPage;