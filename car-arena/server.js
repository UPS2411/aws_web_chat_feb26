const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

const PORT = 3000;

let players = {};
let obstacles = [];

// Generate random obstacles
for (let i = 0; i < 5; i++) {
  obstacles.push({
    x: Math.random() * 800,
    y: Math.random() * 400,
    width: 60,
    height: 60,
  });
}

function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    // New player
    if (data.type === "join") {
      players[ws.id] = {
        id: ws.id,
        name: data.name,
        x: 50,
        y: 50 + Math.random() * 200,
        width: 40,
        height: 20,
        color: randomColor(),
      };
    }

    // Movement
    if (data.type === "move") {
      const player = players[ws.id];
      if (!player) return;

      const SPEED = 4;
      let oldY = player.y;

      if (data.direction === "up") player.y -= SPEED;
      if (data.direction === "down") player.y += SPEED;

      // Prevent obstacle collision
      for (let obs of obstacles) {
        if (isColliding(player, obs)) {
          player.y = oldY;
        }
      }

      // Prevent car collision
      for (let id in players) {
        if (id !== ws.id) {
          if (isColliding(player, players[id])) {
            player.y = oldY;
          }
        }
      }
    }

    // Chat
    if (data.type === "chat") {
      broadcast({
        type: "chat",
        name: players[ws.id]?.name,
        message: data.message,
      });
    }
  });

  ws.id = Math.random().toString(36).substr(2, 9);

  ws.on("close", () => {
    delete players[ws.id];
  });
});

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Game loop
setInterval(() => {
  broadcast({
    type: "update",
    players,
    obstacles,
  });
}, 1000 / 30);

server.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
