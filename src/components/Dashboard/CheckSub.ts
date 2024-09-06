import { cookies } from 'next/headers';

export async function checkSubscription() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/checkSubscription`, {
            method: 'GET',
            headers: {
                Cookie: cookies().toString(),
            },
        });
        const data = await response.json();
        return data.hasSubscription;
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
}