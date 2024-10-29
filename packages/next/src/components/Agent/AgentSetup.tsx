"use client"

import React, { useState } from 'react';
import { AgentEditing } from './AgentEditing';
import { AgentType, UserType } from '@/lib/db/schema';
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import { createRetellAgent, createRetellLLM, updateRetellPhoneNumber } from '@/services/retellAI';

export const AgentSetup: React.FC<{ agent: AgentType; user: UserType }> = ({ agent, user }) => {
    const [isCompleting, setIsCompleting] = useState(false);

    const handleCompleteSetup = async () => {
        setIsCompleting(true);
        try {
            // Create Retell AI Agent
            const LLM = await createRetellLLM({
                model: "gpt-4o-mini",
                general_prompt: agent.systemPrompt as string
            });

            const retellAgent = await createRetellAgent({
                llm_websocket_url: LLM.llm_websocket_url,
                agent_name: agent.name,
                voice_id: agent.voiceType as string,
            });

            if (agent.phoneNumber) {
                await updateRetellPhoneNumber(agent.phoneNumber, {
                    inbound_agent_id: retellAgent.agent_id,
                    outbound_agent_id: retellAgent.agent_id,
                });
            }

            // Update agent in database
            const response = await fetch(`/api/agent/completeSetup/${agent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    llmId: LLM.llm_id,
                    llmWebsocketUrl: LLM.llm_websocket_url,
                    retellAgentId: retellAgent.agent_id,
                    isSetupComplete: true
                }),
            });

            if (response.ok) {
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
            <AgentEditing agent={agent} user={user} />
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