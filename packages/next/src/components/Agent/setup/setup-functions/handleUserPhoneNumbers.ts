import { toast } from "react-toastify";

export const fetchUserPhoneNumbers = async (
  userId: string,
  setUserPhoneNumbers: (numbers: string[]) => void
) => {
  try {
    const response = await fetch(`/api/user/getPhoneNumbers?userId=${userId}`, {
      method: 'GET',
    });
    
    if (!response.ok) throw new Error('Failed to fetch phone numbers');
    
    const data = await response.json();
    const phoneNumbers = typeof data.numbers === 'string' ? 
      JSON.parse(data.numbers) : 
      (Array.isArray(data.numbers) ? data.numbers : []);
      
    setUserPhoneNumbers(phoneNumbers);
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    toast.error('Failed to load phone numbers');
    setUserPhoneNumbers([]);
  }
}; 