import time
import json

from flask import Flask, render_template

from db.DBHandler import DB
from settings import DB_PATH

app = Flask(__name__)

@app.route('/')
def index():
    db = DB(DB_PATH, read_only=True)
    return render_template('feed.html', db=db, time=time.strftime("%H:%M:%S"))  # jinja2 template

# This route can be removed once we have a remote server implemented and
# if we decide to not use a python script "middleman" to fetch the data.
@app.route('/update')
def update():
    db = DB(DB_PATH, read_only=True)
    return json.dumps({'time': time.strftime("%H:%M:%S"), **db})

if __name__ == '__main__':
    app.run()