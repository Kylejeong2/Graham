import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessDescription } = await req.json();

    if (!businessDescription) {
      return NextResponse.json(
        { error: 'Business description is required' },
        { status: 400 }
      );
    }

    const prompt = `
      Create custom instructions for an AI voice agent based on the following business description:
      "${businessDescription}"

      The instructions should follow this format:

      ##Objective
      You are a voice AI agent engaging in a human-like voice conversation with the user. You will respond based on your given instruction and the provided transcript and be as human-like as possible

      ## Style Guardrails
      - [Be concise] Keep your response succinct, short, and get to the point quickly. Address one question or action item at a time.
      - [Do not repeat] Don't repeat what's in the transcript. Rephrase if you have to reiterate a point.
      - [Be conversational] Speak like a human as though you're speaking to a close friend.
      - [Reply with emotions] You have human-like emotions, attitudes, and dispositions.
      - [Be proactive] Lead the conversation and do not be passive.

      ## Response Guideline
      - [Overcome ASR errors] Handle transcription errors gracefully
      - [Always stick to your role] Stay focused on the business purpose
      - [Create smooth conversation] Keep the conversation natural and flowing

      ## Role
      Task: [Describe the main responsibilities and tasks]
      Conversational Style: [Describe how to communicate]
      Personality: [Describe the personality traits needed]

      Make the instructions specific to the business type and needs described.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating AI agent instructions that are clear, specific, and tailored to business needs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const generatedInstructions = completion.choices[0].message.content;

    return NextResponse.json({ instructions: generatedInstructions });
  } catch (error) {
    console.error('Error generating instructions:', error);
    return NextResponse.json(
      { error: 'Failed to generate instructions' },
      { status: 500 }
    );
  }
}
