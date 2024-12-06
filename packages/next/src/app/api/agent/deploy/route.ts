import { NextResponse } from 'next/server';
import { prisma } from '@graham/db';

export async function POST(req: Request) {
  try {
    const { agentId } = await req.json();

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    const user = await prisma.user.findUnique({
      where: { id: agent?.userId }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const businessDocument = await prisma.businessDocument.findUnique({
      where: { id: agent.ragDocumentId || '' }
    });

    const serverResponse = await fetch(`${process.env.GRAHAM_SERVER_URL}/deploy-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        businessName: user?.businessName,
        customInstructions: agent.systemPrompt,
        initiateConversation: agent.initiateConversation,
        initialMessage: agent.initialMessage,
        phoneNumber: agent.phoneNumber,
        documentNamespace: businessDocument?.namespace
      })
    });

    if (!serverResponse.ok) {
      throw new Error('Server deployment failed');
    }

    const { workerToken, sipTrunkId } = await serverResponse.json();

    await prisma.agent.update({
      where: { id: agentId },
      data: {
        deployed: true,
        lastDeployedAt: new Date().toISOString(),
        sipTrunkId
      }
    });

    return NextResponse.json({ 
      success: true,
      workerToken,
      sipTrunkId 
    });

  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json({ error: 'Failed to deploy agent' }, { status: 500 });
  }
}
