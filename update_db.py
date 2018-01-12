
import APIs
from db.DBHandler import DB

def update_db(path):
    # fysiksektionen_page_id = "Fysiksektionen"  
    fysiksektionen_group_id = "1225386484209166"
    instagram_page = "2905411461"
    google_calendar_id = "e17rpovh5v7j79fpp74d1gker8@group.calendar.google.com"
    
    with DB(path) as db:
        db["facebook"]  = APIs.Facebook.get_group(fysiksektionen_group_id, limit=10)
        db["instagram"] = APIs.Instagram.get_media_content(instagram_page, limit=10)
        db["calendar"] = APIs.Calendar.list_calendar_events(google_calendar_id, limit=10)
        db["fnews"] = APIs.FNewsfeed.get_items(limit=5)

if __name__ == "__main__":
    # set cron job to this script.
    from settings import DB_PATH

    update_db(DB_PATH)