import time
import json

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from update_db import DB

app = Flask(__name__)
socketio = SocketIO(app)
DB_FILE = "db.json"

@app.route('/')
def index():
    # this db needs to be merged into a single one at some point.
    db = DB(DB_FILE, read_only=True)
    return render_template('feed.html', db=db)  # jinja2 template

@socketio.on('update')
def update_data():
    # TODO: should only send data that was changed so as to not use unnecessary bandwidth.
    db = DB(DB_FILE, read_only=True)
    # sending time to prove dynamic content works.
    emit('server response', {'time': time.strftime("%H:%M:%S"), **db})
    socketio.sleep(seconds=10)

if __name__ == '__main__':
    socketio.run(app)