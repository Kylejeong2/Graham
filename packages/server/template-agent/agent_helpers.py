import logging
import os
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import dateparser
import time

import fetch
import json

logger = logging.getLogger("voice-assistant")
SCOPES = ['https://www.googleapis.com/auth/calendar']

async def get_google_calendar_creds(agent_id: str, user_id: str):
    """Get Google Calendar credentials from environment variables."""
    try:
        if not os.getenv('GOOGLE_CALENDAR_ENABLED') == 'true':
            logger.error("Google Calendar is not enabled for this agent")
            return None

        if not all([
            os.getenv('GOOGLE_CALENDAR_ACCESS_TOKEN'),
            os.getenv('GOOGLE_CALENDAR_REFRESH_TOKEN'),
            os.getenv('GOOGLE_CALENDAR_EXPIRES_AT')
        ]):
            logger.error("Missing required Google Calendar environment variables")
            return None
            
        # Create credentials object from environment variables
        creds = Credentials(
            token=os.getenv('GOOGLE_CALENDAR_ACCESS_TOKEN'),
            refresh_token=os.getenv('GOOGLE_CALENDAR_REFRESH_TOKEN'),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
            scopes=SCOPES,
            expiry=datetime.fromisoformat(os.getenv('GOOGLE_CALENDAR_EXPIRES_AT'))
        )
        
        # Check if credentials need refresh
        if creds.expired:
            try:
                creds.refresh(Request())
                # Update stored tokens in database via API
                await update_calendar_tokens(
                    agent_id,
                    user_id,
                    creds.token,
                    creds.refresh_token,
                    creds.expiry
                )
            except Exception as e:
                logger.error(f"Error refreshing token: {e}")
                return None
                
        return creds
    except Exception as e:
        logger.error(f"Error getting calendar credentials: {e}")
        return None

async def update_calendar_tokens(agent_id: str, user_id: str, access_token: str, refresh_token: str, expires_at: datetime):
    """Update calendar tokens in the database via API."""
    try:
        response = await fetch(f"{os.getenv('GRAHAM_API_URL')}/api/calendar/update-tokens", {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {os.getenv('GRAHAM_API_KEY')}"
            },
            "body": json.dumps({
                "agentId": agent_id,
                "userId": user_id,
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "expiresAt": expires_at.isoformat()
            })
        })
        
        if not response.ok:
            raise Exception("Failed to update calendar tokens")
            
    except Exception as e:
        logger.error(f"Error updating calendar tokens: {e}")
        raise

async def _check_calendar_availability(date: str, agent_id: str = None, user_id: str = None) -> list:
    """Internal function to check calendar availability."""
    try:
        formatted_date = parse_natural_date(date)
        
        if not agent_id or not user_id:
            logger.error("agent_id and user_id are required for calendar operations")
            return []
            
        creds = await get_google_calendar_creds(agent_id, user_id)
        if not creds:
            logger.error("Failed to get Google Calendar credentials")
            return []
            
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

async def _create_calendar_event(date: str, time: str, duration: int, title: str, description: str = "", agent_id: str = None, user_id: str = None) -> dict:
    """Internal function to create a calendar event."""
    try:
        if not agent_id or not user_id:
            logger.error("agent_id and user_id are required for calendar operations")
            return None
            
        creds = await get_google_calendar_creds(agent_id, user_id)
        if not creds:
            logger.error("Failed to get Google Calendar credentials")
            return None
            
        service = build('calendar', 'v3', credentials=creds)
        
        local_tz = datetime.now().astimezone().tzinfo
        
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

def parse_natural_date(date_str: str) -> str:
    """Convert natural language date to YYYY-MM-DD format."""
    if not date_str:
        return datetime.now().strftime('%Y-%m-%d')
        
    try:
        date_str = date_str.lower().strip()
        now = datetime.now()
        
        if 'tonight' in date_str or 'this evening' in date_str:
            return now.strftime('%Y-%m-%d')
            
        if 'next week' in date_str:
            return (now + timedelta(days=7)).strftime('%Y-%m-%d')
            
        if 'next' in date_str:
            day_name = date_str.replace('next', '').strip()
            current_day = now.weekday()
            target_day = time.strptime(day_name, '%A').tm_wday
            days_ahead = target_day - current_day
            if days_ahead <= 0:
                days_ahead += 7
            return (now + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
            
        parsed_date = dateparser.parse(date_str, settings={
            'RELATIVE_BASE': now,
            'PREFER_DATES_FROM': 'future',
            'PREFER_DAY_OF_MONTH': 'current'
        })
        
        if parsed_date:
            if parsed_date < now and any(day in date_str.lower() for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']):
                parsed_date += timedelta(days=7)
            return parsed_date.strftime('%Y-%m-%d')
            
        raise ValueError(f"Could not parse date: {date_str}")
    except Exception as e:
        logger.error(f"Error parsing date {date_str}: {str(e)}")
        return date_str

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
            return date_obj.strftime("%A, %B %d")
    except Exception as e:
        logger.error(f"Error formatting date {date_str}: {str(e)}")
        return date_str

def format_time_for_display(time_str: str) -> str:
    """Convert HH:MM to natural 12-hour format."""
    try:
        time_obj = datetime.strptime(time_str, '%H:%M')
        return time_obj.strftime("%I:%M %p").lstrip("0").lower()
    except Exception as e:
        logger.error(f"Error formatting time {time_str}: {str(e)}")
        return time_str 