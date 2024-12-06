import { toast } from "react-toastify";

export const handleVoiceSelect = async (
  voice: any,
  agentId: string,
  customInstructions: string,
  setSelectedVoice: (id: string) => void,
  setSelectedVoiceName: (name: string) => void,
  onClose: () => void
) => {
  try {
    setSelectedVoice(voice.voice_id);
    setSelectedVoiceName(voice.name);
    onClose();

    const updateData = {
      agentId,
      systemPrompt: customInstructions,
      voiceId: voice.voice_id,  
      voiceName: voice.name,    
    };
    
    const response = await fetch(`/api/agent/updateAgent`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();
    
    if (response.ok) {
      toast.success('Voice updated successfully');
    } else {
      throw new Error(result.error || 'Failed to update voice');
    }
  } catch (error) {
    console.error('Error updating voice:', error);
    toast.error('Failed to update voice selection');
  }
}; 