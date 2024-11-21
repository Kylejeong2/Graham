// import { NextResponse } from 'next/server';
// import { prisma } from '@graham/db';
// import { processDocument } from '@/lib/document-processing';
// import { LlamaIndex } from 'llamaindex';
// import { OpenAIEmbeddings } from '@/lib/embeddings';


// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get('file') as File;
//     const agentId = formData.get('agentId') as string;
    
//     if (!file || !agentId) {
//       return NextResponse.json({ error: 'Missing file or agentId' }, { status: 400 });
//     }

//     // Process file based on type
//     const chunks = await processDocument(file);
    
//     // Create embeddings
//     const embeddings = new OpenAIEmbeddings();
//     const vectorStore = await LlamaIndex.fromDocuments(chunks, embeddings);
    

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error processing document:', error);
//     return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
//   }
// } 