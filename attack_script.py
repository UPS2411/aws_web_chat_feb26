import socketio
import time
import random
import string

# 🔹 Take server IP as input
server_ip = input("Enter App EC2 IP (with port, e.g. http://x.x.x.x:5000): ").strip()
SERVER_URL = server_ip

sio = socketio.Client()

def random_name():
    return "bot_" + "".join(random.choices(string.ascii_lowercase, k=4))

def random_message():
    return "msg_" + "".join(random.choices(string.ascii_letters, k=8))

@sio.event
def connect():
    print("Connected to server")

@sio.event
def disconnect():
    print("Disconnected")

# connect using websocket
sio.connect(SERVER_URL, transports=["websocket"])

name = random_name()

while True:
    msg = {
        "name": name,
        "text": random_message()
    }
    sio.send(msg)
    time.sleep(0.2)