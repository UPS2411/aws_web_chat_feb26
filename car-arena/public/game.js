const socket = new WebSocket(`ws://${location.host}`);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let players = {};
let obstacles = {};

const name = prompt("Enter your name:");

socket.onopen = () => {
  socket.send(
    JSON.stringify({
      type: "join",
      name,
    }),
  );
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "update") {
    players = data.players;
    obstacles = data.obstacles;
    draw();
  }

  if (data.type === "chat") {
    const msg = document.createElement("div");
    msg.textContent = data.name + ": " + data.message;
    document.getElementById("messages").appendChild(msg);
  }
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw obstacles
  obstacles.forEach((obs) => {
    ctx.fillStyle = "gray";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });

  // Draw players
  for (let id in players) {
    const p = players[id];
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);

    ctx.fillStyle = "black";
    ctx.fillText(p.name, p.x, p.y - 5);
  }
}

// Controls
document.getElementById("up").onclick = () => {
  socket.send(JSON.stringify({ type: "move", direction: "up" }));
};

document.getElementById("down").onclick = () => {
  socket.send(JSON.stringify({ type: "move", direction: "down" }));
};

document.getElementById("chatInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    socket.send(
      JSON.stringify({
        type: "chat",
        message: e.target.value,
      }),
    );
    e.target.value = "";
  }
});
