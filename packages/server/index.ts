import cors from '@fastify/cors';
import Fastify from "fastify";
import { AccessToken, RoomServiceClient, SipClient } from 'livekit-server-sdk';
import { prisma } from '@graham/db';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { Twilio } from 'twilio';
// import { serverLogger } from '@graham/server/src/lib/winston';
import dotenv from 'dotenv';

dotenv.config();

const server = Fastify({ 
//   logger: serverLogger as any, 
  logger: true,
  keepAliveTimeout: 60000,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const livekitClient = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

const sipClient = new SipClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

// Initialize Twilio client
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

server.register(cors);

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

async function createSipTrunk(agentId: string, roomName: string, phoneNumber: string) {
  server.log.info('Starting SIP trunk creation', {
    context: 'createSipTrunk',
    agentId,
    roomName,
    phoneNumber
  });

  try {
    // Step 1: Verify phone number exists in Twilio
    server.log.info('Looking up Twilio phone number', {
      context: 'twilioPhoneNumberLookup',
      phoneNumber
    });

    const numbers = await twilioClient.incomingPhoneNumbers.list({
      phoneNumber
    });

    if (numbers.length === 0) {
      server.log.error('Phone number not found', {
        context: 'twilioPhoneNumberLookup',
        phoneNumber
      });
      throw new Error('Phone number not found in Twilio account');
    }

    let livekitTrunk;
    try {
      const trunkName = `trunk-${agentId}-${Date.now()}`.replace(/[^a-zA-Z0-9-]/g, '-');
      
      server.log.info('Attempting to create LiveKit SIP trunk', {
        context: 'livekitTrunkCreation',
        agentId,
        trunkName,
        phoneNumber,
        request: {
          name: trunkName,
          numbers: [phoneNumber],
        }
      });

      // Add pre-request validation logging
      if (!phoneNumber.startsWith('+')) {
        server.log.warn('Phone number may be incorrectly formatted', {
          context: 'livekitTrunkCreation',
          phoneNumber,
          agentId
        });
      }

      livekitTrunk = await sipClient.createSipInboundTrunk(
        trunkName,
        [phoneNumber]
      );

      server.log.info('LiveKit trunk created successfully', {
        context: 'livekitTrunkCreation',
        trunkId: livekitTrunk.sipTrunkId,
        agentId,
        phoneNumber
      });

    } catch (error) {
      // Enhanced error logging
      server.log.error('Failed to create LiveKit trunk', {
        context: 'livekitTrunkCreation',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Unknown',
          stack: error instanceof Error ? error.stack : undefined,
        },
        request: {
          name: `trunk-${agentId}-${Date.now()}`,
          numbers: [phoneNumber],
          agentId,
        },
        sipClient: {
          host: process.env.LIVEKIT_URL,
          configured: !!sipClient
        }
      });
      throw error;
    }
    
    let twilioTrunk;
    try {
      server.log.info('Creating Twilio SIP trunk', {
        context: 'twilioTrunkCreation',
        livekitTrunkId: livekitTrunk.sipTrunkId
      });

      twilioTrunk = await twilioClient.trunking.v1.trunks.create({
        friendlyName: `LiveKit-${agentId}-${Date.now()}`
      });
    } catch (error) {
      server.log.error('Failed to create Twilio trunk', {
        context: 'twilioTrunkCreation',
        error: error instanceof Error ? error.message : 'Unknown error',
        agentId
      });
      throw error;
    }

    // Step 4: Add origination URL
    try {
      server.log.info('Configuring Twilio trunk origination', {
        context: 'twilioTrunkConfig',
        twilioTrunkSid: twilioTrunk.sid
      });

      await twilioClient.trunking.v1.trunks(twilioTrunk.sid)
        .originationUrls.create({
          friendlyName: "LiveKit SIP URI",
          sipUrl: `sip:${process.env.LIVEKIT_SIP_URI}`,
          weight: 1,
          priority: 1,
          enabled: true
        });
    } catch (error) {
      server.log.error('Failed to configure Twilio trunk origination', {
        context: 'twilioTrunkConfig',
        error: error instanceof Error ? error.message : 'Unknown error',
        twilioTrunkSid: twilioTrunk.sid
      });
      throw error;
    }

    // Step 5: Associate phone number
    try {
      server.log.info('Associating phone number with trunk', {
        context: 'twilioPhoneNumberAssociation',
        phoneNumberSid: numbers[0]?.sid
      });

      await twilioClient.trunking.v1.trunks(twilioTrunk.sid)
        .phoneNumbers.create({
          phoneNumberSid: numbers[0]?.sid ?? ''
        });
    } catch (error) {
      server.log.error('Failed to associate phone number', {
        context: 'twilioPhoneNumberAssociation',
        error: error instanceof Error ? error.message : 'Unknown error',
        phoneNumberSid: numbers[0]?.sid,
        twilioTrunkSid: twilioTrunk.sid
      });
      throw error;
    }

    try {
      server.log.info('Creating LiveKit dispatch rule', {
        context: 'livekitDispatchRule',
        trunkId: livekitTrunk.sipTrunkId
      });

      await sipClient.createSipDispatchRule(
        {
          type: 'individual',
          roomPrefix: 'call'
        },
        {
          name: `Dispatch-${agentId}-${Date.now()}`,
          trunkIds: [livekitTrunk.sipTrunkId],
          metadata: JSON.stringify({
            agentId,
            roomName,
          })
        }
      );
    } catch (error) {
      server.log.error('Failed to create dispatch rule', {
        context: 'livekitDispatchRule',
        error: error instanceof Error ? error.message : 'Unknown error',
        trunkId: livekitTrunk.sipTrunkId
      });
      throw error;
    }

    server.log.info('SIP trunk setup completed successfully', {
      context: 'sipTrunkSetup',
      livekitTrunkId: livekitTrunk.sipTrunkId,
      twilioTrunkSid: twilioTrunk.sid,
      phoneNumberSid: numbers[0]?.sid
    });

    return {
      trunkId: livekitTrunk.sipTrunkId,
      phoneNumberSid: numbers[0]?.sid,
      twilioTrunkSid: twilioTrunk.sid
    };

  } catch (error) {
    server.log.error('Error creating SIP trunk', {
      context: 'sipTrunkSetup',
      error: error instanceof Error ? error.message : 'Unknown error',
      agentId,
      phoneNumber,
      timestamp: Date.now()
    });
    throw error;
  }
}

// Deploy agent route with enhanced logging
server.post('/deploy-agent', async (request: any, reply: any) => {
  const startTime = Date.now();
  server.log.info('Starting agent deployment', {
    context: 'deployAgent',
    body: request.body
  });

  const { 
    agentId, 
    businessName,
    businessInfo,
    customInstructions,
    initiateConversation,
    initialMessage,
    phoneNumber
  } = request.body;

  try {
    const sanitizedBizName = businessName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
      .slice(0, 10);

    const shortTimestamp = Date.now().toString().slice(-8);
    const indexName = `ag-${agentId}-${sanitizedBizName}-${shortTimestamp}`;

    const index = pinecone.index('graham');
    const namespace = `${agentId}-${Date.now()}`; // Unique namespace per deployment

    // Generate embeddings for business info
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: businessInfo,
      dimensions: 1536
    });

    await index.namespace(namespace).upsert(
    [{
      id: `info-${Date.now()}`,
      values: embedding.data[0]?.embedding ?? [],
      metadata: {
          text: businessInfo,
          businessName,
          agentId
        }
      }]
    );

    const roomName = `agent-roomName-${agentId}-${businessName}-${Date.now()}`;
    const room = await livekitClient.createRoom({
      name: roomName,
      emptyTimeout: 60 * 60,
      maxParticipants: 10,
      metadata: JSON.stringify({
        agentId,
        businessName,
        type: 'graham-agent',
        pineconeIndex: indexName,
        pineconeNamespace: namespace, 
        initiateConversation,
        initialMessage
      }),
    });

    const workerToken = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: `worker-${agentId}`,
        ttl: 24 * 60 * 60,
        metadata: JSON.stringify({
          type: 'worker',
          agentId,
          businessName,
          pineconeIndex: indexName,
          pineconeNamespace: namespace,
          customInstructions,
          initiateConversation,
          initialMessage
        }),
      }
    );

    // Create SIP trunk if phone number exists
    let trunkInfo;
    if (phoneNumber) {
      trunkInfo = await createSipTrunk(agentId, roomName, phoneNumber);
    }

    // Update agent status in database
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        deployed: true,
        roomName,
        roomSid: room.sid,
        lastDeployedAt: new Date().toISOString(),
        sipTrunkId: trunkInfo?.trunkId,
      },
    });

    server.log.info('Agent deployment completed', {
      context: 'deployAgent',
      agentId,
      roomName,
      duration: Date.now() - startTime
    });

    return {
      roomName,
      workerToken: await workerToken.toJwt(),
      roomSid: room.sid,
      sipTrunkId: trunkInfo?.trunkId,
    };

  } catch (error) {
    server.log.error('Error deploying agent', {
      context: 'deployAgent',
      agentId,
      businessName,
      duration: Date.now() - startTime
    });
    return reply.code(500).send({ error: 'Failed to deploy agent' });
  }
});

// Cleanup route
server.post('/cleanup-agent/:agentId', async (request: any, reply: any) => {
  const { agentId } = request.params;

  try {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' });
    }

    if (agent.roomName) {
      await livekitClient.deleteRoom(agent.roomName);
    }

    // Cleanup SIP trunk if exists
    if (agent.sipTrunkId) {
      await sipClient.deleteSipTrunk(agent.sipTrunkId);
    }

    // Update agent status
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        deployed: false,
        roomName: null,
        roomSid: null,
        sipTrunkId: null,
      },
    });

    return { status: 'cleaned up' };

  } catch (error) {
    server.log.error(error);
    return reply.code(500).send({ error: 'Failed to cleanup agent' });
  }
});

server.listen({ port: parseInt(process.env.PORT as string), host: "0.0.0.0" }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening on ${address}`);
});

const cleanup = (eventType: string, origin: any) => {
    server.log.info(`Received event ${eventType}`, { origin });
    process.exit();
  };
  [
    `exit`,
    `SIGINT`,
    `SIGUSR1`,
    `SIGUSR2`,
    `uncaughtException`,
    `SIGTERM`,
  ].forEach((eventType) => {
    process.on(eventType, cleanup.bind(null, eventType));
  });