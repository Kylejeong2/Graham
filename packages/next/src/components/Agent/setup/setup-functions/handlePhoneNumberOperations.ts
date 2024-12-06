import { toast } from "react-toastify";

export const handlePhoneNumberSelect = async (
  phoneNumber: string,
  agentId: string,
  setSelectedPhoneNumber: (number: string) => void
) => {
  try {
    setSelectedPhoneNumber(phoneNumber);
    
    const response = await fetch(`/api/agent/updateAgent`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        phoneNumber,
      }),
    });

    if (!response.ok) throw new Error('Failed to update phone number');
    toast.success('Phone number updated successfully');
  } catch (error) {
    console.error('Error updating phone number:', error);
    toast.error('Failed to update phone number');
  }
}; 