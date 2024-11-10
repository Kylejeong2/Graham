'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DeleteButton from '@/components/Common/DeleteButton';
import { ArrowLeft } from 'lucide-react';
import type { Agent } from '@graham/db';

type Props = {
  agent: Agent;
};

export const AgentTitleBar: React.FC<Props> = ({ agent }) => {
  const [agentState, setAgentState] = useState(agent);

  useEffect(() => {
    setAgentState(agent);
  }, [agent]);

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-4">
        <div className='flex items-center justify-between'>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" replace>
              <Button variant="outline" size="sm" className="border-blue-500 text-black hover:bg-orange-50">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <div className="text-black font-semibold">
              {/* {user ? `${user.name}` : 'User'} */}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <DeleteButton agentId={agentState.id as string}/>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}