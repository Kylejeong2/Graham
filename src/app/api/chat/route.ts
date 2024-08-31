import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function shouldRetrieveMemories(message: string): Promise<boolean> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI assistant that determines if additional context or memories are needed to answer a user\'s question. Respond with "Yes" if memories are needed, or "No" if the question can be answered without additional context. Respond with only a single word: Yes or No.' },
        { role: 'user', content: `Answer with only a single word. Do I need to retrieve memories to answer this question: "${message}"?` },
      ],
    });

    const decision = completion.choices[0].message.content?.trim().toLowerCase();
    return decision === 'yes';
  } catch (error) {
    console.error('Error in memory retrieval decision:', error);
    return false; // Default to not retrieving memories if there's an error
  }
}

async function shouldSaveToMemory(message: string): Promise<boolean> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI assistant that determines if a message contains important information that should be saved for future reference. Respond with ONLY "Yes" or "No". Be more inclined to say "Yes" if there\'s any doubt.' },
        { role: 'user', content: `Should this message be saved to memory? Answer ONLY "Yes" or "No": "${message}"` },
      ],
    });

    const decision = completion.choices[0].message.content?.trim().toLowerCase();
    // console.log('Raw save to memory decision:', decision);
    
    // More lenient decision logic
    const shouldSave = decision?.includes('yes') || decision === 'y' || decision === 'true' || decision === '1';
    // console.log('Interpreted save to memory decision:', shouldSave);
    
    return shouldSave;
  } catch (error) {
    console.error('Error in memory save decision:', error);
    return true; // Default to saving if there's an error, to be safe
  }
}

async function saveToMemory(messages: any, compadreId: string) {
  try {
    const response = await fetch('https://api.mem0.ai/v1/memories/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.MEM0_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        user_id: compadreId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Memory saved successfully:', result);
  } catch (error) {
    console.error('Error saving memory:', error);
  }
}

const MAX_MEMORY_TOKENS = 1000; // Adjust as needed

async function getRelevantMemories(query: string, compadreId: string): Promise<string> {
  try {
    const response = await fetch('https://api.mem0.ai/v1/memories/search/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${process.env.MEM0_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        user_id: compadreId,
        max_tokens: MAX_MEMORY_TOKENS,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const memories = await response.json() as { memory: string }[];
    return memories.map(memory => memory.memory).join('\n\n');
  } catch (error) {
    console.error('Error fetching memories:', error);
    return '';
  }
}

export async function POST(req: NextRequest) {
  const { user, message, messages, compadreName, compadreId, characteristics } = await req.json();

  const lastMessage = messages[messages.length - 1].content;
  let memString = '';
  if(await shouldRetrieveMemories(message)){
    memString = await getRelevantMemories(message, compadreId);
  }

  const systemPrompt = `You're name is ${compadreName}, and you're a helpful AI friend with the following characteristics: ${characteristics}. Your task is to engage in a conversation, keeping these traits in mind. ${memString ? `Here's some relevant information/context: ${memString}` : ''}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });
    
    const reply = completion.choices[0].message.content;

    // Simplified memory saving
    if (await shouldSaveToMemory(message)) {
        await saveToMemory([...messages, { role: 'assistant', content: reply }], compadreId);
    }

    return NextResponse.json({ message: reply }, { status: 200 });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
  }
}