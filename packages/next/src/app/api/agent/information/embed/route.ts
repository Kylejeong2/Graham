import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { prisma } from '@graham/db';

export async function POST(req: Request) {
  try {
    const { agentId, documentId } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });

    const document = await prisma.businessDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const chunkrResponse = await fetch('https://api.chunkr.ai/api/v1/task', {
      method: 'POST',
      headers: {
        'Authorization': process.env.CHUNKR_API_KEY!,
        'Content-Type': 'multipart/form-data'
      },
      body: JSON.stringify({
        json_schema: "<any>",
        model: 'Fast',
        ocr_strategy: 'Auto',
        target_chunk_length: 123
      })
    });

    const chunkData = await chunkrResponse.json();
    const namespace = `${agentId}-${documentId}-${Date.now()}`;
    const index = pinecone.index('graham');

    // Create embeddings for each segment
    const embedPromises = chunkData.output.chunks.flatMap((chunk: any, chunkIndex: number) =>
      chunk.segments.map(async (segment: any, segmentIndex: number) => {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: segment.content,
          dimensions: 1536
        });

        return index.namespace(namespace).upsert([{
          id: `doc-${documentId}-chunk-${chunkIndex}-${segmentIndex}`,
          values: embedding.data[0].embedding,
          metadata: {
            text: segment.content,
            documentId,
            agentId,
            chunkIndex,
            segmentIndex
          }
        }]);
      })
    );

    await Promise.all(embedPromises);

    await prisma.businessDocument.update({
      where: { id: documentId },
      data: {
        namespace,
        chunks: chunkData.output.chunks
      }
    });

    return NextResponse.json({ 
      success: true,
      namespace,
      taskId: chunkData.task_id
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
} 