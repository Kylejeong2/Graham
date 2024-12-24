import asyncio
import logging
import os
import json
from datetime import datetime, timedelta
from pinecone import Pinecone
from livekit.plugins import openai

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
from livekit.plugins import deepgram, silero, turn_detector, cartesia
from custom_plugins import cerebras_plugin as cerebras

from typing import Annotated
import dateparser
from agent_helpers import (
    _check_calendar_availability,
    _create_calendar_event,
    parse_natural_date,
    format_date_for_display,
    format_time_for_display
)

load_dotenv()
logger = logging.getLogger("voice-assistant")

SCOPES = ['https://www.googleapis.com/auth/calendar']

class PineconeRagAgent:
    def __init__(self, index_name: str):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = self.pc.Index(index_name)
        self.embeddings_dimension = 1536
        self.cache = {}
        
    async def should_use_rag(self, query: str) -> bool:
        domain_keywords = [
            "company", "product", "policy", "specific", "detail", 
            "documentation", "process", "procedure", "guide"
        ]
        return any(keyword in query.lower() for keyword in domain_keywords)

    async def query_knowledge(self, query: str) -> str:
        if not await self.should_use_rag(query):
            return ''
            
        cache_key = query.lower()
        if cache_key in self.cache:
            return self.cache[cache_key]

        try:
            user_embedding = await openai.create_embeddings(
                input=[query],
                model="text-embedding-3-small",
                dimensions=self.embeddings_dimension,
            )

            query_response = self.index.query(
                vector=user_embedding[0].embedding,
                top_k=3,
                include_metadata=True,
                filter={
                    "timestamp": {"$gte": (datetime.now() - timedelta(days=30)).timestamp()}
                }
            )

            contexts = []
            for match in query_response.matches:
                if match.score > 0.8:
                    contexts.append(match.metadata.get('text', ''))
            
            result = "\n".join(contexts) if contexts else ''
            
            self.cache[cache_key] = result
            return result
            
        except Exception as e:
            logger.error(f"Error in query_knowledge: {str(e)}")
            return ''

def prewarm(proc: JobProcess):
    try:
        proc.userdata["vad"] = silero.VAD.load()
        logger.info("VAD model loaded successfully")
    except Exception as e:
        logger.error(f"Error loading VAD model: {str(e)}")
        raise

@llm.ai_callable()
async def check_calendar(
    self,
    date: Annotated[str, llm.TypeInfo(description="The date to check availability for (YYYY-MM-DD)")],
):
    """Check calendar availability for a given date and return a human-readable summary."""
    try:
        events = await _check_calendar_availability(date)
        
        if not events:
            return f"Your calendar is clear on {date}."
        
        busy_times = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            busy_times.append(f"{start} - {end}: {event['summary']}")
        
        return f"Here are your appointments on {date}:\n" + "\n".join(busy_times)
        
    except Exception as e:
        return f"Error checking calendar: {str(e)}"

@llm.ai_callable()
async def check_time_slot_available(
    self,
    date: Annotated[str, llm.TypeInfo(description="The date to check (YYYY-MM-DD)")],
    time: Annotated[str, llm.TypeInfo(description="The time to check (HH:MM)")],
    duration: Annotated[int, llm.TypeInfo(description="Duration in minutes")],
):
    """Check if a specific time slot is available."""
    try:
        events = await _check_calendar_availability(date)
        requested_start = datetime.strptime(f"{date} {time}", '%Y-%m-%d %H:%M')
        requested_end = requested_start + timedelta(minutes=duration)
        
        for event in events:
            event_start = datetime.fromisoformat(event['start'].get('dateTime', event['start'].get('date')).replace('Z', '+00:00'))
            event_end = datetime.fromisoformat(event['end'].get('dateTime', event['end'].get('date')).replace('Z', '+00:00'))
            
            if (requested_start < event_end and requested_end > event_start):
                return f"Time slot not available. Conflicts with: {event['summary']} ({event_start.strftime('%H:%M')} - {event_end.strftime('%H:%M')})"
        
        return "Time slot is available"
        
    except Exception as e:
        return f"Error checking time slot: {str(e)}"

@llm.ai_callable()
async def book_appointment(
    self,
    date: Annotated[str, llm.TypeInfo(description="The date for the appointment (YYYY-MM-DD)")],
    time: Annotated[str, llm.TypeInfo(description="The time for the appointment (HH:MM)")],
    duration: Annotated[int, llm.TypeInfo(description="Duration in minutes")],
    title: Annotated[str, llm.TypeInfo(description="Title of the appointment")],
    description: Annotated[str, llm.TypeInfo(description="Description of the appointment")] = "",
):
    """Book a new appointment if the time slot is available."""
    try:
        availability = await check_time_slot_available(self, date, time, duration)
        if "not available" in availability:
            return availability
            
        await _create_calendar_event(date, time, duration, title, description)
        return f"Appointment booked: {title} on {date} at {time} for {duration} minutes."
        
    except Exception as e:
        return f"Error booking appointment: {str(e)}"

async def entrypoint(ctx: JobContext):
    try:
        # Extract agent parameters from metadata and environment
        metadata = json.loads(ctx.participant.metadata) if ctx.participant and ctx.participant.metadata else {}
        agent_id = metadata.get('agentId', '')
        user_id = metadata.get('userId', '')
        business_name = metadata.get('businessName', '')
        custom_instructions = metadata.get('customInstructions', '')
        initiate_conversation = metadata.get('initiateConversation', False)
        initial_message = metadata.get('initialMessage', "Hey, how can I help you today?")
        document_namespace = metadata.get('documentNamespace', '')
        google_calendar_enabled = metadata.get('googleCalendarIntegration', False) or os.getenv('GOOGLE_CALENDAR_ENABLED') == 'true'
        voice_id = metadata.get('voiceId', '') or os.getenv('VOICE_ID')
        voice_name = metadata.get('voiceName', '') or os.getenv('VOICE_NAME')

        if not agent_id or not user_id:
            raise ValueError("Agent ID and User ID are required")

        current_time = datetime.now()
        current_date = current_time.strftime('%Y-%m-%d')
        current_time_str = current_time.strftime('%I:%M %p').lstrip("0").lower()
        
        # Build system prompt with custom instructions
        system_prompt = (
            f"You are an AI assistant for {business_name}. "
            f"Current time is {current_time_str} on {format_date_for_display(current_date)}. "
            "Your interface with users will be voice. Keep responses extremely concise and natural. "
            "Avoid unnecessary words. Respond quickly with short, direct answers. "
            f"\n\n{custom_instructions}\n\n"
        )

        # Add calendar instructions only if enabled
        if google_calendar_enabled:
            system_prompt += (
                "When users ask about calendar operations: "
                "1. IMMEDIATELY acknowledge their request with a brief response "
                "2. Then use the appropriate async calendar function "
                "3. The function will handle the acknowledgment and response automatically "
                
                "Calendar formatting: "
                "- Use natural language for dates (today, tomorrow, next Monday) "
                "- Use 12-hour time format (2:30 pm, 4 pm) "
                "- Default to current date for relative times "
                "- For next week, assume they mean the same day next week"
            )

        initial_ctx = llm.ChatContext().append(
            role="system",
            text=system_prompt,
        )

        fnc_ctx = llm.FunctionContext()

        # Initialize RAG if document namespace is provided
        rag_agent = None
        if document_namespace:
            rag_agent = PineconeRagAgent(document_namespace)
            
            @fnc_ctx.ai_callable(description="Query knowledge base for relevant information")
            async def query_knowledge(query: str) -> str:
                return await rag_agent.query_knowledge(query)

        # Only add calendar functions if enabled
        if google_calendar_enabled:
            @fnc_ctx.ai_callable(description="Check calendar availability for a specific date and time")
            async def check_calendar_availability(
                time: Annotated[str, llm.TypeInfo(description="Time in natural format (2:30 pm, 4 pm)")] = None,
                date: Annotated[str, llm.TypeInfo(description="Date in natural language (today, tomorrow, next Monday)")] = None
            ) -> str:
                try:
                    if date is None:
                        date = current_date
                    
                    if time:
                        try:
                            parsed_time = dateparser.parse(time)
                            if parsed_time:
                                time = parsed_time.strftime('%H:%M')
                            else:
                                return f"Invalid time format: {time}. Please use format like '4 pm' or '2:30 pm'"
                        except ValueError as e:
                            return f"Invalid time format: {time}. Please use format like '4 pm' or '2:30 pm {e}'"
                    
                    events = await _check_calendar_availability(date, agent_id=agent_id, user_id=user_id)
                    formatted_date = format_date_for_display(parse_natural_date(date))
                    
                    if not events:
                        return f"Your calendar is clear {formatted_date}" + (f" at {format_time_for_display(time)}" if time else "")
                    
                    busy_times = []
                    for event in events:
                        start = event['start'].get('dateTime', event['start'].get('date'))
                        end = event['end'].get('dateTime', event['end'].get('date'))
                        start_time = datetime.fromisoformat(start.replace('Z', '+00:00')).strftime('%I:%M %p').lstrip("0").lower()
                        end_time = datetime.fromisoformat(end.replace('Z', '+00:00')).strftime('%I:%M %p').lstrip("0").lower()
                        
                        if time:
                            event_start = datetime.fromisoformat(start.replace('Z', '+00:00'))
                            event_end = datetime.fromisoformat(end.replace('Z', '+00:00'))
                            check_time = datetime.strptime(f"{parse_natural_date(date)} {time}", '%Y-%m-%d %H:%M')
                            
                            if event_start <= check_time <= event_end:
                                busy_times.append(f"{start_time} - {end_time}: {event['summary']}")
                        else:
                            busy_times.append(f"{start_time} - {end_time}: {event['summary']}")
                    
                    if time and not busy_times:
                        return f"You're free {formatted_date} at {format_time_for_display(time)}"
                        
                    return f"Busy times {formatted_date}:\n" + "\n".join(busy_times)
                except Exception as e:
                    logger.error(f"Error checking calendar: {str(e)}")
                    return "Sorry, I had trouble checking your calendar."

            @fnc_ctx.ai_callable(description="Schedule a new calendar event")
            async def schedule_event(
                title: Annotated[str, llm.TypeInfo(description="Title of the event")],
                time: Annotated[str, llm.TypeInfo(description="Time in natural format (2:30 pm, 4 pm)")] = None,
                date: Annotated[str, llm.TypeInfo(description="Date in natural language (today, tomorrow, next Monday)")] = None,
                duration: Annotated[int, llm.TypeInfo(description="Duration in minutes")] = 60,
                description: Annotated[str, llm.TypeInfo(description="Event description")] = ""
            ) -> str:
                try:
                    if date is None:
                        date = current_date
                    
                    formatted_date = parse_natural_date(date)
                    
                    if not time:
                        return "Please specify a time for the event"
                        
                    local_tz = datetime.now().astimezone().tzinfo
                    
                    parsed_time = dateparser.parse(time)
                    if not parsed_time:
                        return f"Invalid time format: {time}. Please use format like '4 pm' or '2:30 pm'"
                    time = parsed_time.strftime('%H:%M')
                    
                    requested_start = datetime.strptime(f"{formatted_date} {time}", '%Y-%m-%d %H:%M').replace(tzinfo=local_tz)
                    requested_end = requested_start + timedelta(minutes=duration)
                    
                    events = await _check_calendar_availability(formatted_date, agent_id=agent_id, user_id=user_id)
                    
                    for event in events:
                        event_start = datetime.fromisoformat(event['start'].get('dateTime', event['start'].get('date'))).replace(tzinfo=local_tz)
                        event_end = datetime.fromisoformat(event['end'].get('dateTime', event['end'].get('date'))).replace(tzinfo=local_tz)
                        
                        if (requested_start < event_end and requested_end > event_start):
                            return f"Cannot schedule. Conflicts with: {event['summary']} ({event_start.strftime('%I:%M %p').lstrip('0').lower()} - {event_end.strftime('%I:%M %p').lstrip('0').lower()})"
                    
                    await _create_calendar_event(formatted_date, time, duration, title, description, agent_id=agent_id, user_id=user_id)
                    display_date = format_date_for_display(formatted_date)
                    display_time = format_time_for_display(time)
                    return f"Scheduled: {title} for {display_time} {display_date}"
                except Exception as e:
                    logger.error(f"Error scheduling event: {str(e)}")
                    return f"Sorry, I had trouble scheduling the event: {str(e)}"

        logger.info(f"Connecting to room {ctx.room.name}")
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

        participant = await ctx.wait_for_participant()
        logger.info(f"Starting voice assistant for participant {participant.identity}")

        dg_model = "nova-2-general"
        if participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
            dg_model = "nova-2-phonecall"

        # Configure TTS with voice settings if available
        tts_config = {}
        if voice_id and voice_name:
            tts_config = {
                "voice_id": voice_id,
                "voice_name": voice_name
            }

        agent = VoicePipelineAgent(
            vad=ctx.proc.userdata["vad"],
            stt=deepgram.STT(
                model=dg_model,
                interim_results=True,
                smart_format=True,
            ),
            llm=cerebras.LLM(
                temperature=0.5,
            ),
            tts=cartesia.TTS(**tts_config),
            turn_detector=turn_detector.EOUModel(),
            chat_ctx=initial_ctx,
            fnc_ctx=fnc_ctx,
        )

        agent.start(ctx.room, participant)
        logger.info(f"Agent {agent_id} started successfully for {business_name}")

        usage_collector = metrics.UsageCollector()

        @agent.on("metrics_collected")
        def _on_metrics_collected(mtrcs: metrics.AgentMetrics):
            metrics.log_metrics(mtrcs)
            usage_collector.collect(mtrcs)

        async def log_usage():
            summary = usage_collector.get_summary()
            logger.info(f"Usage for agent {agent_id}: ${summary}")

        ctx.add_shutdown_callback(log_usage)

        chat = rtc.ChatManager(ctx.room)

        async def answer_from_text(txt: str):
            chat_ctx = agent.chat_ctx.copy()
            chat_ctx.append(role="user", text=txt)
            stream = agent.llm.chat(chat_ctx=chat_ctx)
            await agent.say(stream)

        @chat.on("message_received")
        def on_chat_received(msg: rtc.ChatMessage):
            if msg.message:
                asyncio.create_task(answer_from_text(msg.message))

        if initiate_conversation:
            await agent.say(initial_message, allow_interruptions=True)
        
    except Exception as e:
        logger.error(f"Error in entrypoint: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
    )