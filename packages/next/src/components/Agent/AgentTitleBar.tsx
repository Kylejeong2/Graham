'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DeleteButton from '@/components/Common/DeleteButton';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { UserType, AgentType } from '@/lib/db/schema';

type Props = {
  agent: AgentType;
  user: UserType;
};

export const AgentTitleBar: React.FC<Props> = ({ agent, user }) => {
  const [agentState, setAgentState] = useState(agent);
  const [newName, setNewName] = useState(agent.name || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAgentState(agent);
    setNewName(agent.name || '');
  }, [agent]);

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-4">
        <div className='flex items-center justify-between'>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" replace>
              <Button variant="outline" size="sm" className="border-[#8B4513] text-white hover:bg-[#E6CCB2]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <div className="text-[#5D4037] font-semibold">
              {user ? `${user.name}` : 'User'}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <DeleteButton agentId={agentState.id as string}/>
          </div>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </CardContent>
    </Card>
  )
}