username = "";
roomId = 0;

const message = (text) => {
  const parent = document.querySelector(".chat-messages");
  const el = document.createElement("li");
  el.innerHTML = text.text;
  text.username === username
    ? el.setAttribute("class", "message outgoing")
    : el.setAttribute("class", "message incoming");
  parent.appendChild(el);
  parent.scrollTop = parent.scrollHeight;
};

const submitChat = (sock) => (e) => {
  username = "Edmond";
  e.preventDefault();
  let input = document.querySelector("#chat");
  let message = {
    username: username,
    text: input.value,
  };
  input.value = "";
  if (message.text.length > 0) {
    sock.emit("message", message);
  }
};

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
})();
