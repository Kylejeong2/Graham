export async function joinWaitlist(email: string) {
  const response = await fetch('/api/waitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to join waitlist');
  }
  
  return response.json();
}