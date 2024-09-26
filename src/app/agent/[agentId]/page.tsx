import { db } from '@/lib/db';
import { $agents, $users, AgentType, UserType } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react'
import { AgentTitleBar } from '@/components/Agent/AgentTitleBar';
import { AgentEditing } from '@/components/Agent/AgentEditing';
import { AgentTesting } from '@/components/Agent/AgentTesting';
import { AgentAnalytics } from '@/components/Agent/AgentAnalytics';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AgentSetup } from '@/components/Agent/AgentSetup';

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

    const userResult = await db.select().from($users).where(eq($users.id, userId));
    const user: UserType | undefined = userResult[0];
    
    if(!user){
        return redirect('/dashboard');
    }

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
                    user={user}
                    agent={agent}
                />

                <Tabs defaultValue={agent.isSetupComplete ? "setup" : "testing"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-[#E6CCB2] p-1 rounded-lg shadow-md">
                        <TabsTrigger 
                            value="setup"
                            className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
                        >
                            {agent.isSetupComplete ? 'Edit' : 'Setup'}
                        </TabsTrigger>
                        <TabsTrigger 
                            value="testing"
                            className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
                            disabled={!agent.isSetupComplete}
                        >
                            Testing
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="setup" className="mt-6">
                        {agent.isSetupComplete ? (
                            <AgentEditing agent={agent} user={user} />
                        ) : (
                            <AgentSetup agent={agent} user={user} />
                        )}
                    </TabsContent>
                    <TabsContent value="testing" className="mt-6">
                        <AgentTesting agent={agent} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AgentPage;