import { toast } from "react-toastify";
import type { User, BusinessAddress } from '@graham/db';

export const fetchUserData = async (userId: string): Promise<(User & { businessAddress: BusinessAddress | null }) | null> => {
  try {
    const response = await fetch('/api/user/get-info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    toast.error('Failed to load user data');
    return null;
  }
}; 