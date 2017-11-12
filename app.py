import time
import json

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    with open("APIs/facebook/recent_facebook.json", "r") as db:
        fb_posts = json.loads(db.read())
    return render_template('feed.html', fb_posts=fb_posts)  # jinja2 template

@socketio.on('update')
def update_data():
    emit('server response', {'time': time.strftime("%H:%M:%S")})
    socketio.sleep(seconds=10)

if __name__ == '__main__':
    socketio.run(app)