"use client"

import React, { useState } from 'react';
// import { AgentEditing } from './AgentEditing';
import type { Agent, User } from '@graham/db';
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';

export const AgentSetup: React.FC<{ agent: Agent; user: User }> = ({ agent, user }) => {
    const [isCompleting, setIsCompleting] = useState(false);

    const handleCompleteSetup = async () => {
        setIsCompleting(true);
        try {
            // setup agent
            

            // Update agent in database
            const response = await fetch(`/api/agent/completeSetup/${agent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isSetupComplete: true
                }),
            });

            if (user && response.ok) { // don't need user just temp for commit
                toast.success('Setup completed successfully');
                window.location.reload(); // Reload to switch to editing mode
            } else {
                throw new Error('Failed to complete setup');
            }
        } catch (error) {
            console.error('Error completing setup:', error);
            toast.error('Failed to complete setup');
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div>
            {/* <AgentEditing agent={agent} user={user} /> */}
            <div className="mt-4">
                <Button 
                    onClick={handleCompleteSetup}
                    className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
                    disabled={isCompleting}
                >
                    {isCompleting ? 'Completing Setup...' : 'Complete Setup'}
                </Button>
            </div>
        </div>
    );
};