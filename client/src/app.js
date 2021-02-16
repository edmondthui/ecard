const log = (text) => {

};

const chatSubmitted = (sock) => (e) => {
  e.preventDefault();
  let input = document.querySelector('#chat');
  let text = input.value;
  input.value = '';
  sock.emit('message', text);
}


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

  // const onClick = (e) => {
  //   const { x, y } = getClickCoordinates(canvas, e);
  //   sock.emit('turn', getCellCoordinates(x, y));
  // };

  // sock.on('message', log);
  // document
  //   .querySelector('#chat-form')
  //   .addEventListener('submit', onChatSubmitted(sock));

  // canvas.addEventListener('click', onClick);

  document.querySelector("#chat-form").addEventListener("submit", submitChat);

  sock.on('message', (text) => {
    message(text);
  })

})();