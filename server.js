const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();

app.use(express.static(`${__dirname}/client`));

const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 8080;

io.on("connection", (sock) => {
  // console.log("connected");
  sock.emit("message", { text: "You are connected" });

  sock.on("joinGame", (game) => {
    sock.join(game.gameId);

    let players = io.sockets.adapter.rooms.get(game.gameId);

    if (players.size === 2) {
      io.to(game.gameId).emit("startGame");
    } else {
      io.to(game.gameId).emit("waiting");
    }

    sock.on("message", (text) => {
      io.to(game.gameId).emit("message", text);
    });

    // console.log(game);
  });
});

io.on("disconnect", (sock) => {
  // console.log("someone disconnected");
});

server.on("error", (err) => {
  console.error(err);
});

server.listen(port, () => {
  // console.log("server is ready");
});
