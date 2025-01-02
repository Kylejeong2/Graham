import asyncio
import logging
import os
# import json
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
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, silero, turn_detector, cartesia
# openai as LivekitOpenAI
from custom_plugins import cerebras_plugin as cerebras

from typing import Annotated
import dateparser  # Add this import at the top
import time


load_dotenv()
logger = logging.getLogger("voice-assistant")

SCOPES = ['https://www.googleapis.com/auth/calendar']

class PineconeRagAgent:
    def __init__(self, index_name: str):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = self.pc.Index(index_name)
        self.embeddings_dimension = 1536
        self.cache = {}  # Simple in-memory cache
        
    async def should_use_rag(self, query: str) -> bool:
        # List of keywords that indicate domain-specific knowledge is needed
        domain_keywords = [
            "company", "product", "policy", "specific", "detail", 
            "documentation", "process", "procedure", "guide"
        ]
        return any(keyword in query.lower() for keyword in domain_keywords)

    async def query_knowledge(self, query: str) -> str:
        if not await self.should_use_rag(query):
            return ''
            
        # Check cache first
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
                    "timestamp": {"$gte": (datetime.now() - timedelta(days=30)).timestamp()}  # Only get recent docs
                }
            )

            contexts = []
            for match in query_response.matches:
                if match.score > 0.8:  # Increased threshold for better relevance
                    contexts.append(match.metadata.get('text', ''))
            
            result = "\n".join(contexts) if contexts else ''
            
            # Cache the result
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

def get_google_calendar_creds():
    """Get Google Calendar credentials, creating them if they don't exist."""
    creds = None
    token_path = 'token.json'
    credentials_path = 'credentials.json'

    # Check if token.json exists
    if os.path.exists(token_path):
        try:
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        except Exception as e:
            logger.error(f"Error loading credentials: {e}")
            os.remove(token_path)  # Remove invalid token
            creds = None

    # If no valid credentials, create new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                logger.error(f"Error refreshing token: {e}")
                os.remove(token_path)
                creds = None

        if not creds:
            if not os.path.exists(credentials_path):
                raise FileNotFoundError(
                    "No credentials.json found. Please download it from Google Cloud Console "
                    "and place it in the root directory."
                )
            
            # Find an available port
            import socket
            def find_free_port():
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('', 0))
                    s.listen(1)
                    port = s.getsockname()[1]
                return port

            port = find_free_port()
            redirect_uri = f'http://localhost:{port}'
            
            flow = InstalledAppFlow.from_client_secrets_file(
                credentials_path, 
                SCOPES,
                redirect_uri=redirect_uri
            )
            creds = flow.run_local_server(
                port=port,
                prompt='consent',
                authorization_prompt_message="Please visit this URL to authorize Graham: "
            )

        # Save the credentials for future use
        with open(token_path, 'w') as token:
            token.write(creds.to_json())
            logger.info("Saved new credentials to token.json")

    return creds

def parse_natural_date(date_str: str) -> str:
    """Convert natural language date to YYYY-MM-DD format."""
    if not date_str:
        return datetime.now().strftime('%Y-%m-%d')
        
    try:
        # Handle special cases
        date_str = date_str.lower().strip()
        now = datetime.now()
        
        if 'tonight' in date_str or 'this evening' in date_str:
            return now.strftime('%Y-%m-%d')
            
        if 'next week' in date_str:
            return (now + timedelta(days=7)).strftime('%Y-%m-%d')
            
        if 'next' in date_str:
            # Handle "next Monday", "next Tuesday", etc.
            day_name = date_str.replace('next', '').strip()
            current_day = now.weekday()
            target_day = time.strptime(day_name, '%A').tm_wday
            days_ahead = target_day - current_day
            if days_ahead <= 0:  # Target day already happened this week
                days_ahead += 7
            return (now + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
            
        # Use dateparser for all other cases
        parsed_date = dateparser.parse(date_str, settings={
            'RELATIVE_BASE': now,
            'PREFER_DATES_FROM': 'future',
            'PREFER_DAY_OF_MONTH': 'current'
        })
        
        if parsed_date:
            # If the date is in the past and it's a day name (e.g. "Monday"),
            # assume they mean next occurrence
            if parsed_date < now and any(day in date_str.lower() for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']):
                parsed_date += timedelta(days=7)
            return parsed_date.strftime('%Y-%m-%d')
            
        raise ValueError(f"Could not parse date: {date_str}")
    except Exception as e:
        logger.error(f"Error parsing date {date_str}: {str(e)}")
        return date_str

async def _check_calendar_availability(date: str) -> list:
    """Internal function to check calendar availability."""
    try:
        # Convert natural language date to YYYY-MM-DD
        formatted_date = parse_natural_date(date)
        
        creds = get_google_calendar_creds()
        service = build('calendar', 'v3', credentials=creds)
        
        date_obj = datetime.strptime(formatted_date, '%Y-%m-%d')
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
    except Exception as e:
        logger.error(f"Error in _check_calendar_availability: {str(e)}")
        raise

async def _create_calendar_event(date: str, time: str, duration: int, title: str, description: str = "") -> dict:
    """Internal function to create a calendar event."""
    try:
        creds = get_google_calendar_creds()
        service = build('calendar', 'v3', credentials=creds)
        
        # Get local timezone
        local_tz = datetime.now().astimezone().tzinfo
        
        # Parse date and time
        start_datetime = datetime.strptime(f"{date} {time}", '%Y-%m-%d %H:%M').replace(tzinfo=local_tz)
        end_datetime = start_datetime + timedelta(minutes=duration)
        
        event = {
            'summary': title,
            'description': description,
            'start': {
                'dateTime': start_datetime.isoformat(),
                'timeZone': str(local_tz),
            },
            'end': {
                'dateTime': end_datetime.isoformat(),
                'timeZone': str(local_tz),
            },
        }
        
        return service.events().insert(calendarId='primary', body=event).execute()
    except Exception as e:
        logger.error(f"Error creating calendar event: {str(e)}")
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
        # First check if the slot is available
        availability = await check_time_slot_available(self, date, time, duration)
        if "not available" in availability:
            return availability
            
        # If available, create the event
        await _create_calendar_event(date, time, duration, title, description)
        return f"Appointment booked: {title} on {date} at {time} for {duration} minutes."
        
    except Exception as e:
        return f"Error booking appointment: {str(e)}"


def format_date_for_display(date_str: str) -> str:
    """Convert YYYY-MM-DD to natural language date."""
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        today = datetime.now()
        tomorrow = today + timedelta(days=1)
        
        if date_obj.date() == today.date():
            return "today"
        elif date_obj.date() == tomorrow.date():
            return "tomorrow"
        else:
            return date_obj.strftime("%A, %B %d")  # e.g. "Thursday, January 18"
    except Exception as e:
        logger.error(f"Error formatting date {date_str}: {str(e)}")
        return date_str

def format_time_for_display(time_str: str) -> str:
    """Convert HH:MM to natural 12-hour format."""
    try:
        time_obj = datetime.strptime(time_str, '%H:%M')
        return time_obj.strftime("%I:%M %p").lstrip("0").lower()  # e.g. "2:00 pm"
    except Exception as e:
        logger.error(f"Error formatting time {time_str}: {str(e)}")
        return time_str

async def entrypoint(ctx: JobContext):
    try:
        # Get current date/time for context
        current_time = datetime.now()
        current_date = current_time.strftime('%Y-%m-%d')
        current_time_str = current_time.strftime('%I:%M %p').lstrip("0").lower()
        
        initial_ctx = llm.ChatContext().append(
            role="system",
            text=(
                f"You are a voice assistant named Graham. Current time is {current_time_str} on {format_date_for_display(current_date)}. "
                "Your interface with users will be voice. Keep responses extremely concise and natural. "
                "Avoid unnecessary words. Respond quickly with short, direct answers. "
                
                "When users ask about calendar operations: "
                "1. IMMEDIATELY acknowledge their request with a brief response "
                "2. Then use the appropriate async calendar function: "
                "   - For checking: await handle_calendar_request('check', date=date, time=time) "
                "   - For scheduling: await handle_calendar_request('schedule', title=title, date=date, time=time) "
                "3. The function will handle the acknowledgment and response automatically "
                
                "Example responses: "
                "- 'Let me check your calendar.' "
                "- 'I'll add that to your calendar.' "
                "- 'One moment while I check that.' "
                
                "Calendar formatting: "
                "- Use natural language for dates (today, tomorrow, next Monday) "
                "- Use 12-hour time format (2:30 pm, 4 pm) "
                "- Default to current date for relative times "
                "- For next week, assume they mean the same day next week"
            ),
        )

        # Add calendar functions to function context
        fnc_ctx = llm.FunctionContext()

        @fnc_ctx.ai_callable(description="Check calendar availability for a specific date and time")
        async def check_calendar_availability(
            time: Annotated[str, llm.TypeInfo(description="Time in natural format (2:30 pm, 4 pm)")] = None,
            date: Annotated[str, llm.TypeInfo(description="Date in natural language (today, tomorrow, next Monday)")] = None
        ) -> str:
            try:
                if date is None:
                    date = current_date
                
                if time:
                    # Convert time like "4 PM" to "16:00"
                    try:
                        parsed_time = dateparser.parse(time)
                        if parsed_time:
                            time = parsed_time.strftime('%H:%M')
                        else:
                            return f"Invalid time format: {time}. Please use format like '4 pm' or '2:30 pm'"
                    except ValueError as e:
                        return f"Invalid time format: {time}. Please use format like '4 pm' or '2:30 pm {e}'"
                
                events = await _check_calendar_availability(date)
                formatted_date = format_date_for_display(parse_natural_date(date))
                
                if not events:
                    return f"Your calendar is clear {formatted_date}" + (f" at {format_time_for_display(time)}" if time else "")
                
                busy_times = []
                for event in events:
                    start = event['start'].get('dateTime', event['start'].get('date'))
                    end = event['end'].get('dateTime', event['end'].get('date'))
                    start_time = datetime.fromisoformat(start.replace('Z', '+00:00')).strftime('%I:%M %p').lstrip("0").lower()
                    end_time = datetime.fromisoformat(end.replace('Z', '+00:00')).strftime('%I:%M %p').lstrip("0").lower()
                    
                    # If specific time was requested, only show conflicting events
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
                    
                # Get local timezone
                local_tz = datetime.now().astimezone().tzinfo
                
                # Parse time and make it timezone aware
                parsed_time = dateparser.parse(time)
                if not parsed_time:
                    return f"Invalid time format: {time}. Please use format like '4 pm' or '2:30 pm'"
                time = parsed_time.strftime('%H:%M')
                
                # Create timezone-aware datetime objects
                requested_start = datetime.strptime(f"{formatted_date} {time}", '%Y-%m-%d %H:%M').replace(tzinfo=local_tz)
                requested_end = requested_start + timedelta(minutes=duration)
                
                # Check availability
                events = await _check_calendar_availability(formatted_date)
                
                for event in events:
                    event_start = datetime.fromisoformat(event['start'].get('dateTime', event['start'].get('date'))).replace(tzinfo=local_tz)
                    event_end = datetime.fromisoformat(event['end'].get('dateTime', event['end'].get('date'))).replace(tzinfo=local_tz)
                    
                    if (requested_start < event_end and requested_end > event_start):
                        return f"Cannot schedule. Conflicts with: {event['summary']} ({event_start.strftime('%I:%M %p').lstrip('0').lower()} - {event_end.strftime('%I:%M %p').lstrip('0').lower()})"
                
                await _create_calendar_event(formatted_date, time, duration, title, description)
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

        agent = VoicePipelineAgent(
            vad=ctx.proc.userdata["vad"],
            stt=deepgram.STT(
                model=dg_model,
                interim_results=True,  # Enable streaming transcription
                smart_format=True,     # Faster formatting
            ),
            # llm=LivekitOpenAI.LLM(
            #     model="gpt-3.5-turbo",  # Faster than default model
            #     temperature=0.7,
            #     stream=True,  # Enable streaming responses
            # ),
            llm=cerebras.LLM(
                temperature=0.5,  # Lower temperature for faster, more focused responses
            ),
            tts=cartesia.TTS(),
            turn_detector=turn_detector.EOUModel(),
            chat_ctx=initial_ctx,
            fnc_ctx=fnc_ctx,
        )

        agent.start(ctx.room, participant)
        logger.info("Agent started successfully")

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