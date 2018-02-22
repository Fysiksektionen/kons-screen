import sys
import json
import requests

from flask import Flask, render_template

from APIs.common.configs import DB_PATH

app = Flask(__name__)

LOCAL = any([arg == "--localdb" for arg in sys.argv])

def data_endpoint(name):
    """
    Decorator which wraps every database endpoint route.
    """

    # placeholder url, should probably be something like https://f.kth.se/kons/"
    BASE_URL = "https://f.kth.se/"
    
    if LOCAL:
        with open(DB_PATH + name + ".json", "r") as db:
            return db.read()
    else:
        response =  requests.get(BASE_URL + name)

        # If status code 200-299 then response.json()
        if divmod(response.status_code, 100)[0] == 2:
            return json.dumps(response.json())
    
@app.route('/')
def index():
    return render_template('index.html')  # jinja2 template

@app.route('/sl-data')
def sl_data():
    return data_endpoint("sl-data")

@app.route('/facebook')
def facebook():         
    return data_endpoint("facebook")

@app.route('/instagram')
def instagram():
    return data_endpoint("instagram")

@app.route('/fnews')
def fnews():
    return data_endpoint("fnews")

@app.route('/sektionskalendern')
def sektionskalendern():
    return data_endpoint("sektionskalendern")

if __name__ == '__main__':
    app.run()