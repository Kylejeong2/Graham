import { toast } from "react-toastify";

export const fetchVoices = async (
  setIsLoadingVoices: (value: boolean) => void,
  setVoices: (voices: any[]) => void
) => {
  setIsLoadingVoices(true);
  try {
    // const response = await fetch('/api/agent/getVoices-cartesia'); waiting for api update
    const response = await fetch('/api/agent/getVoices-eleven');
    if (!response.ok) throw new Error('Failed to fetch voices');
    const data = await response.json();
    setVoices(data.voices);
  } catch (error) {
    console.error('Error fetching voices:', error);
    toast.error('Failed to load voices');
  } finally {
    setIsLoadingVoices(false);
  }
}; 