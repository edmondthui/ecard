document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll('.card');
  const opponent = document.querySelector('.opponent');
  let selected;


  cards.forEach(card => {
    if (!card.parentElement.classList.contains('opponent')) {
      card.addEventListener('click', selectCard)
    }
  });

  function selectCard(e) {
    selected = e.currentTarget;
    let selectedElements = document.querySelectorAll('.selected')
    if (selectedElements.length < 1) {
      e.currentTarget.classList.add('selected');
    } else {
      selectedElements[0].classList.remove('selected');
      e.currentTarget.classList.add('selected');
    }
  }
})
