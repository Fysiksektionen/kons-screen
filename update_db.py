import json
import APIs

class DB(dict):
    def __init__(self, fname, force_update=False, read_only=False):
        self.fname = fname
        self.force_update = force_update  # If True: rewrite db even if items are the same
        self._json = {}
        try:
            with open(fname,'r') as db:
                filecontent = db.read()
                if filecontent:
                    self._json = json.loads(filecontent)
        except FileNotFoundError:
            print("Could not find file '{}', created new file '{}'".format(fname,fname))
            open(fname,"w").close()
        super().__init__(self, **self._json)

    def update(self):
        current_items = self.items()
        if not read_only:
            if self._json.items() != current_items or self.force_update:
                with open(self.fname,'w') as db:
                    json.dump(self, db, indent=4, separators=(',', ': '))
                    self._json = current_items
                    print("rewrote")

    def __enter__(self):
        return self

    def __exit__(self, exc_msg, exc_type, traceback):
        self.update()

def update_db():
    # fysiksektionen_page_id = "Fysiksektionen"  
    fysiksektionen_group_id = "1225386484209166"
    instagram_page = "Fysiksektionen"
    google_calendar_id = "e17rpovh5v7j79fpp74d1gker8@group.calendar.google.com"
    
    with DB("db.json") as db:
        db["facebook"]  = APIs.Facebook.get_group(fysiksektionen_group_id, limit=10)
        db["instagram"] = APIs.Instagram.get_media_content(instagram_page)
        db["calendar"] = APIs.Calendar.list_calendar_events(google_calendar_id, limit=10)
    
if __name__ == "__main__":
    # set cron job to this script.
    update_db()