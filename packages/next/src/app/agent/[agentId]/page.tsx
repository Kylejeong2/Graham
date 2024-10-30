import { prisma } from "@graham/db";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'
import { AgentTitleBar } from '@/components/Agent/AgentTitleBar';
// import { AgentEditing } from '@/components/Agent/AgentEditing';
import { AgentTesting } from '@/components/Agent/AgentTesting';
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
        <div className='min-h-screen bg-[#F5E6D3] py-4 px-10'>
            <div className='max-w-8xl mx-auto space-y-4'>
                <AgentTitleBar 
                    user={user}
                    agent={agent}
                />
                <Tabs defaultValue={agent.isSetupComplete ? "editing" : "setup"}>
                    <TabsList>
                        <TabsTrigger value="setup">Setup</TabsTrigger>
                        <TabsTrigger value="editing">Edit</TabsTrigger>
                        <TabsTrigger value="testing">Testing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="setup">
                        <AgentSetup agent={agent} user={user} />
                    </TabsContent>
                    <TabsContent value="editing">
                        {/* <AgentEditing agent={agent} user={user} /> */}
                    </TabsContent>
                    <TabsContent value="testing">
                        <AgentTesting agent={agent} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AgentPage;