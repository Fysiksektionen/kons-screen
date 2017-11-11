import time

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')  # jinja2 template

@socketio.on('connected')
def init(message):
    emit('server response', {"time":time.strftime("%H:%M:%S")})

@socketio.on('update')
def update_data():
    emit('server response', {'time': time.strftime("%H:%M:%S")})
    socketio.sleep(seconds=10)

if __name__ == '__main__':
    socketio.run(app)