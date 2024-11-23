import { toast } from "react-toastify";
import type { Agent } from '@graham/db';

export const fetchAgentData = async (
  agentId: string,
  setIsLoading: (value: boolean) => void,
  setCustomInstructions: (value: string) => void,
  setSelectedVoice: (value: string | null) => void,
  setSelectedVoiceName: (value: string) => void,
  setConversationType: (value: 'user' | 'ai-default' | 'ai-custom') => void,
  setInitialMessage: (value: string) => void,
  setSelectedPhoneNumber: (value: string) => void
) => {
  if (!agentId) {
    setIsLoading(false);
    toast.error('No agent ID provided');
    return;
  }

  setIsLoading(true);
  try {
    const response = await fetch(`/api/agent/getAgentData/${agentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch agent data');
    }
    const agent: Agent = await response.json();
    
    if (agent.systemPrompt) {
      setCustomInstructions(agent.systemPrompt);
    }
    if (agent.voiceId) {
      setSelectedVoice(agent.voiceId);
    }
    if (agent.voiceName) {
      setSelectedVoiceName(agent.voiceName);
    }
    if (agent.initiateConversation !== undefined) {
      if (!agent.initiateConversation) {
        setConversationType('user');
      } else {
        setConversationType(
          agent.initialMessage === "Hello! How can I assist you today?"
            ? 'ai-default'
            : 'ai-custom'
        );
      }
    }
    if (agent.initialMessage) {
      setInitialMessage(agent.initialMessage);
    }
    if (agent.phoneNumber) {
      setSelectedPhoneNumber(agent.phoneNumber);
    }
  } catch (error) {
    console.error('Error fetching agent data:', error);
    toast.error('Failed to load agent data');
  } finally {
    setIsLoading(false);
  }
}; 