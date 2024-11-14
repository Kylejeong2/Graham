import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { prisma } from '@graham/db';

const SYSTEM_PROMPT = `You are an expert at improving AI agent instructions. Your task is to take basic instructions and expand them into detailed, comprehensive guidelines that will help the AI agent better understand its role and responsibilities. Please:

1. Maintain the original intent and context
2. Add specific examples where helpful
3. Include clear boundaries and limitations
4. Structure the output in a clear, organized way
5. Ensure instructions are specific and actionable
6. Add relevant context about tone and communication style
7. Include any necessary ethical guidelines or safety considerations
8. Don't start with anything like: **Enhanced Instructions ...**
9. Keep prompt organized and easy to read.

Include the following somewhere in the instructions:
[Handle ASR errors]: If you encounter speech recognition errors, guess the intent and respond accordingly. If necessary, ask for clarification in a natural way, like “I didn't quite catch that” or “Could you repeat that?” Never mention transcription errors.
[Stick to your role]: Stay within the scope of your task. If asked something outside your capabilities, gently steer the conversation back to your primary role.
[Ensure smooth conversations]: Keep your responses relevant to the flow of the conversation and avoid abrupt transitions. Ensure a natural and smooth interaction.
## Number Pronunciation Guideline
When speaking numbers, transform the format as follows:
- Input formats like 4158923245, (415) 892-3245, or 415-892-3245
- Should be pronounced as: "four one five - eight nine two - three two four five"
- Important: Don't omit the space around the dash when speaking

Keep the total length reasonable (under 500 characters-ish) while being comprehensive.`;

export async function POST(req: Request) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });

        const { instructions, agentId } = await req.json();

        if (!instructions || !agentId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify agent exists
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
        });

        if (!agent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Please enhance these AI agent instructions: ${instructions}` }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const enhancedInstructions = completion.choices[0].message.content;

        // Update agent in database
        const updatedAgent = await prisma.agent.update({
            where: { id: agentId },
            data: { 
                systemPrompt: enhancedInstructions,
            },
        });

        return NextResponse.json({
            success: true,
            enhancedInstructions: enhancedInstructions,
            agent: updatedAgent,
        });

    } catch (error) {
        console.error('Error in enrich-instructions:', error);
        return NextResponse.json(
            { error: 'Failed to process instructions' },
            { status: 500 }
        );
    }
}
