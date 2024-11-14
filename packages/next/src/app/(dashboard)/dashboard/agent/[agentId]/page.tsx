import { prisma } from "@graham/db";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'
import { AgentTitleBar } from '@/components/Agent/AgentTitleBar';
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
        <div className='h-full bg-white py-4 px-10'>
            <div className='max-w-8xl mx-auto space-y-4 h-full bg-white'>
                <AgentTitleBar 
                    agent={agent}
                />
                <Tabs defaultValue={agent.isSetupComplete ? "editing" : "setup"} className="bg-white h-full rounded-lg p-4">
                    <TabsList className="border-b border-blue-100">
                        <TabsTrigger value="setup" className="text-blue-600">Setup</TabsTrigger>
                        <TabsTrigger value="testing" className="text-blue-600">Testing</TabsTrigger>
                        <TabsTrigger value="analytics" className="text-blue-600">Analytics</TabsTrigger>
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