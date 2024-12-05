const gameBoard = document.getElementById("game-board");
const startButton = document.getElementById("start-button");
const recordsButton = document.getElementById("records-button");
const message = document.getElementById("message");
const title = document.getElementById("title");
const theme = document.getElementById("theme");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");
const playerNameInput = document.getElementById("player-name");

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let clickCount = 0;
let countdown;
let timeLeft;
let totalTime;
let playerName = "";

const imageExtensions = {
  1: "png",
  2: "png",
  3: "png",
  4: "png",
  5: "webp",
  6: "webp",
  7: "webp",
  8: "png",
  9: "webp",
  10: "png",
};

const modal = document.getElementById("modal");
const modalContent = document.querySelector(".modal-content");
let easyBtn, mediumBtn, hardBtn;

// Mostrar o modal ao clicar no botão iniciar
startButton.onclick = function () {
  showDifficultyModal();
};

// Mostrar o modal de recordes ao clicar no botão de recordes
recordsButton.onclick = function () {
  showRecords();
};

// Fechar o modal ao clicar fora dele
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function showDifficultyModal() {
  modalContent.innerHTML = `
    <span class="close">&times;</span>
    <span class="modal-title">Escolha suas preferências</span>
    <label for="player-name">Nome:</label>
    <input type="text" id="player-name" name="player-name" required />
    <span class="difficulty-title">Selecione a dificuldade</span>
    <button id="easy" class="difficulty-btn">Fácil</button>
    <button id="medium" class="difficulty-btn">Média</button>
    <button id="hard" class="difficulty-btn">Difícil</button>
  `;
  modal.style.display = "block";

  document.querySelector(".close").onclick = function () {
    modal.style.display = "none";
  };

  easyBtn = document.getElementById("easy");
  mediumBtn = document.getElementById("medium");
  hardBtn = document.getElementById("hard");

  easyBtn.onclick = function () {
    setDifficulty(90);
  };

  mediumBtn.onclick = function () {
    setDifficulty(70);
  };

  hardBtn.onclick = function () {
    setDifficulty(45);
  };
}

function setDifficulty(time) {
  const playerNameInput = document.getElementById("player-name");
  if (playerNameInput.value.trim() === "") {
    alert("Por favor, digite seu nome.");
    return;
  }
  playerName = playerNameInput.value.trim();
  totalTime = time;
  timeLeft = time;
  modal.style.display = "none";
  startGame();
  startCountdown();
}
function startCountdown() {
  clearInterval(countdown);
  countdown = setInterval(() => {
    timeLeft--;
    updateProgressBar();
    if (timeLeft <= 0) {
      clearInterval(countdown);
      disableAllCards();
      const messageText = "Você Perdeu!";
      showModal(messageText);
    }
  }, 1000);
}

function updateProgressBar() {
  const percentage = (timeLeft / totalTime) * 100;
  progressBar.style.transform = `scaleY(${percentage / 100})`;
}

function createBoard() {
  gameBoard.innerHTML = "";
  cards = [];
  flippedCards = [];
  matchedPairs = 0;
  clickCount = 0;

  // Criar 10 pares (20 cartas) com 10 imagens únicas
  for (let i = 1; i <= 10; i++) {
    for (let j = 0; j < 2; j++) {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.value = i;
      const imgExtension = imageExtensions[i];
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <img src="imagens/${i}.${imgExtension}" alt="Card Image" class="pair">
          </div>
          <div class="card-back"></div>
        </div>
      `;
      card.addEventListener("click", flipCard);
      cards.push(card);
    }
  }

  // Embaralhar as cartas
  cards.sort(() => 0.5 - Math.random());

  // Adicionar as cartas ao tabuleiro
  cards.forEach((card) => gameBoard.appendChild(card));
}

function flipCard() {
  if (
    flippedCards.length < 2 &&
    !this.classList.contains("flipped") &&
    message.style.display === "none"
  ) {
    this.classList.add("flipped");
    flippedCards.push(this);
    clickCount++; // Incrementa a contagem de cliques

    if (flippedCards.length === 2) {
      checkForMatch();
    }
  }
}

function checkForMatch() {
  const [card1, card2] = flippedCards;
  if (card1.dataset.value === card2.dataset.value) {
    matchedPairs++;
    flippedCards = [];
    if (matchedPairs === cards.length / 2) {
      clearInterval(countdown);
      const timeTaken = elapsedTime();
      disableAllCards();
      const isRecord = saveRecord(playerName, timeTaken);
      const recordMessage = isRecord ? "<br><strong>Novo Record!</strong>" : "";
      const messageText = `Parabéns! Você encontrou todos os pares!<br>Tempo: ${timeTaken} segundos<br>Cliques: ${clickCount}${recordMessage}`;
      showModal(messageText);
    }
  } else {
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];
    }, 1000);
  }
}

function disableAllCards() {
  const allCards = document.querySelectorAll(".card");
  allCards.forEach((card) => {
    card.removeEventListener("click", flipCard);
  });
}

function showModal(messageText) {
  modalContent.innerHTML = `
    <p>${messageText}</p>
    <button id="home-button-modal" class="action-btn">Início</button>
    <button id="restart-button-modal" class="action-btn">Reiniciar</button>
    <button id="exit-button-modal" class="action-btn">Sair</button>
  `;
  modal.style.display = "block";

  document.getElementById("home-button-modal").onclick = function () {
    location.reload(); // Recarrega a página e volta para a inicial
  };

  document.getElementById("restart-button-modal").onclick = function () {
    modal.style.display = "none";
    resetGame(); // Reinicia o jogo incluindo a barra de tempo
  };

  document.getElementById("exit-button-modal").onclick = function () {
    window.close(); // Fecha a janela do navegador
  };
}

function resetGame() {
  clearInterval(countdown);
  timeLeft = totalTime;
  updateProgressBar();
  createBoard();
  startCountdown();
  message.textContent = "";
  message.style.display = "none";
  startTime = new Date();
}

let startTime, endTime;
function startGame() {
  createBoard();
  message.textContent = "";
  message.style.display = "none"; // Esconde a mensagem ao iniciar o jogo
  startTime = new Date();
  // Ocultar o botão iniciar e os títulos
  startButton.classList.add("hidden");
  recordsButton.classList.add("hidden");
  title.classList.add("hidden");
  theme.classList.add("hidden");
  progressContainer.style.display = "block"; // Mostrar a barra de progresso ao iniciar o jogo
}

function elapsedTime() {
  endTime = new Date();
  return ((endTime - startTime) / 1000).toFixed(2);
}

function saveRecord(playerName, timeTaken) {
  const records = JSON.parse(localStorage.getItem("gameRecords")) || [];
  records.push({ playerName, time: parseFloat(timeTaken) });
  records.sort((a, b) => a.time - b.time);
  localStorage.setItem("gameRecords", JSON.stringify(records.slice(0, 3)));
  return records.some(
    (record) =>
      record.playerName === playerName && record.time === parseFloat(timeTaken)
  );
}
function showRecords() {
  const records = JSON.parse(localStorage.getItem("gameRecords")) || [];
  const recordsText = records
    .map(
      (record, index) =>
        `${index + 1}. ${record.playerName} - ${record.time} segundos`
    )
    .join("<br>");
  modalContent.innerHTML = `
    <h2>Recordes</h2>
    <p>${recordsText}</p>
    <button id="close-records-button" class="action-btn">Fechar</button>
  `;
  modal.style.display = "block";

  document.getElementById("close-records-button").onclick = function () {
    modal.style.display = "none";
  };
}
