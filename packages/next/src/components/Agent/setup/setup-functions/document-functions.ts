import { toast } from 'react-toastify';

export const handleDocumentSelect = async (
    documentId: string,
    agentId: string,
    setSelectedDocument: (id: string) => void
) => {
    try {
        const response = await fetch('/api/agent/updateAgent', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId,
                ragDocumentId: documentId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update agent');
        }
        
        setSelectedDocument(documentId);
        toast.success('Document selected successfully');
    } catch (error) {
        console.error('Error selecting document:', error);
        toast.error('Failed to select document');
    }
}; 