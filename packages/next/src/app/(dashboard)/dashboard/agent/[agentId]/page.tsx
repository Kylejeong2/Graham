import { prisma } from "@graham/db";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AgentTitleBar } from '@/components/Agent/components/AgentTitleBar';
import { AgentTabs } from '@/components/Agent/AgentTabs';

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
        <div className='w-full h-full bg-white'>
            <div className='w-full h-full bg-white px-6'>
                <AgentTitleBar 
                    agent={agent}
                />
                <AgentTabs agent={agent} user={user} />
            </div>
        </div>
    );
};

export default AgentPage;