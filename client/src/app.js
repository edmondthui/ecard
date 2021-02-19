let playerData = {
  username: "",
  roomId: "",
};

const message = (text) => {
  const parent = document.querySelector(".chat-messages");
  const el = document.createElement("li");
  el.innerHTML = text.text;
  text.username === playerData.username
    ? el.setAttribute("class", "message outgoing")
    : el.setAttribute("class", "message incoming");
  parent.appendChild(el);
  parent.scrollTop = parent.scrollHeight;
};

const submitChat = (sock) => (e) => {
  e.preventDefault();
  let input = document.querySelector("#chat");
  let message = {
    username: playerData.username,
    text: input.value,
  };
  input.value = "";
  if (message.text.length > 0) {
    sock.emit("message", message);
  }
};

// const hostGame = (sock) => (e) => {
//   e.preventDefault();
//   let playerData = {
//     username: document.querySelector(".username").value,
//   };
//   let gameId = (Math.random() * 1000000) | 0;
//   sock.emit("newGame", { gameId: gameId, username: playerData.username });
//   // sock.join(gameId.toString());
//   let joinGame = document.querySelector(".join-game");
//   joinGame.parentNode.removeChild(joinGame);
// };

const joinGame = (sock) => (e) => {
  e.preventDefault();
  playerData.username = document.querySelector(".username").value;
  playerData.roomId = document.querySelector(".room").value;
  sock.emit("joinGame", {
    gameId: playerData.roomId,
    username: playerData.username,
  });
  let joinGame = document.querySelector(".join-game");
  joinGame.parentNode.removeChild(joinGame);
};

const waiting = () => {
  let div = document.createElement("div");
  document.body.appendChild(div);
  div.classList.add("loading");

  let h1 = document.createElement("h1");
  h1.innerHTML = `Waiting on player 2 to join room ${playerData.roomId}`;

  let img = document.createElement("img");
  img.setAttribute("src", "assets/drinking.gif");

  div.appendChild(h1);
  div.appendChild(img);
};

const startGame = () => {
  let loading = document.querySelector(".loading");
  if (loading) {
    loading.setAttribute("style", "display: none");
  }
  let game = document.querySelector(".game");
  game.setAttribute("style", "display: flex");
  let chat = document.querySelector(".chat-wrapper");
  chat.setAttribute("style", "display: flex");
  let name = document.querySelector(".name");
  name.innerHTML = playerData.username;

  let music = document.querySelector(".music");
  music.volume = 0.005;
  music.play();

  // setupBoard();
};

const setupBoard = () => {};

document.addEventListener("DOMContentLoaded", () => {
  // make a function that adds cards to each players hand based on whether you are emperor or slave and whether you are opponent.
  // do not have the cards hard coded on the HTML and use javascript to add

  const cards = document.querySelectorAll(".card");
  const opponent = document.querySelector(".opponent");
  const playButton = document.querySelector(".play");
  let selected;

  playButton.addEventListener("click", play);

  cards.forEach((card) => {
    if (!card.parentElement.classList.contains("opponent")) {
      card.addEventListener("click", selectCard);
    }
  });

  function selectCard(e) {
    selected = e.currentTarget;
    let selectedElements = document.querySelectorAll(".selected");
    if (selectedElements.length < 1) {
      e.currentTarget.classList.add("selected");
    } else {
      selectedElements[0].classList.remove("selected");
      e.currentTarget.classList.add("selected");
    }
  }

  function play(e) {
    e.preventDefault();
    cards.forEach((card) => {
      if (card.classList.contains("selected")) {
        card.classList.remove("selected");
        let audio = new Audio("assets/zawazawa.wav");
        audio.play();
      }
    });
  }
});

(() => {
  const sock = io();

  document
    .querySelector(".chat-form")
    .addEventListener("submit", submitChat(sock));

  sock.on("message", (text) => {
    message(text);
  });

  sock.on("waiting", () => {
    waiting();
  });

  sock.on("startGame", () => {
    startGame();
  });

  // document.querySelector(".create").addEventListener("click", hostGame(sock));
  document.querySelector(".join").addEventListener("click", joinGame(sock));
})();
