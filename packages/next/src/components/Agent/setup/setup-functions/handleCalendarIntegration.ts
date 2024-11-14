import { toast } from "react-toastify";

export const handleGoogleAuth = async (
  setIsConnectingCalendar: (value: boolean) => void
) => {
  setIsConnectingCalendar(true);
  try {
    const response = await fetch('/api/integrations/google-calendar');
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