import requests
import json
import datetime

from configs import GOOGLE_API_KEY

BASE_URL = "https://www.googleapis.com/calendar/v3/calendars/"

def list_calendar_events(calendar_id,limit=10):
    get_events_url = BASE_URL + calendar_id + "/events"
    now = datetime.datetime.utcnow().isoformat() + "Z"  # Z indicates UTC.

    data = {"key":GOOGLE_API_KEY, "maxResults":limit, "timeMin":now, "singleEvents":True,"orderBy":"startTime"}
    response = requests.get(get_events_url, params=data)

    return response.json()

if __name__ == "__main__":
    from configs import DB_PATH

    calendar_id = "e17rpovh5v7j79fpp74d1gker8@group.calendar.google.com"    
    events = list_calendar_events(calendar_id, limit=10)

    full_path="{}{}".format(DB_PATH, "sektionskalender.json")
    with open(full_path, "w") as db:  # dump json to file.
        json.dump(events, db, indent=4, separators=(',', ': '))