export const fetchBusinessDocuments = async (
    userId: string,
    setBusinessDocuments: (docs: any[]) => void,
    signal?: AbortSignal
) => {
    try {
        const response = await fetch('/api/agent/information/get-documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
            signal
        });
        const data = await response.json();
        setBusinessDocuments(data);
    } catch (error) {
        if (!signal?.aborted) {
            console.error('Failed to fetch business documents:', error);
        }
    }
}; 