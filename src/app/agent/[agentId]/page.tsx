import { clerk } from '@/configs/clerk-server';
import { db } from '@/lib/db';
import { $agents } from '@/lib/db/schema';
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

type Agent = {
    id: string;
    name: string;
    phoneNumber: string | null;
    isActive: boolean | null;
    systemPrompt: string | null;
    voiceType: string | null;
    userId: string;
    createdAt: Date;
    businessHours: unknown;
    callHistory: unknown;
    customResponses: unknown;
}

const AgentPage = async ({params: { agentId }}: Props) => {
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

    const agents = await db.select().from($agents).where(
        and(
            eq($agents.id, agentId),
            eq($agents.userId, userId)
    ))

    if (agents.length != 1) {
        return redirect('/dashboard');
    }

    const agent = agents[0];

    return (
        <div className='min-h-screen bg-[#F5E6D3] p-8'>
            <div className='max-w-6xl mx-auto space-y-8'>
                <AgentTitleBar 
                    user={serializedUser}
                    agent={agent}
                />

                <Tabs defaultValue="setup" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-[#E6CCB2] p-1 rounded-lg shadow-md">
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
                        <TabsTrigger 
                            value="analytics"
                            className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
                        >
                            Analytics
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="setup" className="mt-6">
                        <AgentSetup agent={agent} />
                    </TabsContent>
                    <TabsContent value="testing" className="mt-6">
                        <AgentTesting agent={agent} />
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-6">
                        <AgentAnalytics agent={agent} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default AgentPage;