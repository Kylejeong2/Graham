import { prisma } from "@graham/db";
import { toast } from "react-toastify";

export const handleCompleteSetup = async (
  agentId: string,
  selectedDocument: string,
  setIsCompleting: (val: boolean) => void
) => {
  try {
    setIsCompleting(true);

    if (selectedDocument) {
      const embedRes = await fetch('/api/agent/information/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId, 
          documentId: selectedDocument 
        })
      });

      if (!embedRes.ok) {
        throw new Error('Failed to create embeddings');
      }

      const embedResData = await embedRes.json();

      await prisma.agent.update({
        where: { id: agentId },
        data: {
          namespace: embedResData.namespace
        }
      })

    }

    // Deploy agent
    const deployRes = await fetch('/api/agent/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId })
    });

    if (!deployRes.ok) {
      throw new Error('Failed to deploy agent');
    }

    toast.success('Agent deployed successfully!');
  } catch (error) {
    toast.error('Failed to deploy agent');
    console.error(error);
  } finally {
    setIsCompleting(false);
  }
};