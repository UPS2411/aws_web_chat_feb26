const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const users = {};

function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

io.on("connection", (socket) => {
  socket.on("join", (name) => {
    users[socket.id] = {
      name,
      color: randomColor(),
    };

    socket.emit("init", users[socket.id]);
    io.emit("users", users);
  });

  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", {
      ...data,
      color: users[socket.id]?.color,
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("users", users);
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on LAN");
});
