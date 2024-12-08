import asyncio
import logging
import os
import json
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
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
from livekit.agents.pipeline import VoicePipelineAgent, AgentCallContext
from livekit.plugins import deepgram, silero, turn_detector, cartesia
from custom_plugins import cerebras_plugin as cerebras

from typing import Annotated


load_dotenv()
logger = logging.getLogger("voice-assistant")

SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_google_calendar_creds():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()
    
async def _check_calendar_availability(date: str) -> list:
    """Internal function to check calendar availability."""
    creds = get_google_calendar_creds()
    service = build('calendar', 'v3', credentials=creds)
    
    date_obj = datetime.strptime(date, '%Y-%m-%d')
    time_min = date_obj.isoformat() + 'Z'
    time_max = (date_obj + timedelta(days=1)).isoformat() + 'Z'
    
    events_result = service.events().list(
        calendarId='primary',
        timeMin=time_min,
        timeMax=time_max,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    return events_result.get('items', [])

async def _create_calendar_event(date: str, time: str, duration: int, title: str, description: str = "") -> dict:
    """Internal function to create a calendar event."""
    creds = get_google_calendar_creds()
    service = build('calendar', 'v3', credentials=creds)
    
    start_datetime = datetime.strptime(f"{date} {time}", '%Y-%m-%d %H:%M')
    end_datetime = start_datetime + timedelta(minutes=duration)
    
    event = {
        'summary': title,
        'description': description,
        'start': {
            'dateTime': start_datetime.isoformat(),
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': end_datetime.isoformat(),
            'timeZone': 'UTC',
        },
    }
    
    return service.events().insert(calendarId='primary', body=event).execute()

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
        # First check if the slot is available
        availability = await check_time_slot_available(self, date, time, duration)
        if "not available" in availability:
            return availability
            
        # If available, create the event
        event = await _create_calendar_event(date, time, duration, title, description)
        return f"Appointment booked: {title} on {date} at {time} for {duration} minutes."
        
    except Exception as e:
        return f"Error booking appointment: {str(e)}"

async def entrypoint(ctx: JobContext):
    metadata = json.loads(ctx.room.metadata)
    index_name = metadata.get('pineconeIndex')
    
    if not index_name:
        raise ValueError("No Pinecone index specified")

    rag_agent = PineconeRagAgent(index_name)
    
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "You are a voice assistant created by LiveKit. Your interface with users will be voice. "
            "You should use short and concise responses, and avoiding usage of unpronouncable punctuation. "
            "Use the query_knowledge function when you need specific information."
        ),
    )

    fnc_ctx = llm.FunctionContext()

    @fnc_ctx.ai_callable(description="Query knowledge base")
    async def query_knowledge(query: str) -> str:
        result = await rag_agent.query_knowledge(query)
        logger.info(f"Knowledge query result: {result}")
        return result

    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")

    dg_model = "nova-2-general"
    if participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
        dg_model = "nova-2-phonecall"

    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(model=dg_model),
        llm=cerebras.LLM(),
        tts=cartesia.TTS(),
        turn_detector=turn_detector.EOUModel(),
        chat_ctx=initial_ctx,
        fnc_ctx=fnc_ctx,
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

    await agent.say("Hey, how can I help you today?", allow_interruptions=True)


class PineconeRagAgent:
    def __init__(self, index_name: str):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = self.pc.Index(index_name)
        self.embeddings_dimension = 1536

    async def query_knowledge(self, query: str) -> str:
        user_embedding = await openai.create_embeddings(
            input=[query],
            model="text-embedding-3-small",
            dimensions=self.embeddings_dimension,
        )

        query_response = self.index.query(
            vector=user_embedding[0].embedding,
            top_k=3,
            include_metadata=True
        )

        contexts = []
        for match in query_response.matches:
            if match.score > 0.7:
                contexts.append(match.metadata.get('text', ''))
        
        return "\n".join(contexts) if contexts else ''


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
    )