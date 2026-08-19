// ===== Cấu hình bộ bài =====
// Mỗi entry: { type, count } -> số cặp (pairs), ảnh mặt sau lấy theo type
// crab: 1 cặp | so: 1 cặp | sanho: 2 cặp | co2: 2 cặp | company: 2 cặp => 8 cặp = 16 lá
const CARD_CONFIG = [
  { type: "crab",    image: "Image\\crab card.png",    pairs: 1, isCreature: true  },
  { type: "so",      image: "Image\\so card.png",      pairs: 1, isCreature: true  },
  { type: "sanho",   image: "Image\\sanho card.png",   pairs: 2, isCreature: true  },
  { type: "co2",     image: "Image\\co2 card.png",     pairs: 2, isCreature: false },
  { type: "company", image: "Image\\company card.png", pairs: 2, isCreature: false },
];

const FRONT_IMAGE = "Image\\front card.png"; // mặt úp (chưa lật)

// ===== Trạng thái game =====
let flippedCards = [];   // các thẻ đang lật, tối đa 2
let lockBoard = false;   // khoá không cho click khi đang kiểm tra 2 lá
let ecoLevel = 0;        // mức độ "sức khoẻ" đại dương: + sinh vật, - ô nhiễm
let matchedPairs = 0;
const TOTAL_PAIRS = CARD_CONFIG.reduce((sum, c) => sum + c.pairs, 0);

// ===== Thanh đo độ pH =====
const PH_MAX_HITS = 3;   // 3 lần trúng CO2/Company = cạn hẳn (mỗi lần trừ 1/3)
const PH_DANGER_HITS = 2; // trúng đủ 2/3 thì sinh vật biến mất
let phHits = 0;

function updatePhBar() {
  const fill = document.getElementById("phFill");
  if (!fill) return;

  const remaining = Math.max(0, PH_MAX_HITS - phHits);
  const percent = (remaining / PH_MAX_HITS) * 100;
  fill.style.width = `${percent}%`;

  if (phHits >= PH_DANGER_HITS) {
    fill.style.background = "linear-gradient(90deg, #ef4444, #f87171)";
  } else if (phHits === 1) {
    fill.style.background = "linear-gradient(90deg, #f59e0b, #fbbf24)";
  } else {
    fill.style.background = "linear-gradient(90deg, #22c55e, #4ade80)";
  }
}

function handlePollutionMatch() {
  phHits = Math.min(PH_MAX_HITS, phHits + 1);
  updatePhBar();

  if (phHits >= PH_DANGER_HITS) {
    document.querySelectorAll(".creature").forEach(el => {
      el.style.opacity = "0";
    });
  }
}

function buildDeck() {
  let deck = [];
  CARD_CONFIG.forEach(cfg => {
    for (let p = 0; p < cfg.pairs; p++) {
      // mỗi cặp tạo ra 2 lá cùng type/ảnh
      deck.push({ type: cfg.type, image: cfg.image, isCreature: cfg.isCreature });
      deck.push({ type: cfg.type, image: cfg.image, isCreature: cfg.isCreature });
    }
  });
  return shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createCardElement(cardData, index) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.type = cardData.type;
  card.dataset.index = index;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">
        <img src="${FRONT_IMAGE}" alt="card back">
      </div>
      <div class="card-face card-back">
        <img src="${cardData.image}" alt="${cardData.type}">
      </div>
    </div>
  `;

  card.addEventListener("click", () => onCardClick(card, cardData));
  return card;
}

function renderBoard() {
  const grid = document.getElementById("cardGrid");
  grid.innerHTML = "";
  const deck = buildDeck();
  deck.forEach((cardData, index) => {
    grid.appendChild(createCardElement(cardData, index));
  });
}

function onCardClick(card, cardData) {
  if (lockBoard) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  flippedCards.push({ el: card, data: cardData });

  if (flippedCards.length === 2) {
    lockBoard = true;
    checkForMatch();
  }
}

function checkForMatch() {
  const [first, second] = flippedCards;
  const isMatch = first.data.type === second.data.type;

  if (isMatch) {
    setTimeout(() => {
      first.el.classList.add("matched");
      second.el.classList.add("matched");
      matchedPairs++;
      updateEcoLevel(first.data.isCreature);
      if (!first.data.isCreature) {
        handlePollutionMatch();
      }
      resetTurn();
      checkWin();
    }, 350);
  } else {
    first.el.classList.add("wrong");
    second.el.classList.add("wrong");
    setTimeout(() => {
      first.el.classList.remove("flipped", "wrong");
      second.el.classList.remove("flipped", "wrong");
      resetTurn();
    }, 900);
  }
}

function resetTurn() {
  flippedCards = [];
  lockBoard = false;
}

// Sinh vật sáng lên khi ghép đúng sinh vật, tối đi khi ghép đúng CO2/company
function updateEcoLevel(isCreature) {
  ecoLevel += isCreature ? 1 : -1;
  ecoLevel = Math.max(-4, Math.min(4, ecoLevel));

  const brightness = Math.max(0.45, Math.min(1.6, 1 + ecoLevel * 0.15));
  const saturation = Math.max(0.3, Math.min(1.7, 1 + ecoLevel * 0.15));
  const grayscale = ecoLevel < 0 ? Math.min(0.65, Math.abs(ecoLevel) * 0.15) : 0;

  document.querySelectorAll(".creature").forEach(el => {
    el.style.filter = `brightness(${brightness}) saturate(${saturation}) grayscale(${grayscale})`;
  });
}

function checkWin() {
  if (matchedPairs === TOTAL_PAIRS) {
    setTimeout(() => {
      alert("Bạn đã ghép hết các cặp thẻ! 🎉");
    }, 400);
  }
}

function startGame() {
  const startScreen = document.getElementById("startScreen");
  const bggame = document.getElementById("bggame");
  const phBarContainer = document.getElementById("phBarContainer");

  startScreen.classList.add("hidden");
  bggame.classList.remove("hidden");
  phBarContainer.classList.remove("hidden");

  // reset trạng thái pH và bàn cờ mỗi lần bắt đầu
  phHits = 0;
  updatePhBar();
  document.querySelectorAll(".creature").forEach(el => {
    el.style.opacity = "1";
  });

  renderBoard();
}

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", startGame);
  }
});


/*bóng bay*/
const BUBBLE_IMAGES = [
  "Image/ballom.png",
  "Image/ballom-3.png",
  "Image/ballom-4.png",
  "Image/ballom-5.png",
  "Image/ballom-6.png",
  "Image/ballom-7.png"
];

const BUBBLE_COUNT = 20;
let bubbles = [];

function createBubbles() {
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    createBubble(i);
  }
}

function createBubble(index) {
  const bubble = document.createElement("img");

  bubble.src = BUBBLE_IMAGES[
    Math.floor(Math.random() * BUBBLE_IMAGES.length)
  ];

  bubble.className = "floating-bubble";

  bubble.style.left = `${Math.random() * 100}vw`;

  bubble.style.width = `${10 + Math.random() * 25}px`;

  bubble.style.opacity = `${0.3 + Math.random() * 0.5}`;

  bubble.dataset.speed = 0.1 + Math.random() * 0.2;
  bubble.dataset.drift = Math.random() * 2 - 1;
  bubble.dataset.offset = Math.random() * Math.PI * 2;

  bubble.style.top = `${80 + Math.random() * 20}vh`;

  document.body.appendChild(bubble);

  bubbles.push({
    element: bubble,
    y: parseFloat(bubble.style.top),
    x: parseFloat(bubble.style.left),
    speed: parseFloat(bubble.dataset.speed),
    drift: parseFloat(bubble.dataset.drift),
    offset: parseFloat(bubble.dataset.offset)
  });
}

function animateBubbles(time) {
  bubbles.forEach(bubble => {
    bubble.y -= bubble.speed;

    const wave =
      Math.sin(time * 0.001 + bubble.offset) * 0.15;

    bubble.x += bubble.drift * wave;

    if (bubble.y < -10) {
      bubble.y = 100 + Math.random() * 20;
      bubble.x = Math.random() * 100;
    }

    bubble.element.style.top = `${bubble.y}vh`;
    bubble.element.style.left = `${bubble.x}vw`;
  });

  requestAnimationFrame(animateBubbles);
}

document.addEventListener("DOMContentLoaded", () => {
  createBubbles();
  requestAnimationFrame(animateBubbles);
});