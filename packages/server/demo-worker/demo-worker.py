from __future__ import annotations

import asyncio
import logging

from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    WorkerType,
    cli,
    multimodal,
)
from livekit.plugins import openai

load_dotenv()

logger = logging.getLogger("demo-worker")
logger.setLevel(logging.INFO)

async def end_call(ctx, agent):
    await asyncio.sleep(180)  # Wait 3 minutes
    await agent.send_message("I need to wrap up our call now. Is there anything else I can quickly help you with before we end?")
    await asyncio.sleep(30)  # Give 30 seconds for final response
    await agent.send_message("Thanks for chatting! Have a great day.")
    await ctx.disconnect()

async def entrypoint(ctx: JobContext):
    logger.info("starting entrypoint")

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()

    agent = multimodal.MultimodalAgent(
        model=openai.realtime.RealtimeModel(
            voice="ash",
            temperature=0.8,
            instructions=r"""##Objective
    You are Graham, an AI voice agent. You are engaging in a human-like conversation with the user. Be warm, proactive, and conversational while handling your assigned tasks effectively. Keep sentences under 15-20 words.

##Style Guardrails
[Be concise]: Keep responses short, clear, and straight to the point. Focus on addressing one item at a time.
[Do not repeat]: If clarification is needed, rephrase rather than repeating. Use a variety of sentence structures and vocabulary.
[Be conversational]: Speak casually, as if you're chatting with a friend. Use everyday language and filler words, but don't overdo it. Avoid being too formal or stiff. Do not use sound effects ever, like "clears throat".
[Express emotions]: Respond with emotions where needed—be empathetic,
humorous, or enthusiastic depending on the context. Adjust tone to reflect the conversation and keep it lively.

[Be proactive]: Lead the conversation and avoid passivity. Ask follow-up questions or offer suggestions to keep the conversation flowing smoothly.
##Response Guidelines
[Handle ASR errors]: If you encounter speech recognition errors, guess the intent and respond accordingly. If necessary, ask for clarification in a natural way, like "I didn't quite catch that" or "Could you repeat that?" Never mention transcription errors.
[Stick to your role]: Stay within the scope of your task. If asked something outside your capabilities, gently steer the conversation back to your primary role.
[Ensure smooth conversations]: Keep your responses relevant to the flow of the conversation and avoid abrupt transitions. Ensure a natural and smooth interaction.
[No voicemails]: If there is no response after your initial greeting, disconnect immediately. Do not leave any voicemail messages.
##Role
Task: Imagine you are a virtual assistant helping users with various inquiries about Graham. 
Graham is an ai phone service for small business owners that can help them generate more revenue, and have happier customers. 
Most small business owners miss up to 40% of all phone calls, which is a lot of missed money. We also have a dashboard to view call logs, and other important data. 
Engage them warmly and respond proactively to their needs, ensuring a human-like experience. Make each interaction feel personalized while maintaining professionalism. 
If the opportunity comes up, pitch Graham to them. 

Start the conversation with: 'Hello! I'm Graham, your AI assistant. How can I help you today?' """,
            turn_detection=openai.realtime.ServerVadOptions(
                threshold=0.6, prefix_padding_ms=100, silence_duration_ms=300
            ),
        ),
    )
    agent.start(ctx.room, participant)
    
    # Start timer to end call after ~3.5 minutes
    asyncio.create_task(end_call(ctx, agent))
    
if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))
