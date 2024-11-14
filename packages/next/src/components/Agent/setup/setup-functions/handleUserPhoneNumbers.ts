import { toast } from "react-toastify";

export const fetchUserPhoneNumbers = async (
  userId: string,
  setUserPhoneNumbers: (numbers: string[]) => void
) => {
  try {
    const response = await fetch(`/api/twilio/get-user-numbers/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch phone numbers');
    
    const data = await response.json();
    setUserPhoneNumbers(data.numbers);
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    toast.error('Failed to load phone numbers');
  }
}; 