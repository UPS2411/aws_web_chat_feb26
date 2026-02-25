from flask import Flask, send_from_directory
from flask_socketio import SocketIO, send
import os
import logging

# -------------------------
# Flask & SocketIO setup
# -------------------------
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# -------------------------
# Logging configuration
# -------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler("chat.log"),   # file for CloudWatch
        logging.StreamHandler()            # terminal output
    ]
)

# -------------------------
# Routes
# -------------------------
@app.route('/')
def index():
    return send_from_directory(os.getcwd(), 'index.html')

@app.route('/socket.io.min.js')
def serve_socketio():
    return send_from_directory(os.getcwd(), 'socket.io.min.js')

# -------------------------
# SocketIO handler
# -------------------------
@socketio.on('message')
def handle_message(msg):
    logging.info(f"{msg['name']} : {msg['text']}")
    send(msg, broadcast=True)

# -------------------------
# App start
# -------------------------
if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000)
