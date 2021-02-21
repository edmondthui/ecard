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
    } else if (players.size < 2) {
      games[game.roomId] = [game];
      io.to(game.roomId).emit("waitingJoin", games[game.roomId][0]);
    }

    sock.on("message", (text) => {
      io.to(game.roomId).emit("message", text);
    });

    sock.on("play", (cardData) => {
      let playerIndex = games[game.roomId].findIndex(
        (game) => game.username === cardData.username
      );
      let opponentIndex = 1 - playerIndex;
      console.log(cardData);
      games[game.roomId][playerIndex].card = cardData.card;
      games[game.roomId][playerIndex].round = cardData.round;

      //switches players after 3 rounds
      if (games[game.roomId][playerIndex].round % 3 === 0) {
        games[game.roomId][playerIndex].player === 1
          ? (games[game.roomId][playerIndex].player = 2)
          : (games[game.roomId][playerIndex].player = 1);
      }
      console.log(games);
      if (games[game.roomId][0].card && games[game.roomId][1].card) {
        if (
          games[game.roomId][playerIndex].card === "citizen" &&
          games[game.roomId][opponentIndex].card === "citizen"
        ) {
          games[game.roomId][playerIndex].result = "draw";
          games[game.roomId][opponentIndex].result = "draw";
        } else if (
          games[game.roomId][playerIndex].card === "citizen" &&
          games[game.roomId][opponentIndex].card === "emperor"
        ) {
          games[game.roomId][playerIndex].result = "lose";
          games[game.roomId][opponentIndex].result = "win";
        } else if (
          games[game.roomId][playerIndex].card === "emperor" &&
          games[game.roomId][opponentIndex].card === "citizen"
        ) {
          games[game.roomId][playerIndex].result = "win";
          games[game.roomId][opponentIndex].result = "lose";
        } else if (
          games[game.roomId][playerIndex].card === "slave" &&
          games[game.roomId][opponentIndex].card === "emperor"
        ) {
          games[game.roomId][playerIndex].result = "bigwin";
          games[game.roomId][opponentIndex].result = "bigloss";
        } else if (
          games[game.roomId][playerIndex].card === "emperor" &&
          games[game.roomId][opponentIndex].card === "slave"
        ) {
          games[game.roomId][playerIndex].result = "bigloss";
          games[game.roomId][opponentIndex].result = "bigwin";
        } else if (
          games[game.roomId][playerIndex].card === "slave" &&
          games[game.roomId][opponentIndex].card === "citizen"
        ) {
          games[game.roomId][playerIndex].result = "lose";
          games[game.roomId][opponentIndex].result = "win";
        } else if (
          games[game.roomId][playerIndex].card === "citizen" &&
          games[game.roomId][opponentIndex].card === "slave"
        ) {
          games[game.roomId][playerIndex].result = "win";
          games[game.roomId][opponentIndex].result = "lose";
        }
        // the result will be who wins and the current score which will be added to the player data
        io.to(game.roomId).emit("result", games[game.roomId]);
        games[game.roomId].forEach((player) => {
          player.card = "";
          player.result = "";
        });
        if (games[game.roomId][playerIndex].round % 12 === 0) {
          io.to(game.roomId).emit("gameOver", games[game.roomId]);
        }
      } else {
        io.to(game.roomId).emit("waitingPlay");
      }
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
