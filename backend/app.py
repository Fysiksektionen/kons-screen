import sys
import os
import json
import requests

from flask import Flask, Response

from APIs.common.paths import DB_PATH

app = Flask(__name__)

# Check if remotedb is passed as an argument.
REMOTE = any([arg == "--remotedb" for arg in sys.argv])

# Should probably be something like https://f.kth.se/kons/
BASE_URL = os.environ.get('KONS_SCREEN_PROXY_URL', "https://f.kth.se/")

def data_endpoint(filename, URL, remote=REMOTE):
    """
    Either returns data from a local database or fetches data from URL
    """
    response_text = ""
    if remote:
        response =  requests.get(URL)

        # If status code 200-299 then return response.text
        if divmod(response.status_code, 100)[0] == 2:
            response_text = response.text
    # Load from local db, used in testing.
    # If the request above wasn't successful or if REMOTE==False this will run.
    if response_text == "":
        with open(DB_PATH + filename, "r") as db:
            response_text = db.read()
    
    response = Response(response_text)
    response.headers['Content-Type'] = 'application/json'
    response.headers['Access-Control-Allow-Origin'] = '*'
    print("returning response from:", URL if remote else filename)
    return response


@app.route('/sl-data')
def sl_data():
    return data_endpoint("sl-data.json", BASE_URL + "sl-data")

@app.route('/facebook')
def facebook():         
    return data_endpoint("facebook.json", BASE_URL + "facebook-data")

@app.route('/instagram')
def instagram():
    return data_endpoint("slides.json", BASE_URL + "konsol/api/screen/slides", remote=False)

@app.route('/sektionskalendern')
def sektionskalendern():
    return data_endpoint("sektionskalendern.json", BASE_URL + "calendar-data")

@app.route('/fnews')
def fnews():
    return data_endpoint("fnews.rss", "https://f.kth.se/feed")


if __name__ == '__main__':
    DEBUG = any([arg == "--debug" for arg in sys.argv])
    print("Launching with debug={} and REMOTE={}".format(DEBUG, REMOTE))
    app.run(host="0.0.0.0",debug=DEBUG)

