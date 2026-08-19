// game.html only — arcade-button "select mode" + slot-machine random + popup.
// Not shared with the other slides, so it fully owns the joystick buttons on
// this page instead of using nav.js (nav.js freezes each button's target to
// whatever data-href was set at page load, which can't flex between "go to
// previous/next slide" in idle mode and "browse the game list" in select mode).

// PLACEHOLDER DATA — swap `src` for "games/<folder>/index.html" once each
// member's code/ folder lands in the repo. Leave `src: null` to keep showing
// the placeholder card in the popup.
const ENTRIES = [
  { id: 'random', kind: 'random', label: 'RANDOM', emoji: '🎲', color: '#2ec2b4' },
  { id: 'member1', kind: 'game', label: 'Member 1', emoji: '🐟', color: '#11aef3', src: null },
  { id: 'member2', kind: 'game', label: 'Member 2', emoji: '🐠', color: '#5ed9cd', src: null },
  { id: 'member3', kind: 'game', label: 'Member 3', emoji: '🦑', color: '#ed8495', src: null },
  { id: 'member4', kind: 'game', label: 'Member 4', emoji: '🐡', color: '#98e7df', src: null },
  { id: 'member5', kind: 'game', label: 'Member 5', emoji: '🦈', color: '#bbe8fb', src: null }
];

document.addEventListener('DOMContentLoaded', () => {
  const gameScreen = document.getElementById('gameScreen');
  const track = document.getElementById('selectTrack');
  const viewport = track.parentElement;
  const arcadeButton = document.getElementById('arcadeButton');
  const joyLeft = document.getElementById('joyLeft');
  const joyRight = document.getElementById('joyRight');
  const popupOverlay = document.getElementById('popupOverlay');
  const popupIframe = document.getElementById('popupIframe');
  const popupPlaceholder = document.getElementById('popupPlaceholder');
  const popupTitle = document.getElementById('popupTitle');
  const popupClose = document.getElementById('popupClose');

  let mode = 'idle'; // 'idle' | 'select' | 'spinning' | 'popup'
  let currentIndex = 1; // first real game, not the RANDOM card itself
  let trackRendered = false;

  function renderTrack() {
    track.innerHTML = '';
    ENTRIES.forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML =
        '<div class="card-thumb" style="background:' + entry.color + '33; color:' + entry.color + '">' + entry.emoji + '</div>' +
        '<div class="card-label">' + entry.label + '</div>';
      track.appendChild(card);
    });
    trackRendered = true;
    updateHighlight();
  }

  function updateHighlight() {
    Array.from(track.children).forEach((card, i) => {
      card.classList.toggle('is-current', i === currentIndex);
    });
    centerTrack();
  }

  function centerTrack() {
    const card = track.children[currentIndex];
    if (!card) return;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const offset = viewport.clientWidth / 2 - cardCenter;
    track.style.transform = 'translateX(' + offset + 'px)';
  }

  function move(delta) {
    currentIndex = (currentIndex + delta + ENTRIES.length) % ENTRIES.length;
    updateHighlight();
  }

  function enterSelect() {
    mode = 'select';
    gameScreen.classList.remove('mode-idle');
    gameScreen.classList.add('mode-select');
    if (!trackRendered) renderTrack();
    else updateHighlight();
  }

  function spinRandom() {
    mode = 'spinning';
    track.classList.add('is-spinning');
    let ticks = 0;
    const totalTicks = 12 + Math.floor(Math.random() * 4); // ~1.4-1.8s total, decelerating
    let delay = 55;

    function tick() {
      currentIndex = (currentIndex + 1) % ENTRIES.length;
      updateHighlight();
      ticks++;
      if (ticks < totalTicks) {
        delay *= 1.12;
        setTimeout(tick, delay);
      } else {
        const gameIndices = ENTRIES.map((e, i) => i).filter((i) => ENTRIES[i].kind === 'game');
        currentIndex = gameIndices[Math.floor(Math.random() * gameIndices.length)];
        updateHighlight();
        track.classList.remove('is-spinning');
        mode = 'select';
      }
    }
    tick();
  }

  function confirmSelection() {
    const entry = ENTRIES[currentIndex];
    if (entry.kind === 'random') {
      spinRandom();
    } else {
      openPopup(entry);
    }
  }

  function openPopup(entry) {
    mode = 'popup';
    popupTitle.textContent = entry.label;
    if (entry.src) {
      popupIframe.src = entry.src;
      popupIframe.style.display = 'block';
      popupPlaceholder.style.display = 'none';
    } else {
      popupIframe.removeAttribute('src');
      popupIframe.style.display = 'none';
      popupPlaceholder.style.display = 'flex';
    }
    popupOverlay.classList.add('is-open');
  }

  function closePopup() {
    mode = 'select';
    popupOverlay.classList.remove('is-open');
    popupIframe.removeAttribute('src');
    popupIframe.style.display = 'none';
  }

  function playPush(btn, isRight) {
    if (btn.classList.contains('is-animating')) return false;
    btn.classList.add('is-animating', isRight ? 'is-pushing-right' : 'is-pushing-left');
    setTimeout(() => {
      btn.classList.remove('is-animating', isRight ? 'is-pushing-right' : 'is-pushing-left');
    }, 420);
    return true;
  }

  function playRefuse(btn) {
    if (btn.classList.contains('is-animating')) return;
    btn.classList.add('is-animating', 'is-refusing');
    setTimeout(() => btn.classList.remove('is-animating', 'is-refusing'), 300);
  }

  function idleNav(btn) {
    const target = btn.dataset.href;
    if (!target) { playRefuse(btn); return; }
    if (!playPush(btn, btn === joyRight)) return;
    setTimeout(() => { window.location.href = target; }, 380);
  }

  arcadeButton.addEventListener('click', () => {
    if (mode === 'spinning') return;
    arcadeButton.classList.add('is-pressed');
    setTimeout(() => arcadeButton.classList.remove('is-pressed'), 220);

    // 'popup' isn't reachable here — the overlay sits above the cabinet
    // (z-index) and physically blocks clicks from reaching this button while
    // it's open, same as a real cabinet reading as "dimmed = inactive".
    if (mode === 'idle') enterSelect();
    else if (mode === 'select') confirmSelection();
  });

  [[joyLeft, false], [joyRight, true]].forEach(([btn, isRight]) => {
    btn.addEventListener('click', () => {
      if (mode === 'idle') { idleNav(btn); return; }
      if (mode === 'spinning') return;
      if (mode === 'select') {
        if (!playPush(btn, isRight)) return;
        move(isRight ? 1 : -1);
      }
    });
  });

  // Popup closes via the explicit close button, or by clicking the dimmed
  // backdrop outside the frame — the cabinet controls are unreachable while
  // it's open (see the arcadeButton comment above).
  popupClose.addEventListener('click', () => closePopup());
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closePopup();
  });

  window.addEventListener('resize', () => {
    if (trackRendered) centerTrack();
  });
});
