export async function initiateDemo(data: { name: string; email: string; phoneNumber: string }) {
  const response = await fetch('/api/demo-call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) throw new Error('Failed to initiate demo call')
  return response.json()
}