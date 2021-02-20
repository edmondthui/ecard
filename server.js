const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const faker = require("faker");

const app = express();

app.use(express.static(`${__dirname}/client`));

const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 8080;

let games = {};

io.on("connection", (sock) => {
  // console.log("connected");
  sock.emit("message", { text: "You are connected" });

  sock.on("joinGame", (game) => {
    sock.join(game.roomId);

    let players = io.sockets.adapter.rooms.get(game.roomId);

    if (players.size === 2) {
      games[game.roomId].push(game);
      games[game.roomId].sort(() => {
        return 0.5 - Math.random();
      });
      games[game.roomId][0].player = 1;
      games[game.roomId][1].player = 2;

      io.to(game.roomId).emit("startGame", games[game.roomId]);
      console.log(games);
    } else {
      games[game.roomId] = [game];
      io.to(game.roomId).emit("waiting", games[game.roomId]);
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
