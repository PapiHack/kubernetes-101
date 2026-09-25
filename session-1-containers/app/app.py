import os
import socket
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    greeting = os.environ.get("GREETING", "Hello")
    return f"{greeting} from container {socket.gethostname()}!\n"

@app.route("/health")
def health():
    return "OK\n"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
