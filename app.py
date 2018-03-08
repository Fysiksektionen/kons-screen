import sys
import json
import requests

from flask import Flask, send_from_directory

from APIs.common.configs import DB_PATH

app = Flask(__name__, static_url_path='/static')

# Check if remotedb is passed as an argument.
REMOTE = any([arg == "--remotedb" for arg in sys.argv])

# Should probably be something like https://f.kth.se/kons/
BASE_URL = "https://f.kth.se/"

def data_endpoint(filename, URL):
    """
    Either returns data from a local database or fetches data from URL
    """
    
    if REMOTE:  
        response =  requests.get(URL)

        # If status code 200-299 then return response.text
        if divmod(response.status_code, 100)[0] == 2:
            return response.text
    # Load from local db, used in testing.
    with open(DB_PATH + filename, "r") as db:
        return db.read()
            
@app.route('/')
def index():
    return send_from_directory('static', 'screen.html')

@app.route('/sl-data')
def sl_data():
    return data_endpoint("sl-data.json", "https://f.kth.se/sl-data")

@app.route('/facebook')
def facebook():         
    return data_endpoint("facebook.json", BASE_URL + "facebook")

@app.route('/instagram')
def instagram():
    return data_endpoint("instagram.json", BASE_URL + "instagram")

@app.route('/fnews')
def fnews():
    return data_endpoint("fnews.rss", "https://f.kth.se/feed")

@app.route('/sektionskalendern')
def sektionskalendern():
    return data_endpoint("sektionskalendern.json", BASE_URL + "sektionskalendern")

@app.route('/metadata')
def metadata():
    filename = "metadata.json"
    with open(DB_PATH + filename, "r+") as db:
        metadata = json.load(db)

        if  metadata.get("sl_carousel") in [0,1,2]:
            metadata["sl_carousel"] = (metadata["sl_carousel"] + 1) % 3  # 3 is for the length of ["buses", "metro", "tram"]

        db.seek(0)
        json.dump(metadata, db, indent=4, separators=(',', ': '))
        return json.dumps(metadata)

if __name__ == '__main__':
    DEBUG = any([arg == "--debug" for arg in sys.argv])
    print("Launching with debug={} and REMOTE={}".format(DEBUG, REMOTE))
    app.run(debug=DEBUG)

