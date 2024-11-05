import { prisma } from "@graham/db";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'
import { AgentTitleBar } from '@/components/Agent/AgentTitleBar';
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

    const user = await prisma.user.findFirst({
        where: { id: userId }
    });
    
    if(!user){
        return redirect('/dashboard');
    }

    const agent = await prisma.agent.findFirst({
        where: {
            id: agentId
        }
    });

    if (!agent) {
        return redirect('/dashboard');
    }

    return (
        <div className='h-full bg-blue-50 py-4 px-10 scrollbar-hide'>
            <div className='max-w-8xl mx-auto space-y-4 h-full scrollbar-hide'>
                <AgentTitleBar agent={agent} />
                <Tabs defaultValue={agent.isSetupComplete ? "editing" : "setup"} className="bg-white rounded-lg p-4 h-[calc(100%-5rem)] scrollbar-hide">
                    <TabsList className="border-b border-blue-100">
                        <TabsTrigger value="setup" className="text-blue-600">Setup</TabsTrigger>
                        <TabsTrigger value="testing" className="text-blue-600">Testing</TabsTrigger>
                        <TabsTrigger value="call-logs" className="text-blue-600">Call Logs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="setup">
                        <AgentSetup agentId={agentId} />
                    </TabsContent>
                    <TabsContent value="testing">
                        {/* <AgentTesting agent={agent} /> */}
                    </TabsContent>
                    <TabsContent value="call-logs">
                        {/* <AgentCallLogs agent={agent} /> */}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AgentPage;