import requests
import datetime

from common.requester import get_request
from common.guarantee_content import guarantee_content 
from common.configs import GOOGLE_API_KEY


#-------- Globals for this API -------- #

BASE_URL = "https://www.googleapis.com/calendar/v3/calendars/"


#-------- Functionality -------- #

def list_calendar_events(calendar_id,limit=10, parser=lambda r: r.json()):
    get_events_url = BASE_URL + calendar_id + "/events"
    now = datetime.datetime.utcnow().isoformat() + "Z"  # Z indicates UTC.

    data = {"key":GOOGLE_API_KEY, "maxResults":limit, "timeMin":now, "singleEvents":True,"orderBy":"startTime"}
    response = get_request(get_events_url, params=data, parser=parser)
    return response

def validate_and_parse(response):
    """
    Validates the response in case the response was a 200 code but not the expected format.
    
    Returns: False if not validated, otherwise return the parsed response.
    """
    response=response.json()
    events = response.get("items")
    if events:
        # Check if all elements in `events` contain the following important keys.
        if guarantee_content(events, "summary","start","end"):
            return events
    return False


if __name__ == "__main__":
    from common.configs import DB_PATH
    from common.writer import write_json

    calendar_id = "e17rpovh5v7j79fpp74d1gker8@group.calendar.google.com"    
    
    events = list_calendar_events(calendar_id, limit=10, parser=validate_and_parse)

    # If validate_and_parse did not return False.
    if events:
        write_json(events, DB_PATH, "sektionskalendern.json")