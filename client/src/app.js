const sock = io();

let playerData = {
  username: "",
  roomId: "",
  player: 0,
  card: "",
  score: 0,
  oScore: 0,
  result: "",
  round: 1,
};

const message = (text) => {
  console.log(text);
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
  if (playerData.username == "") {
    playerData.username = faker.name.firstName();
  }
  sock.emit("joinGame", playerData);
  let joinGame = document.querySelector(".join-game");
  joinGame.parentNode.removeChild(joinGame);
};

const waiting = (game) => {
  playerData.player = 1;
  let div = document.createElement("div");
  document.body.appendChild(div);
  div.classList.add("loading");

  let h1 = document.createElement("h1");

  h1.innerHTML = `Waiting on player 2 to join room ${game.roomId}`;

  let img = document.createElement("img");
  img.setAttribute("src", "assets/drinking.gif");

  div.appendChild(img);
  div.appendChild(h1);

  for (let i = 0; i < 3; i++) {
    let span = document.createElement("span");
    span.innerHTML = ".";
    h1.appendChild(span);
  }
};

const startGame = (setup) => {
  let loading = document.querySelector(".loading");
  if (loading) {
    loading.setAttribute("style", "display: none");
  }
  let game = document.querySelector(".game");
  game.setAttribute("style", "display: flex");
  let chat = document.querySelector(".chat-wrapper");
  chat.setAttribute("style", "display: flex");
  let info = document.querySelector(".game-info");
  info.setAttribute("style", "display: flex");
  let name = document.querySelector(".name");
  name.innerHTML = playerData.username;
  let right = document.querySelector(".right-bar");
  right.style.width = "20%";

  let music = document.querySelector(".music");
  music.volume = 0.01;
  music.play();

  setupBoard(setup);
};

const setupBoard = (setup) => {
  let player = setup.find((player) => player.username === playerData.username);

  let opponentContainer = document.querySelector(".opponent");
  if (opponentContainer.children.length !== 0) {
    while (opponentContainer.firstChild) {
      opponentContainer.removeChild(opponentContainer.lastChild);
    }
  }

  //sets score HTML INNER TEXT
  let playerScore = document.querySelector(".playerScore");
  let opponentScore = document.querySelector(".opponentScore");
  playerScore.innerHTML = playerData.score;
  opponentScore.innerHTML = playerData.oScore;

  for (let i = 0; i < 5; i++) {
    let flipped = document.createElement("div");
    flipped.classList.add("card");
    let back = document.createElement("img");
    back.setAttribute("src", "assets/back.jpg");
    flipped.appendChild(back);
    opponentContainer.appendChild(flipped);
  }

  let playerContainer = document.querySelector(".player");
  if (playerContainer.children.length !== 0) {
    playerData.round += 1;
    while (playerContainer.firstChild) {
      playerContainer.removeChild(playerContainer.lastChild);
    }
  }
  if (player.player === 1) {
    let emperor = document.createElement("div");
    emperor.classList.add("emperor", "card");
    let face = document.createElement("img");
    face.setAttribute("src", "assets/emperor.jpg");
    emperor.appendChild(face);
    playerContainer.appendChild(emperor);
    for (let i = 0; i < 4; i++) {
      let citizen = document.createElement("div");
      citizen.classList.add("citizen", "card");
      let face = document.createElement("img");
      face.setAttribute("src", "assets/citizen.jpg");
      citizen.appendChild(face);
      playerContainer.appendChild(citizen);
    }
  } else if (player.player === 2) {
    let slave = document.createElement("div");
    slave.classList.add("slave", "card");
    let face = document.createElement("img");
    face.setAttribute("src", "assets/slave.jpg");
    slave.appendChild(face);
    playerContainer.appendChild(slave);
    for (let i = 0; i < 4; i++) {
      let citizen = document.createElement("div");
      citizen.classList.add("citizen", "card");
      let face = document.createElement("img");
      face.setAttribute("src", "assets/citizen.jpg");
      citizen.appendChild(face);
      playerContainer.appendChild(citizen);
    }
  }

  const playButton = document.querySelector(".play");
  playButton.addEventListener("click", play);
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    if (!card.parentElement.classList.contains("opponent")) {
      card.addEventListener("click", selectCard);
    }
  });
};

const selectCard = (e) => {
  selected = e.currentTarget;
  let selectedElements = document.querySelectorAll(".selected");
  if (selectedElements.length < 1) {
    e.currentTarget.classList.add("selected");
  } else {
    selectedElements[0].classList.remove("selected");
    e.currentTarget.classList.add("selected");
  }
};

const play = (e) => {
  e.preventDefault();
  const cards = document.querySelectorAll(".card");
  const container = document.querySelector(".player");
  const playerContainer = document.querySelector(".playerPlayedCard");
  cards.forEach((card) => {
    if (card.classList.contains("selected")) {
      card.classList.remove("selected");
      let audio = new Audio("assets/zawazawa.wav");

      audio.play();
      playerData.card = card.classList[0];
      sock.emit("play", playerData);
      container.removeChild(card);
      playerContainer.appendChild(card);
    }
  });
};

const delayRemovePlayed = () => {
  let playerPlayed = document.querySelector(".playerPlayedCard");
  let opponentPlayed = document.querySelector(".opponentPlayedCard");
  setTimeout(() => {
    playerPlayed.removeChild(playerPlayed.firstChild);
    opponentPlayed.removeChild(opponentPlayed.firstChild);
  }, 2000);
};

(() => {
  document
    .querySelector(".chat-form")
    .addEventListener("submit", submitChat(sock));

  sock.on("message", (text) => {
    message(text);
  });

  sock.on("waitingJoin", (game) => {
    waiting(game);
  });

  sock.on("startGame", (game) => {
    startGame(game);
  });

  sock.on("result", (data) => {
    let playerIndex = data.findIndex(
      (player) => player.username === playerData.username
    );
    console.log(playerIndex);
    let opponentPlayed = document.querySelector(".opponentPlayedCard");
    if (data[playerIndex].result === "win") {
      playerData.score += 1;
      if (data[playerIndex].card === "citizen") {
        let slave = document.createElement("div");
        slave.classList.add("slave", "card");
        let face = document.createElement("img");
        face.setAttribute("src", "assets/slave.jpg");
        slave.appendChild(face);
        opponentPlayed.appendChild(slave);
      } else {
        let citizen = document.createElement("div");
        citizen.classList.add("citizen", "card");
        let face = document.createElement("img");
        face.setAttribute("src", "assets/citizen.jpg");
        citizen.appendChild(face);
        opponentPlayed.appendChild(citizen);
      }
    } else if (data[playerIndex].result === "bigwin") {
      playerData.score += 3;
      let emperor = document.createElement("div");
      emperor.classList.add("emperor", "card");
      let face = document.createElement("img");
      face.setAttribute("src", "assets/emperor.jpg");
      emperor.appendChild(face);
      opponentPlayed.appendChild(emperor);
    } else if (data[playerIndex].result === "lose") {
      playerData.oScore += 1;
      if (data[playerIndex].card === "slave") {
        let citizen = document.createElement("div");
        citizen.classList.add("citizen", "card");
        let face = document.createElement("img");
        face.setAttribute("src", "assets/citizen.jpg");
        citizen.appendChild(face);
        opponentPlayed.appendChild(citizen);
      } else {
        let emperor = document.createElement("div");
        emperor.classList.add("emperor", "card");
        let face = document.createElement("img");
        face.setAttribute("src", "assets/emperor.jpg");
        emperor.appendChild(face);
        opponentPlayed.appendChild(emperor);
      }
    } else if (data[playerIndex].result === "bigloss") {
      playerData.oScore += 3;
      let slave = document.createElement("div");
      slave.classList.add("slave", "card");
      let face = document.createElement("img");
      face.setAttribute("src", "assets/slave.jpg");
      slave.appendChild(face);
      opponentPlayed.appendChild(slave);
    } else if (data[playerIndex].result === "draw") {
      let citizen = document.createElement("div");
      citizen.classList.add("citizen", "card");
      let face = document.createElement("img");
      face.setAttribute("src", "assets/citizen.jpg");
      citizen.appendChild(face);
      opponentPlayed.appendChild(citizen);
    }
    delayRemovePlayed();
    playerData.card = "";
    const playCardButton = document.querySelector(".play");
    playCardButton.disabled = false;
    playCardButton.innerHTML = "Play Card";
    let opponentContainer = document.querySelector(".opponent");
    opponentContainer.removeChild(opponentContainer.lastChild);
    let music = document.querySelector(".music");
    console.log(data);

    if (
      data[playerIndex].result === "win" ||
      data[playerIndex].result === "lose" ||
      data[playerIndex].result === "bigwin" ||
      data[playerIndex].result === "bigloss"
    ) {
      music.volume = 0.01;
      setupBoard(data);
    } else {
      music.volume = music.volume * 2;
    }
  });

  sock.on("waitingPlay", () => {
    if (playerData.card !== "") {
      const playCardButton = document.querySelector(".play");
      playCardButton.disabled = true;
      playCardButton.innerHTML = "Waiting for other player...";
    }
  });

  // document.querySelector(".create").addEventListener("click", hostGame(sock));
  document.querySelector(".join").addEventListener("click", joinGame(sock));

  const audioButton = document.querySelector(".audio");
  audioButton.addEventListener("click", () => {
    const music = document.querySelector(".music");
    if (music.paused) {
      music.play();
      audioButton.classList.remove("fa-volume-off");
      audioButton.classList.add("fa-volume-up");
    } else {
      music.pause();
      audioButton.classList.remove("fa-volume-up");
      audioButton.classList.add("fa-volume-off");
    }
  });
})();

// document.addEventListener("DOMContentLoaded", () => {
//   // make a function that adds cards to each players hand based on whether you are emperor or slave and whether you are opponent.
//   // do not have the cards hard coded on the HTML and use javascript to add

//   const cards = document.querySelectorAll(".card");
//   const opponent = document.querySelector(".opponent");
//   const playButton = document.querySelector(".play");
//   let selected;

//   playButton.addEventListener("click", play);

//   cards.forEach((card) => {
//     if (!card.parentElement.classList.contains("opponent")) {
//       card.addEventListener("click", selectCard);
//     }
//   });

//   function selectCard(e) {
//     selected = e.currentTarget;
//     let selectedElements = document.querySelectorAll(".selected");
//     if (selectedElements.length < 1) {
//       e.currentTarget.classList.add("selected");
//     } else {
//       selectedElements[0].classList.remove("selected");
//       e.currentTarget.classList.add("selected");
//     }
//   }

//   function play(e) {
//     e.preventDefault();
//     cards.forEach((card) => {
//       if (card.classList.contains("selected")) {
//         card.classList.remove("selected");
//         let audio = new Audio("assets/zawazawa.wav");
//         audio.play();
//       }
//     });
//   }
// });
