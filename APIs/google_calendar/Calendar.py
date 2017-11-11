import requests
import json
import datetime

from config import API_KEY

BASE_URL = "https://www.googleapis.com/calendar/v3/calendars/"

def list_calendar_events(calendar_id,limit=10):
    get_events_url = BASE_URL + calendar_id + "/events"
    now = datetime.datetime.utcnow().isoformat() + "Z"  # Z indicates UTC.

    data = {"key":API_KEY, "maxResults":limit, "timeMin":now, "singleEvents":True,"orderBy":"startTime"}
    response = requests.get(get_events_url, params=data)

    return response.json()

if __name__ == "__main__":
    calendar_id = "e17rpovh5v7j79fpp74d1gker8@group.calendar.google.com"
    
    events = list_calendar_events(calendar_id, limit=10)
    with open("coming_events.json", "w") as db:
        json.dump(events, db, indent=4, separators=(',', ': '))