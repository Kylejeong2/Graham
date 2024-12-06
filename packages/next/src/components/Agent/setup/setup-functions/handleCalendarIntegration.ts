import { toast } from "react-toastify";

export const handleGoogleAuth = async (
  setIsConnectingCalendar: (value: boolean) => void,
  agentId: string
) => {
  setIsConnectingCalendar(true);
  try {
    const response = await fetch('/api/integrations/google-calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error('Failed to start Google Calendar auth:', error);
    toast.error('Failed to connect to Google Calendar');
  } finally {
    setIsConnectingCalendar(false);
  }
}; 