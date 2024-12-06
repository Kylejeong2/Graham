import { toast } from "react-toastify";
import debounce from 'lodash/debounce';

interface MessageUpdateProps {
  agentId: string;
  newMessage: string;
  setIsSaving: (value: boolean) => void;
}

export const updateInitialMessage = async ({
  agentId,
  newMessage,
  setIsSaving
}: MessageUpdateProps) => {
  try {
    const response = await fetch(`/api/agent/updateAgent`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        initialMessage: newMessage,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update message');
    }
  } catch (error) {
    console.error('Error updating message:', error);
    toast.error('Failed to update initial message');
  } finally {
    setIsSaving(false);
  }
};

export const createDebouncedMessageUpdate = (
  agentId: string,
  setIsSaving: (value: boolean) => void
) => {
  return debounce((newMessage: string) => {
    setIsSaving(true);
    updateInitialMessage({ agentId, newMessage, setIsSaving });
  }, 3000);
}; 