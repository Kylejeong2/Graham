import { streamText } from 'ai'
import { openai as oai } from '@ai-sdk/openai';
import { Configuration, OpenAIApi } from 'openai-edge'
import { Pinecone } from '@pinecone-database/pinecone'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, systemPrompt, ragDocumentId, namespace } = await req.json()

  let context = ''
  if (ragDocumentId) {
    if (!namespace) {
      throw new Error('Namespace not found')
    }
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    })

    const lastMessage = messages[messages.length - 1]
    const embedding = await getEmbedding(lastMessage.content)

    try {
      const index = pc.index(process.env.PINECONE_INDEX!)
      const queryResponse = await index.namespace(namespace).query({
        vector: embedding,
        topK: 3,
        includeMetadata: true
      })

      context = queryResponse.matches
        .map(match => match.metadata?.text)
        .filter(Boolean)
        .join('\n')
    } catch (error) {
      console.error('Pinecone error:', error)
      context = ''
    }
  }

  const result = await streamText({
    model: oai('gpt-4o-mini'),
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}\n\nContext from relevant documents:\n${context}`
      },
      ...messages
    ],
    temperature: 0.7,
  })

  return result.toDataStreamResponse()
}

async function getEmbedding(text: string) {
  const response = await openai.createEmbedding({
    model: 'text-embedding-3-small',
    input: text,
  })
  const result = await response.json()
  return result.data[0].embedding
}