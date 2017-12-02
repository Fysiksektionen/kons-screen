import time
import json

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from db.DBHandler import DB
from settings import DB_PATH

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    db = DB(DB_PATH, read_only=True)
    return render_template('feed.html', db=db)  # jinja2 template

@socketio.on('update')
def update_data():
    # TODO: should only send data that was changed so as to not use unnecessary bandwidth.
    db = DB(DB_PATH, read_only=True)
    # sending time to prove dynamic content works.
    emit('server response', {'time': time.strftime("%H:%M:%S"), **db})

if __name__ == '__main__':
    socketio.run(app)