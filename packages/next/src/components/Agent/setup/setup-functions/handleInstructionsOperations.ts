import { toast } from "react-toastify";
import debounce from 'lodash/debounce';

export const handleEnhanceInstructions = async (
  customInstructions: string,
  agentId: string,
  setCustomInstructions: (instructions: string) => void,
  setIsEnrichingInstructions: (value: boolean) => void
) => {
  if (!customInstructions) {
    toast.warn('Please add some instructions first');
    return;
  }

  setIsEnrichingInstructions(true);
  try {
    const response = await fetch('/api/agent/enrich-instructions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructions: customInstructions,
        agentId,
      }),
    });

    if (!response.ok) throw new Error('Failed to enhance instructions');
    
    const data = await response.json();
    setCustomInstructions(data.enhancedInstructions as string);
    toast.success('Instructions enhanced successfully');
  } catch (error) {
    console.error('Error enhancing instructions:', error);
    toast.error('Failed to enhance instructions');
  } finally {
    setIsEnrichingInstructions(false);
  }
};

export const createDebouncedInstructionUpdate = (
  agentId: string,
  setIsSaving: (value: boolean) => void
) => {
  return debounce(async (newInstructions: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/agent/updateAgent`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          systemPrompt: newInstructions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update instructions');
      }
    } catch (error) {
      console.error('Error updating instructions:', error);
      toast.error('Failed to update instructions');
    } finally {
      setIsSaving(false);
    }
  }, 3000);
}; 