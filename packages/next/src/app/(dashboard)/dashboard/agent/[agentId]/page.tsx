import { prisma } from "@graham/db";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'
import { AgentTitleBar } from '@/components/Agent/components/AgentTitleBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AgentSetup } from '@/components/Agent/AgentSetup';
import { AgentTesting } from "@/components/Agent/AgentTesting";
import { AgentAnalytics } from '@/components/Agent/AgentAnalytics';

type Props = {
    params: {
        agentId: string
    }
};

const AgentPage = async ({params: { agentId }}: Props) => {
    const {userId} = auth()
    
    if (!userId) return redirect('/dashboard')

    const [user, agent] = await Promise.all([
        prisma.user.findFirst({ where: { id: userId } }),
        prisma.agent.findFirst({ where: { id: agentId } })
    ])

    if (!user || !agent) return redirect('/dashboard')

    return (
        <div className='h-full bg-white px-10 overflow-y-auto'>
            <div className='max-w-8xl mx-auto h-full bg-white'>
                <AgentTitleBar 
                    agent={agent}
                />
                <Tabs defaultValue={agent.isSetupComplete ? "editing" : "setup"} className="bg-white h-full rounded-lg pt-2">
                    <TabsList className="hidden">
                        <TabsTrigger value="setup">Setup</TabsTrigger>
                        <TabsTrigger value="testing">Testing</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>
                    <TabsContent value="setup">
                        <AgentSetup agent={agent} user={user} />
                    </TabsContent>
                    <TabsContent value="testing">
                        <AgentTesting agent={agent} />
                    </TabsContent>
                    <TabsContent value="analytics">
                        <AgentAnalytics agent={agent} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AgentPage;