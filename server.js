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
  sock.emit("message", { text: "You are connected" });

  sock.on("joinGame", (game) => {
    while (
      Array.isArray(games[game.roomId]) &&
      games[game.roomId].length >= 2
    ) {
      game.roomId = (parseInt(game.roomId) + 1).toString();
    }

    sock.join(game.roomId);
    game.socketId = sock.id;

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
    } else if (players.size < 2) {
      games[game.roomId] = [game];
      io.to(game.roomId).emit("waiting", games[game.roomId][0]);
    }

    sock.on("message", (text) => {
      io.to(game.roomId).emit("message", text);
    });
  });

  sock.on("disconnect", () => {
    Object.values(games).forEach((room) => {
      let roomId = room.roomId;
      room.forEach((player) => {
        if (player.socketId === sock.id) {
          io.to(player.roomId).emit("message", {
            text: "Your partner has left!",
          });
          room.splice(room.indexOf(player), 1);
          // somehow boot the player in the room
        }
      });
      if (room.length == 0) {
        delete games[roomId];
      }
    });
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
