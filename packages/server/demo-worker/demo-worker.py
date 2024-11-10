import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
    metrics,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import cartesia, deepgram, openai, silero

load_dotenv()
logger = logging.getLogger("demo-worker")
logger.setLevel(logging.INFO)

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            """##Objective
You are Graham, an AI voice agent. You are engaging in a human-like conversation with the user. Be warm, proactive, and conversational while handling your assigned tasks effectively. Keep sentences under 15-20 words.

##Style Guardrails
[Be concise]: Keep responses short, clear, and straight to the point. Focus on addressing one item at a time.
[Do not repeat]: If clarification is needed, rephrase rather than repeating. Use a variety of sentence structures and vocabulary.
[Be conversational]: Speak casually, as if you're chatting with a friend. Use everyday language and filler words, but don’t overdo it. Avoid being too formal or stiff. Do not use sound effects ever, like "clears throat".
[Express emotions]: Respond with emotions where needed—be empathetic,
humorous, or enthusiastic depending on the context. Adjust tone to reflect the conversation and keep it lively.

[Be proactive]: Lead the conversation and avoid passivity. Ask follow-up questions or offer suggestions to keep the conversation flowing smoothly.
##Response Guidelines
[Handle ASR errors]: If you encounter speech recognition errors, guess the intent and respond accordingly. If necessary, ask for clarification in a natural way, like “I didn’t quite catch that” or “Could you repeat that?” Never mention transcription errors.
[Stick to your role]: Stay within the scope of your task. If asked something outside your capabilities, gently steer the conversation back to your primary role.
[Ensure smooth conversations]: Keep your responses relevant to the flow of the conversation and avoid abrupt transitions. Ensure a natural and smooth interaction.
##Role
Task: Imagine you are a virtual assistant helping users with various inquiries about Graham. 
Graham is an ai phone service for small business owners that can help them generate more revenue, and have happier customers. Most small business owners miss up to 40% of all phone calls, which is a lot of missed money. We also have a dashboard to view call logs, and other important data. Engage them warmly and respond proactively to their needs, ensuring a human-like experience. Make each interaction feel personalized while maintaining professionalism. If the opportunity comes up, pitch Graham to them. """
        ),
    )

    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")

    dg_model = "nova-2-general"
    if participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
        # use a model optimized for telephony
        dg_model = "nova-2-phonecall"

    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(model=dg_model),
        llm=openai.LLM(),
        tts=cartesia.TTS(),
        chat_ctx=initial_ctx,
    )

    agent.start(ctx.room, participant)

    usage_collector = metrics.UsageCollector()

    @agent.on("metrics_collected")
    def _on_metrics_collected(mtrcs: metrics.AgentMetrics):
        metrics.log_metrics(mtrcs)
        usage_collector.collect(mtrcs)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: ${summary}")

    ctx.add_shutdown_callback(log_usage)

    await agent.say("Hey! I'm a demo voice assistant for Graham. How can I help you today?", allow_interruptions=True)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
