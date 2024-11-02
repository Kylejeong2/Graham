import { prisma } from "@graham/db";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'
import { AgentTitleBar } from '@/components/Agent/AgentTitleBar';
// import { AgentEditing } from '@/components/Agent/AgentEditing';
// import { AgentTesting } from '@/components/Agent/AgentTesting';
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

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    
    if(!user){
        return redirect('/dashboard');
    }

    const agent = await prisma.agent.findFirst({
        where: {
            id: agentId,
            userId: userId
        }
    });

    if (!agent) {
        return redirect('/dashboard');
    }

    return (
        <div className='min-h-screen bg-blue-50 py-4 px-10'>
            <div className='max-w-8xl mx-auto space-y-4'>
                <AgentTitleBar 
                    agent={agent}
                />
                <Tabs defaultValue={agent.isSetupComplete ? "editing" : "setup"} className="bg-white rounded-lg p-4">
                    <TabsList className="border-b border-blue-100">
                        <TabsTrigger value="setup" className="text-blue-600">Setup</TabsTrigger>
                        <TabsTrigger value="editing" className="text-blue-600">Edit</TabsTrigger>
                        <TabsTrigger value="testing" className="text-blue-600">Testing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="setup">
                        <AgentSetup agent={agent} />
                    </TabsContent>
                    <TabsContent value="editing">
                        {/* <AgentEditing agent={agent} user={user} /> */}
                    </TabsContent>
                    <TabsContent value="testing">
                        {/* <AgentTesting agent={agent} /> */}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AgentPage;