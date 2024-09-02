'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import DeleteButton from '@/components/Common/DeleteButton';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';

type Props = {
  agent: {
    userId: string;
    id: string;
    name: string;
    createdAt: Date;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

export const AgentTitleBar: React.FC<Props> = ({ agent, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [agentState, setAgentState] = useState(agent);
  const [newName, setNewName] = useState(agent.name || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAgentState(agent);
    setNewName(agent.name || '');
  }, [agent]);

  const handleSave = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/editAgent/${agentState.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
        }),
      });

      if (response.status === 200) {
        const updatedAgent = await response.json();
        setAgentState(prevState => ({
          ...prevState,
          name: updatedAgent.name,
          characteristics: updatedAgent.characteristics,
        }));
        window.location.reload();
        window.addEventListener('load', () => {
          setIsEditing(false);
        }, { once: true });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update agent');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-6">
        <div className='flex items-center justify-between'>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" replace>
              <Button variant="outline" size="sm" className="border-[#8B4513] text-white hover:bg-[#E6CCB2]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <div className="text-[#5D4037] font-semibold">
              {user ? `${user.firstName || ''} ${user.lastName || ''}` : 'User'}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <>
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border-[#8B4513] text-[#5D4037]"
                />
                <Button onClick={handleSave} variant="outline" size="sm" className="border-[#8B4513] bg-[#8B4513] text-white hover:bg-[#A0522D]">
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="border-[#8B4513] text-[#8B4513] hover:bg-[#E6CCB2]">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </>
            ) : (
              <>
                <span className='text-[#8B4513] font-semibold'>
                  {agentState.name}
                </span>
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="border-[#8B4513] text-white hover:bg-[#E6CCB2]">
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
              </>
            )}
            <DeleteButton agentId={agentState.id}/>
          </div>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </CardContent>
    </Card>
  )
}