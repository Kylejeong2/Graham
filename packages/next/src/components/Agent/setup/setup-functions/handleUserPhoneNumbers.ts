import { toast } from "react-toastify";

export const fetchUserPhoneNumbers = async (
  userId: string,
  setUserPhoneNumbers: (numbers: string[]) => void,
  agentNumber?: string
) => {
  try {
    const response = await fetch(`/api/user/getPhoneNumbers?userId=${userId}`, {
      method: 'GET',
    });
    
    if (!response.ok) throw new Error('Failed to fetch phone numbers');
    
    const data = await response.json();
    let phoneNumbers = typeof data.numbers === 'string' ? 
      JSON.parse(data.numbers) : 
      (Array.isArray(data.numbers) ? data.numbers : []);
      
    if (agentNumber) {
      phoneNumbers = phoneNumbers.filter((num: string) => num !== agentNumber);
      phoneNumbers.unshift(agentNumber);
    } else {
      phoneNumbers = [...new Set(phoneNumbers)];
    }
      
    setUserPhoneNumbers(phoneNumbers);
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    toast.error('Failed to load phone numbers');
    setUserPhoneNumbers(agentNumber ? [agentNumber] : []);
  }
}; 