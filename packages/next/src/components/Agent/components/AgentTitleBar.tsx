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
    <Card className="bg-white shadow-sm w-full">
      <CardContent className="p-2">
        <div className='flex items-center justify-between w-full'>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" replace>
              <Button variant="outline" size="sm" className="border-blue-500 text-black hover:bg-orange-50">
                <ArrowLeft className="w-3 h-3 mr-1" /> Back
              </Button>
            </Link>
          </div>
          <div className="flex-grow w-full" /> 
          <DeleteButton agentId={agentState.id as string}/>
        </div>
      </CardContent>
    </Card>
  )
}