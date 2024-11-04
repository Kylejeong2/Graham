// TODO: setup with vector db
// import { NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server';
// import { put } from '@vercel/blob';
// import { OpenAI } from 'openai';
// import { PDFParser } from 'pdf2json';
// import { prisma } from '@graham/db';

// const openai = new OpenAI();

// async function parsePDF(buffer: Buffer): Promise<string> {
//     return new Promise((resolve, reject) => {
//         const pdfParser = new PDFParser();
        
//         pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
//             const text = pdfParser.getRawTextContent();
//             resolve(text);
//         });

//         pdfParser.on('pdfParser_dataError', (error: any) => {
//             reject(error);
//         });

//         pdfParser.parseBuffer(buffer);
//     });
// }

// function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
//     const chunks: string[] = [];
//     let startIndex = 0;
    
//     while (startIndex < text.length) {
//         const chunk = text.slice(startIndex, startIndex + chunkSize);
//         chunks.push(chunk);
//         startIndex += chunkSize - overlap;
//     }
    
//     return chunks;
// }

// export async function POST(req: Request) {
//     try {
//         const { userId } = auth();
//         if (!userId) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//         }

//         const formData = await req.formData();
//         const file = formData.get('file') as File;
//         const agentId = formData.get('agentId') as string;

//         if (!file || !agentId) {
//             return NextResponse.json(
//                 { error: 'File and agent ID are required' },
//                 { status: 400 }
//             );
//         }

//         // Upload to Cloudflare R2
//         const filename = `${userId}/${agentId}/${Date.now()}-${file.name}`;
//         const blob = await put(filename, file, {
//             access: 'public',
//         });

//         // Parse PDF
//         const buffer = Buffer.from(await file.arrayBuffer());
//         const text = await parsePDF(buffer);
//         const chunks = chunkText(text);

//         // Create embeddings using OpenAI's new model
//         const vectors = await Promise.all(
//             chunks.map(async (chunk) => {
//                 const response = await openai.embeddings.create({
//                     model: "text-embedding-3-small",
//                     input: chunk,
//                     dimensions: 1536,
//                 });

//                 return {
//                     content: chunk,
//                     embedding: response.data[0].embedding,
//                     metadata: {
//                         fileName: file.name,
//                         uploadedAt: new Date(),
//                     },
//                 };
//             })
//         );

//         // Store in vector database
//         await prisma.$transaction(
//             vectors.map((vector) =>
//                 prisma.documentChunk.create({
//                     data: {
//                         agentId,
//                         content: vector.content,
//                         embedding: vector.embedding,
//                         metadata: vector.metadata,
//                         fileUrl: blob.url,
//                     },
//                 })
//             )
//         );

//         return NextResponse.json({ success: true, fileUrl: blob.url });
//     } catch (error) {
//         console.error('Error processing document:', error);
//         return NextResponse.json(
//             { error: 'Failed to process document' },
//             { status: 500 }
//         );
//     }
// }