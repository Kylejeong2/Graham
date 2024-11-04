import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { prisma } from '@graham/db';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert at improving AI agent instructions. Your task is to take basic instructions and expand them into detailed, comprehensive guidelines that will help the AI agent better understand its role and responsibilities. Please:

1. Maintain the original intent and context
2. Add specific examples where helpful
3. Include clear boundaries and limitations
4. Structure the output in a clear, organized way
5. Ensure instructions are specific and actionable
6. Add relevant context about tone and communication style
7. Include any necessary ethical guidelines or safety considerations

Keep the total length reasonable (under 500 characters) while being comprehensive.`;

export async function POST(req: Request) {
    try {
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
            instructions: enhancedInstructions,
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
