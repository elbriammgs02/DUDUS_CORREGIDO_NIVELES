/* =========================================================
   DUDUS - SCRIPT PRINCIPAL
   HTML ACTUAL:
   1. Parejas
   2. Torre
   3. Sapito
   4. Regalo
   ========================================================= */

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const PASSWORD_REGALO = "050125";
const PASSWORD_ADMIN = "brian";

let currentLevel = 1;
let gamesCompleted = 0;

/* =========================================================
   PROGRESO
   ========================================================= */

function updateProgress(step) {
  $$(".progress-node").forEach((node, i) => {
    node.classList.remove("active");

    if (i + 1 < step) {
      node.classList.add("done");
    }

    if (i + 1 === step) {
      node.classList.add("active");
    }
  });
}

function showLevel(number) {
  $$(".level").forEach((level) => {
    level.classList.remove("active");
  });

  const target = $("#level-" + number);

  if (target) {
    target.classList.add("active");
  }

  currentLevel = number;
  updateProgress(number);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function completeLevel(number) {
  gamesCompleted = Math.max(gamesCompleted, number);

  const dialog = $("#level-dialog");
  const title = $("#level-dialog-title");
  const text = $("#level-dialog-text");
  const next = $("#level-next");

  if (number === 1) {
    title.textContent = "¡Encontraste las 9 parejas! ♡";
    text.textContent =
      "Primera prueba superada. Ahora toca construir algo dulce.";
  }

  if (number === 2) {
    title.textContent = "¡17 pisos! 🍰";
    text.textContent =
      "La torre sobrevivió. Solo queda ayudar al sapito a llegar hasta el final.";
  }

  if (number === 3) {
    title.textContent = "¡El sapito llegó! 🐸♡";
    text.textContent =
      "Completaste las tres pruebas. Tu regalo ya está disponible.";
  }

  next.onclick = () => {
    dialog.close();

    if (number < 3) {
      showLevel(number + 1);
    } else {
      gamesCompleted = 3;
      updateProgress(4);
      showGift();
    }
  };

  dialog.showModal();
}

/* =========================================================
   NIVEL 1 - MEMORIA
   ========================================================= */

const memoryImages = [
  "REGALO/images/memory/01_fresa.png",
  "REGALO/images/memory/02_flor.png",
  "REGALO/images/memory/03_sapo.png",
  "REGALO/images/memory/04_torta.png",
  "REGALO/images/memory/05_carta.png",
  "REGALO/images/memory/06_corazon.png",
  "REGALO/images/memory/07_estrella.png",
  "REGALO/images/memory/08_regalo.png",
  "REGALO/images/memory/09_luna.png"
];

let firstCard = null;
let secondCard = null;
let memoryLocked = false;
let memoryMatches = 0;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

function startMemory() {
  const board = $("#memory-board");

  memoryMatches = 0;
  firstCard = null;
  secondCard = null;
  memoryLocked = false;

  $("#memory-score").textContent = "0";

  board.innerHTML = "";

  const cards = shuffleArray([
    ...memoryImages,
    ...memoryImages
  ]);

  cards.forEach((src) => {
    const card = document.createElement("button");

    card.className = "memory-card";
    card.dataset.value = src;

    card.innerHTML = `
      <span class="memory-back">♥</span>
      <span class="memory-front">
        <img src="${src}" alt="">
      </span>
    `;

    card.addEventListener("click", () => {
      flipMemoryCard(card);
    });

    board.appendChild(card);
  });

  $("#memory-start").textContent = "Reiniciar";
}

function flipMemoryCard(card) {
  if (memoryLocked) return;
  if (card.classList.contains("matched")) return;
  if (card === firstCard) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  memoryLocked = true;

  if (firstCard.dataset.value === secondCard.dataset.value) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    memoryMatches++;

    $("#memory-score").textContent = memoryMatches;

    firstCard = null;
    secondCard = null;
    memoryLocked = false;

    if (memoryMatches === 9) {
      setTimeout(() => {
        completeLevel(1);
      }, 650);
    }

    return;
  }

  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");

    firstCard = null;
    secondCard = null;
    memoryLocked = false;
  }, 850);
}

/* =========================================================
   NIVEL 2 - TORRE
   ========================================================= */

const stackCanvas = $("#stack-canvas");
const stackCtx = stackCanvas
  ? stackCanvas.getContext("2d")
  : null;

let stackRunning = false;
let stackAnimation = null;

let stackPieces = [];
let stackCurrent = null;

let stackDirection = 1;
let stackSpeed = 4;

let stackScore = 0;

const STACK_TARGET = 17;

function resetStack() {
  if (!stackCtx) return;

  cancelAnimationFrame(stackAnimation);

  stackRunning = false;
  stackScore = 0;

  $("#stack-score").textContent = "0";

  stackPieces = [];

  const baseWidth = 300;
  const baseHeight = 22;

  stackPieces.push({
    x: stackCanvas.width / 2 - baseWidth / 2,
    y: stackCanvas.height - 45,
    width: baseWidth,
    height: baseHeight
  });

  stackCurrent = null;

  drawStack();

  $("#stack-start").textContent = "Empezar nivel";
}

function startStack() {
  if (!stackCtx) return;

  resetStack();

  stackRunning = true;

  $("#stack-start").textContent =
    "Haz clic o toca para apilar";

  createNextStackPiece();

  stackLoop();
}

function createNextStackPiece() {
  const previous =
    stackPieces[stackPieces.length - 1];

  stackDirection =
    stackPieces.length % 2 === 0 ? -1 : 1;

  stackCurrent = {
    x: stackDirection === 1
      ? 0
      : stackCanvas.width - previous.width,

    y: previous.y - 25,

    width: previous.width,

    height: 22
  };
}

function placeStackPiece() {
  if (!stackRunning || !stackCurrent) return;

  const previous =
    stackPieces[stackPieces.length - 1];

  const left =
    Math.max(stackCurrent.x, previous.x);

  const right =
    Math.min(
      stackCurrent.x + stackCurrent.width,
      previous.x + previous.width
    );

  const overlap = right - left;

  /*
    Solo se pierde cuando literalmente
    ya no queda superficie donde apoyar.
  */

  if (overlap <= 2) {
    stackRunning = false;

    $("#stack-start").textContent =
      "Se cayó — volver a empezar";

    setTimeout(() => {
      startStack();
    }, 700);

    return;
  }

  /*
    El pedazo que sobresale se elimina.
    La torre continúa con el ancho restante.
  */

  stackCurrent.x = left;
  stackCurrent.width = overlap;

  stackPieces.push({
    ...stackCurrent
  });

  stackScore++;

  $("#stack-score").textContent =
    stackScore;

  if (stackScore >= STACK_TARGET) {
    stackRunning = false;

    cancelAnimationFrame(stackAnimation);

    drawStack();

    setTimeout(() => {
      completeLevel(2);
    }, 500);

    return;
  }

  /*
    La torre sube visualmente para que
    siempre haya espacio.
  */

  if (stackCurrent.y < 110) {
    stackPieces.forEach((piece) => {
      piece.y += 25;
    });
  }

  stackSpeed =
    Math.min(7, 4 + stackScore * 0.12);

  createNextStackPiece();
}

function drawStackBackground() {
  const gradient =
    stackCtx.createLinearGradient(
      0,
      0,
      0,
      stackCanvas.height
    );

  gradient.addColorStop(0, "#351628");
  gradient.addColorStop(1, "#140b12");

  stackCtx.fillStyle = gradient;

  stackCtx.fillRect(
    0,
    0,
    stackCanvas.width,
    stackCanvas.height
  );

  for (let i = 0; i < 18; i++) {
    stackCtx.fillStyle =
      "rgba(255,190,215,.08)";

    stackCtx.beginPath();

    stackCtx.arc(
      (i * 83) % stackCanvas.width,
      40 + ((i * 57) % 300),
      3 + (i % 4),
      0,
      Math.PI * 2
    );

    stackCtx.fill();
  }
}

function drawCakePiece(piece, index) {
  const radius = 8;

  const x = piece.x;
  const y = piece.y;
  const w = piece.width;
  const h = piece.height;

  const colors = [
    "#f8d4c1",
    "#f0a4b8",
    "#fff0da",
    "#dc779b",
    "#f4c56e"
  ];

  stackCtx.fillStyle =
    colors[index % colors.length];

  stackCtx.beginPath();

  stackCtx.roundRect(
    x,
    y,
    w,
    h,
    radius
  );

  stackCtx.fill();

  /*
    Crema
  */

  stackCtx.fillStyle =
    "rgba(255,255,255,.58)";

  stackCtx.fillRect(
    x + 4,
    y + 4,
    Math.max(0, w - 8),
    4
  );

  /*
    Detalles
  */

  if (w > 35) {
    stackCtx.fillStyle =
      "rgba(125,39,72,.35)";

    for (
      let px = x + 15;
      px < x + w - 8;
      px += 30
    ) {
      stackCtx.beginPath();

      stackCtx.arc(
        px,
        y + h - 6,
        3,
        0,
        Math.PI * 2
      );

      stackCtx.fill();
    }
  }
}

function drawStack() {
  if (!stackCtx) return;

  drawStackBackground();

  stackPieces.forEach((piece, index) => {
    drawCakePiece(piece, index);
  });

  if (stackCurrent) {
    drawCakePiece(
      stackCurrent,
      stackPieces.length
    );
  }
}

function stackLoop() {
  if (!stackRunning) return;

  stackCurrent.x +=
    stackSpeed * stackDirection;

  if (stackCurrent.x <= 0) {
    stackCurrent.x = 0;
    stackDirection = 1;
  }

  if (
    stackCurrent.x +
      stackCurrent.width >=
    stackCanvas.width
  ) {
    stackCurrent.x =
      stackCanvas.width -
      stackCurrent.width;

    stackDirection = -1;
  }

  drawStack();

  stackAnimation =
    requestAnimationFrame(stackLoop);
}

/* =========================================================
   NIVEL 3 - SAPITO VOLADOR
   ========================================================= */

const flappyCanvas = $("#flappy-canvas");
const flappyCtx = flappyCanvas
  ? flappyCanvas.getContext("2d")
  : null;

let flappyRunning = false;
let flappyAnimation = null;

let frog = null;
let pipes = [];
let flappyScore = 0;
let flappyFrame = 0;

const FLAPPY_TARGET = 5;

function resetFlappy() {
  if (!flappyCtx) return;

  cancelAnimationFrame(flappyAnimation);

  flappyRunning = false;
  flappyScore = 0;
  flappyFrame = 0;

  $("#flappy-score").textContent = "0";

  frog = {
    x: 150,
    y: flappyCanvas.height / 2,
    width: 44,
    height: 36,
    velocity: 0
  };

  pipes = [];

  drawFlappy();

  $("#flappy-start").textContent =
    "Presiona ESPACIO o toca aquí para empezar";
}

function startFlappy() {
  resetFlappy();

  flappyRunning = true;

  $("#flappy-start").textContent =
    "¡Vuela!";

  flap();

  flappyLoop();
}

function flap() {
  if (!flappyRunning) return;

  frog.velocity = -7.2;
}

function createPipe() {
  const gap = 145;

  const min = 70;

  const max =
    flappyCanvas.height -
    gap -
    70;

  const top =
    min +
    Math.random() *
      (max - min);

  pipes.push({
    x: flappyCanvas.width + 30,
    width: 65,
    top,
    gap,
    passed: false
  });
}

function drawFlappyBackground() {
  const gradient =
    flappyCtx.createLinearGradient(
      0,
      0,
      0,
      flappyCanvas.height
    );

  gradient.addColorStop(
    0,
    "#70425f"
  );

  gradient.addColorStop(
    1,
    "#26131f"
  );

  flappyCtx.fillStyle = gradient;

  flappyCtx.fillRect(
    0,
    0,
    flappyCanvas.width,
    flappyCanvas.height
  );

  flappyCtx.fillStyle =
    "rgba(255,255,255,.13)";

  for (let i = 0; i < 12; i++) {
    flappyCtx.beginPath();

    flappyCtx.arc(
      60 + i * 90,
      50 + (i % 4) * 40,
      2,
      0,
      Math.PI * 2
    );

    flappyCtx.fill();
  }
}

function drawFrog() {
  const x = frog.x;
  const y = frog.y;

  /*
    Alas
  */

  flappyCtx.fillStyle =
    "#f4e5ef";

  flappyCtx.beginPath();

  flappyCtx.ellipse(
    x - 7,
    y + 12,
    18,
    9,
    -0.5,
    0,
    Math.PI * 2
  );

  flappyCtx.fill();

  flappyCtx.beginPath();

  flappyCtx.ellipse(
    x + frog.width + 7,
    y + 12,
    18,
    9,
    0.5,
    0,
    Math.PI * 2
  );

  flappyCtx.fill();

  /*
    Sapito
  */

  flappyCtx.fillStyle =
    "#7fcf78";

  flappyCtx.beginPath();

  flappyCtx.roundRect(
    x,
    y,
    frog.width,
    frog.height,
    14
  );

  flappyCtx.fill();

  /*
    Ojos
  */

  flappyCtx.fillStyle = "#fff";

  flappyCtx.beginPath();

  flappyCtx.arc(
    x + 11,
    y + 4,
    8,
    0,
    Math.PI * 2
  );

  flappyCtx.arc(
    x + 33,
    y + 4,
    8,
    0,
    Math.PI * 2
  );

  flappyCtx.fill();

  flappyCtx.fillStyle = "#222";

  flappyCtx.beginPath();

  flappyCtx.arc(
    x + 12,
    y + 4,
    3,
    0,
    Math.PI * 2
  );

  flappyCtx.arc(
    x + 32,
    y + 4,
    3,
    0,
    Math.PI * 2
  );

  flappyCtx.fill();

  /*
    Boca
  */

  flappyCtx.strokeStyle =
    "#355536";

  flappyCtx.lineWidth = 2;

  flappyCtx.beginPath();

  flappyCtx.arc(
    x + 22,
    y + 17,
    10,
    0.2,
    Math.PI - 0.2
  );

  flappyCtx.stroke();
}

function drawPipe(pipe) {
  const gradient =
    flappyCtx.createLinearGradient(
      pipe.x,
      0,
      pipe.x + pipe.width,
      0
    );

  gradient.addColorStop(
    0,
    "#8b3459"
  );

  gradient.addColorStop(
    0.5,
    "#dc7098"
  );

  gradient.addColorStop(
    1,
    "#6c2746"
  );

  flappyCtx.fillStyle = gradient;

  flappyCtx.fillRect(
    pipe.x,
    0,
    pipe.width,
    pipe.top
  );

  flappyCtx.fillRect(
    pipe.x,
    pipe.top + pipe.gap,
    pipe.width,
    flappyCanvas.height -
      pipe.top -
      pipe.gap
  );

  flappyCtx.fillStyle =
    "#f2a1bc";

  flappyCtx.fillRect(
    pipe.x - 5,
    pipe.top - 15,
    pipe.width + 10,
    15
  );

  flappyCtx.fillRect(
    pipe.x - 5,
    pipe.top + pipe.gap,
    pipe.width + 10,
    15
  );
}

function drawFlappy() {
  if (!flappyCtx || !frog) return;

  drawFlappyBackground();

  pipes.forEach(drawPipe);

  drawFrog();
}

function frogHitsPipe(pipe) {
  const frogRight =
    frog.x + frog.width;

  const frogBottom =
    frog.y + frog.height;

  const pipeRight =
    pipe.x + pipe.width;

  const horizontal =
    frogRight > pipe.x &&
    frog.x < pipeRight;

  if (!horizontal) return false;

  if (
    frog.y < pipe.top ||
    frogBottom >
      pipe.top + pipe.gap
  ) {
    return true;
  }

  return false;
}

function failFlappy() {
  flappyRunning = false;

  cancelAnimationFrame(
    flappyAnimation
  );

  const dialog =
    $("#flappy-fail-dialog");

  if (dialog) {
    dialog.showModal();
  }
}

function flappyLoop() {
  if (!flappyRunning) return;

  flappyFrame++;

  frog.velocity += 0.42;
  frog.y += frog.velocity;

  if (flappyFrame % 105 === 0) {
    createPipe();
  }

  pipes.forEach((pipe) => {
    pipe.x -= 3.3;

    if (
      !pipe.passed &&
      pipe.x + pipe.width <
        frog.x
    ) {
      pipe.passed = true;

      flappyScore++;

      $("#flappy-score").textContent =
        flappyScore;

      if (
        flappyScore >=
        FLAPPY_TARGET
      ) {
        flappyRunning = false;

        cancelAnimationFrame(
          flappyAnimation
        );

        setTimeout(() => {
          completeLevel(3);
        }, 350);
      }
    }

    if (frogHitsPipe(pipe)) {
      failFlappy();
    }
  });

  pipes = pipes.filter(
    (pipe) =>
      pipe.x + pipe.width > -20
  );

  if (
    frog.y < 0 ||
    frog.y + frog.height >
      flappyCanvas.height
  ) {
    failFlappy();
  }

  drawFlappy();

  if (flappyRunning) {
    flappyAnimation =
      requestAnimationFrame(
        flappyLoop
      );
  }
}

/* =========================================================
   MÚSICA
   ========================================================= */

const songs = Array.from(
  { length: 10 },
  (_, i) => ({
    title:
      "Canción del mes " +
      (i + 1),

    artist:
      "Mes " +
      (i + 1) +
      " · Brian & Noelia",

    src:
      "REGALO/musica/mes" +
      (i + 1) +
      "/cancion1.mp3",

    icon:
      String(i + 1).padStart(
        2,
        "0"
      )
  })
);

const secretSong = {
  title: "Sorpresa",
  artist:
    "Canción desbloqueada ♡",
  src:
    "REGALO/musica/regalo/sorpresa.mp3",
  icon: "🎁",
  secret: true
};

let songIndex = 0;
let isPlaying = false;

const audio =
  $("#audio-element");

function giftUnlocked() {
  return (
    localStorage.getItem(
      "giftUnlocked"
    ) === "yes"
  );
}

function visibleSongs() {
  return giftUnlocked()
    ? [...songs, secretSong]
    : songs;
}

function loadSong(
  index,
  autoplay = false
) {
  const list = visibleSongs();

  if (!list.length) return;

  songIndex =
    (index + list.length) %
    list.length;

  const song =
    list[songIndex];

  $("#song-title").textContent =
    song.title;

  $("#artist-name").textContent =
    song.artist;

  $("#album-art").textContent =
    song.icon;

  audio.pause();

  audio.src = song.src;
  audio.load();

  $("#progress-bar").value = 0;

  $("#current-time").textContent =
    "0:00";

  $("#duration-time").textContent =
    "0:00";

  setPlayState(false);

  renderSongList();

  if (autoplay) {
    playCurrent();
  }
}

function playCurrent() {
  audio
    .play()
    .then(() => {
      setPlayState(true);
    })
    .catch((error) => {
      console.error(
        "Error reproduciendo audio:",
        error
      );

      setPlayState(false);
    });
}

function setPlayState(state) {
  isPlaying = state;

  $("#btn-play").textContent =
    state ? "Ⅱ" : "▶";

  $("#record").classList.toggle(
    "spinning",
    state
  );
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
  } else {
    playCurrent();
  }
}

function nextSong(step) {
  loadSong(
    songIndex + step,
    true
  );
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const min =
    Math.floor(seconds / 60);

  const sec =
    Math.floor(seconds % 60);

  return (
    min +
    ":" +
    String(sec).padStart(
      2,
      "0"
    )
  );
}

function renderSongList() {
  const box =
    $("#song-list");

  if (!box) return;

  box.innerHTML = "";

  visibleSongs().forEach(
    (song, index) => {
      const button =
        document.createElement(
          "button"
        );

      button.className =
        "song-row" +
        (index === songIndex
          ? " active"
          : "");

      button.innerHTML = `
        <span>${song.icon}</span>

        <span>
          <b>${song.title}</b>
          <small>${song.artist}</small>
        </span>

        <em>
          ${
            song.secret
              ? "NUEVA"
              : "REPRODUCIR"
          }
        </em>
      `;

      button.onclick = () => {
        loadSong(
          index,
          true
        );

        $("#song-menu").hidden =
          true;
      };

      box.appendChild(button);
    }
  );

  if (!giftUnlocked()) {
    const locked =
      document.createElement(
        "div"
      );

    locked.className =
      "song-row locked";

    locked.innerHTML = `
      <span>🔒</span>

      <span>
        <b>Canción secreta</b>
        <small>
          Desbloquea tu regalo
        </small>
      </span>
    `;

    box.appendChild(locked);
  }
}

/* =========================================================
   CHATBOT
   ========================================================= */

const starter = [
  {
    q: "te amo",
    a:
      "yo te amo más boba, muchísimo más ❤️"
  },
  {
    q: "quien eres",
    a:
      "soy un pedacito de Brian que dejó aquí para acompañarte jijiji"
  },
  {
    q: "cuanto me amas",
    a:
      "un montón que ni entra en todos nuestros recuerdos, rata ❤️"
  },
  {
    q: "te extraño",
    a:
      "yo también te extraño boba, ven pues 😭❤️"
  },
  {
    q: "regalo",
    a:
      "no seas tramposa 👀 primero termina los tres juegos"
  }
];

function ownTraining() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "brianTraining"
      ) || "[]"
    );
  } catch {
    return [];
  }
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9 ]/g,
      " "
    )
    .trim();
}

function botReply(text) {
  const clean =
    normalize(text);

  let best = null;
  let bestScore = 0;

  [
    ...starter,
    ...ownTraining()
  ].forEach((entry) => {
    const words =
      normalize(entry.q)
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 2
        );

    let hits = 0;

    words.forEach((word) => {
      if (
        clean.includes(word)
      ) {
        hits++;
      }
    });

    const score =
      words.length
        ? hits / words.length
        : 0;

    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });

  if (
    best &&
    bestScore >= 0.5
  ) {
    return best.a;
  }

  return "Jajaja todavía no sé responder eso exactamente como Brian. Él tendrá que enseñarme 😭❤️";
}

function appendMessage(
  text,
  sender
) {
  const message =
    document.createElement(
      "div"
    );

  message.className =
    "message " +
    sender +
    "-message";

  message.textContent = text;

  $("#chat-messages")
    .appendChild(message);

  $("#chat-messages").scrollTop =
    $("#chat-messages")
      .scrollHeight;
}

function sendMessage(text) {
  if (!text.trim()) return;

  appendMessage(
    text,
    "user"
  );

  setTimeout(() => {
    appendMessage(
      botReply(text),
      "bot"
    );
  }, 450);
}

/* =========================================================
   ENTRENAMIENTO PRIVADO
   ========================================================= */

function renderTraining() {
  const box =
    $("#training-list");

  const data =
    ownTraining();

  box.innerHTML = "";

  data.forEach(
    (entry, index) => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "training-item";

      item.innerHTML = `
        <button>×</button>
        <b>${entry.q}</b>
        <br>
        ${entry.a}
      `;

      item.querySelector(
        "button"
      ).onclick = () => {
        data.splice(index, 1);

        localStorage.setItem(
          "brianTraining",
          JSON.stringify(data)
        );

        renderTraining();
      };

      box.appendChild(item);
    }
  );
}

/* =========================================================
   REGALO
   ========================================================= */

function showGift() {
  const dialog =
    $("#gift-dialog");

  const lockedGames =
    $("#gift-locked-games");

  const lock =
    $("#gift-lock");

  const win =
    $("#gift-win");

  if (giftUnlocked()) {
    lockedGames.hidden = true;
    lock.hidden = true;
    win.hidden = false;
  } else if (
    gamesCompleted >= 3
  ) {
    lockedGames.hidden = true;
    lock.hidden = false;
    win.hidden = true;
  } else {
    lockedGames.hidden = false;
    lock.hidden = true;
    win.hidden = true;
  }

  dialog.showModal();
}

function unlockGift() {
  localStorage.setItem(
    "giftUnlocked",
    "yes"
  );

  $("#gift-lock").hidden =
    true;

  $("#gift-win").hidden =
    false;

  updateProgress(4);

  renderSongList();

  confetti();

  loadSong(
    visibleSongs().length - 1,
    true
  );
}

/* =========================================================
   CELEBRACIÓN
   ========================================================= */

let celebrateClicks = 0;

function confetti() {
  const box =
    $("#confetti");

  box.innerHTML = "";

  for (
    let i = 0;
    i < 70;
    i++
  ) {
    const piece =
      document.createElement(
        "i"
      );

    piece.textContent =
      i % 3 === 0
        ? "♥"
        : "✦";

    piece.style.left =
      Math.random() *
        100 +
      "vw";

    piece.style.animationDelay =
      Math.random() *
        0.7 +
      "s";

    piece.style.setProperty(
      "--drift",
      Math.random() *
        180 -
        90 +
        "px"
    );

    box.appendChild(piece);
  }

  setTimeout(() => {
    box.innerHTML = "";
  }, 5200);
}

function celebrate() {
  celebrateClicks++;

  $("#celebrate-count")
    .textContent =
      celebrateClicks +
      " / 7";

  confetti();

  const button =
    $("#celebrate-btn");

  button.style.transform =
    "scale(" +
    (1 +
      celebrateClicks *
        0.035) +
    ")";

  if (
    celebrateClicks >= 7
  ) {
    button.hidden = true;

    $("#celebrate-count")
      .hidden = true;

    $("#final-prize")
      .hidden = false;

    confetti();

    loadSong(
      visibleSongs().length - 1,
      true
    );
  }
}

/* =========================================================
   ÁLBUM PRÓXIMAMENTE
   ========================================================= */

function openAlbumSoon() {
  $("#album-dialog")
    .showModal();
}

/* =========================================================
   EVENTOS
   ========================================================= */

function bindEvents() {

  /* MEMORIA */

  $("#memory-start")
    .addEventListener(
      "click",
      startMemory
    );

  /* TORRE */

  $("#stack-start")
    .addEventListener(
      "click",
      () => {
        if (!stackRunning) {
          startStack();
        } else {
          placeStackPiece();
        }
      }
    );

  stackCanvas.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();

      if (stackRunning) {
        placeStackPiece();
      }
    }
  );

  /* SAPITO */

  $("#flappy-start")
    .addEventListener(
      "click",
      () => {
        if (!flappyRunning) {
          startFlappy();
        } else {
          flap();
        }
      }
    );

  flappyCanvas.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();

      if (flappyRunning) {
        flap();
      }
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.code ===
          "Space" &&
        currentLevel === 3
      ) {
        event.preventDefault();

        if (!flappyRunning) {
          startFlappy();
        } else {
          flap();
        }
      }

      if (
        event.code ===
          "Space" &&
        currentLevel === 2 &&
        stackRunning
      ) {
        event.preventDefault();
        placeStackPiece();
      }
    }
  );

  $("#flappy-retry")
    .addEventListener(
      "click",
      () => {
        $("#flappy-fail-dialog")
          .close();

        startFlappy();
      }
    );

  /* ÁLBUM */

  $("#album-soon")
    .addEventListener(
      "click",
      openAlbumSoon
    );

  /* CHAT */

  $("#chat-form")
    .addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        const input =
          $("#user-input");

        sendMessage(
          input.value
        );

        input.value = "";
      }
    );

  $$(".quick-prompts button")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          sendMessage(
            button.dataset
              .prompt
          );
        }
      );
    });

  /* ESTRELLA PRIVADA */

  $("#trainer-secret")
    .addEventListener(
      "click",
      () => {
        $("#admin-error")
          .textContent = "";

        $("#admin-password")
          .value = "";

        $("#admin-lock")
          .showModal();
      }
    );

  $("#admin-form")
    .addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        if (
          $("#admin-password")
            .value ===
          PASSWORD_ADMIN
        ) {
          $("#admin-lock")
            .close();

          renderTraining();

          $("#trainer-dialog")
            .showModal();
        } else {
          $("#admin-error")
            .textContent =
              "Contraseña incorrecta";
        }
      }
    );

  $("#trainer-form")
    .addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        const data =
          ownTraining();

        data.push({
          q:
            $("#training-input")
              .value.trim(),

          a:
            $("#training-answer")
              .value.trim()
        });

        localStorage.setItem(
          "brianTraining",
          JSON.stringify(data)
        );

        event.target.reset();

        renderTraining();
      }
    );

  /* MÚSICA */

  $("#btn-play")
    .addEventListener(
      "click",
      togglePlay
    );

  $("#btn-next")
    .addEventListener(
      "click",
      () => nextSong(1)
    );

  $("#btn-prev")
    .addEventListener(
      "click",
      () => nextSong(-1)
    );

  $("#queue-toggle")
    .addEventListener(
      "click",
      () => {
        $("#song-menu").hidden =
          !$("#song-menu")
            .hidden;

        renderSongList();
      }
    );

  $("#queue-close")
    .addEventListener(
      "click",
      () => {
        $("#song-menu").hidden =
          true;
      }
    );

  $("#volume")
    .addEventListener(
      "input",
      (event) => {
        audio.volume =
          event.target.value;
      }
    );

  $("#progress-bar")
    .addEventListener(
      "input",
      (event) => {
        if (audio.duration) {
          audio.currentTime =
            audio.duration *
            event.target.value /
            100;
        }
      }
    );

  audio.addEventListener(
    "timeupdate",
    () => {
      $("#current-time")
        .textContent =
          formatTime(
            audio.currentTime
          );

      $("#duration-time")
        .textContent =
          formatTime(
            audio.duration
          );

      if (audio.duration) {
        $("#progress-bar")
          .value =
            audio.currentTime /
            audio.duration *
            100;
      }
    }
  );

  audio.addEventListener(
    "play",
    () => {
      setPlayState(true);
    }
  );

  audio.addEventListener(
    "pause",
    () => {
      setPlayState(false);
    }
  );

  audio.addEventListener(
    "ended",
    () => {
      nextSong(1);
    }
  );

  /* REGALO */

  $("#gift-open")
    .addEventListener(
      "click",
      showGift
    );

  $("#back-to-game")
    .addEventListener(
      "click",
      () => {
        $("#gift-dialog")
          .close();

        document
          .querySelector(
            ".game-card"
          )
          .scrollIntoView({
            behavior: "smooth"
          });
      }
    );

  $("#gift-form")
    .addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        const password =
          $("#gift-password")
            .value.trim();

        if (
          password ===
          PASSWORD_REGALO
        ) {
          $("#gift-error")
            .textContent = "";

          unlockGift();
        } else {
          $("#gift-error")
            .textContent =
              "Esa no es nuestra fecha… intenta otra vez ♡";

          $("#gift-password")
            .select();
        }
      }
    );

  $("#celebrate-btn")
    .addEventListener(
      "click",
      celebrate
    );

  /* CERRAR DIÁLOGOS */

  $$("[data-close]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const dialog =
            document.getElementById(
              button.dataset
                .close
            );

          if (dialog) {
            dialog.close();
          }
        }
      );
    });
}

/* =========================================================
   INICIO
   ========================================================= */

function init() {
  audio.volume = 0.8;

  updateProgress(1);

  startMemory();

  resetStack();
  resetFlappy();

  loadSong(0);

  bindEvents();

  /*
    Si el regalo ya se desbloqueó anteriormente,
    mantenemos la canción secreta disponible.
  */

  if (giftUnlocked()) {
    gamesCompleted = 3;
    updateProgress(4);
    renderSongList();
  }

  console.log(
    "DUDUS cargado correctamente ❤️"
  );
}

document.addEventListener(
  "DOMContentLoaded",
  init
);