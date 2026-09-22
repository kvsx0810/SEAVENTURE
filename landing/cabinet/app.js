// Trimmed sibling of the root cabinet's app.js -- this one boots straight
// into the game-select carousel (random + the 5 games) since the landing
// page's START button is only meant to launch a game, not re-walk the
// SDG/credit/reference slides that live on the landing page itself now.

// Landscape-only on phones, same reasoning and detection as
// games/tuan-hung/sketch.js's isPhoneTouch()/isPhonePortrait() (a phone's
// SHORT side stays under 900px in either orientation, but whether that's
// width or height flips with rotation, so both are checked) -- kept
// independent of the carousel/popup logic below so it still runs even if
// something in that logic throws.
function isPhoneTouch() {
  return (window.matchMedia('(max-width: 900px)').matches
      || window.matchMedia('(max-height: 900px)').matches)
    && window.matchMedia('(pointer: coarse)').matches;
}
function isPhonePortrait() {
  return isPhoneTouch() && window.innerHeight > window.innerWidth;
}
function setupResponsiveLayout() {
  const prompt = document.getElementById('rotate-prompt');
  const stage = document.querySelector('.stage');
  function apply() {
    const portrait = isPhonePortrait();
    prompt.hidden = !portrait;
    stage.style.visibility = portrait ? 'hidden' : 'visible';
  }
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', apply);
  apply();
}
setupResponsiveLayout();

// Background music toggle -- moved here from the landing page (per
// feedback, this page is the arcade itself, the landing page should stay
// quiet). No persistence across visits, same reasoning as every other
// audio toggle in this project: the browser blocks autoplay regardless of
// what was remembered, so there was never anything to resume unattended.
function setupMusicToggle() {
  const btn = document.getElementById('musicToggle');
  const bgm = document.getElementById('bgm');
  if (!btn || !bgm) return;
  bgm.volume = 0.35;
  let on = false;
  btn.addEventListener('click', () => {
    on = !on;
    btn.setAttribute('aria-pressed', String(on));
    if (on) bgm.play().catch(() => {});
    else bgm.pause();
  });
}
setupMusicToggle();

// Real Fullscreen API -- the actual browser chrome (address bar, tabs)
// only goes away in a browser that supports this at all (mainly Android
// Chrome; iOS Safari doesn't implement it for an arbitrary element, only
// for <video>), so the button stays [hidden] entirely everywhere else
// rather than sitting there doing nothing when tapped. Vendor-prefixed
// fallbacks cover older WebKit/Firefox builds that only shipped the
// prefixed form.
function setupFullscreenToggle() {
  const btn = document.getElementById('fullscreenToggle');
  if (!btn) return;

  const requestFs = document.documentElement.requestFullscreen
    || document.documentElement.webkitRequestFullscreen
    || document.documentElement.mozRequestFullScreen;
  const exitFs = document.exitFullscreen
    || document.webkitExitFullscreen
    || document.mozCancelFullScreen;
  if (!requestFs || !exitFs) return; // stays hidden

  btn.hidden = false;

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
  }

  btn.addEventListener('click', () => {
    if (isFullscreen()) exitFs.call(document);
    else requestFs.call(document.documentElement).catch(() => {}); // rejects if not called from a direct user gesture, or if the browser denies it -- nothing more to do either way
  });

  // Keeps the icon/aria-pressed in sync even when fullscreen is left a
  // different way than this button -- the Esc key, a system back
  // gesture, etc.
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach((evt) => {
    document.addEventListener(evt, () => {
      btn.setAttribute('aria-pressed', String(isFullscreen()));
    });
  });
}
setupFullscreenToggle();

document.addEventListener('DOMContentLoaded', () => {
  const screenContent = document.getElementById('screenContent');
  const joyLeft = document.getElementById('joyLeft');
  const joyRight = document.getElementById('joyRight');
  const arcadeButton = document.getElementById('arcadeButton');
  const popupOverlay = document.getElementById('popupOverlay');
  const popupIframe = document.getElementById('popupIframe');
  const popupClose = document.getElementById('popupClose');

  const CAROUSEL = [
    { id: 'random', kind: 'random' },
    { id: 'fishy-situation', kind: 'game', label: 'A Fishy Situation', thumb: '../../assets/images/KieuPhuongThumbnail.png', src: 'https://kieuphuonggg.github.io/AFishySituu/' },
    { id: 'embrace', kind: 'game', label: 'Embrace', thumb: '../../assets/images/TungPhuongThumbnail.png', src: 'https://phuongtung06.github.io/COMM2754-2026-S2-A3w12-Embrace-code/' },
    { id: 'breath-of-the-ocean', kind: 'game', label: 'Breath of the Ocean', thumb: '../../assets/images/AnPhamThumbnail.png', src: 'https://anphamb.github.io/Breath-of-the-Ocean/' },
    { id: 'the-last-catch', kind: 'game', label: 'The Last Catch', thumb: '../../assets/images/TuanHungThumbnail.png', src: '../../games/tuan-hung/index.html' },
    { id: 'reeflect', kind: 'game', label: 'Reeflect', thumb: '../../assets/images/TieuDinhNgocThumbnail.png?v=3', src: 'https://ngoctieu0207.github.io/reeflect.2/' },
    { id: 'exit', kind: 'exit' }
  ];
  const ENTRY_INDEX = CAROUSEL.findIndex((it) => it.kind === 'random');

  // Landing page footer links pass ?game=<id> so "A Fishy Situation" etc.
  // land here with that game already selected (and opened) instead of
  // dumping the visitor on the plain Random card.
  const requestedGameId = new URLSearchParams(window.location.search).get('game');
  const requestedIndex = requestedGameId ? CAROUSEL.findIndex((it) => it.id === requestedGameId) : -1;

  let mode = 'carousel'; // 'carousel' | 'spinning'
  let carouselIndex = requestedIndex !== -1 ? requestedIndex : ENTRY_INDEX;

  function renderCarouselItem(item) {
    if (item.kind === 'exit') {
      return '<div class="carousel-item kind-exit"><div class="item-emoji">&#8617;</div>' +
        '<div class="item-label">Back to site</div></div>';
    }
    if (item.kind === 'random') {
      return '<div class="carousel-item kind-random"><div class="item-emoji">?</div>' +
        '<div class="item-label">Random</div></div>';
    }
    return '<div class="carousel-item kind-game has-thumb"><img class="item-thumb-full" src="' + item.thumb + '" alt="' + item.label + '"></div>';
  }

  // -- content transition: new panel slides/fades in from the pull
  // direction, old panel slides/fades out the opposite way, synced with
  // the joystick's own push animation timing (420ms) -- same technique
  // as the root cabinet's app.js --
  function swapPanel(html, direction) {
    const oldPanel = screenContent.querySelector('.page-panel');
    const newPanel = document.createElement('div');
    newPanel.className = 'page-panel ' + (direction === 'next' ? 'is-enter-from-right' : 'is-enter-from-left');
    newPanel.innerHTML = html;
    screenContent.appendChild(newPanel);
    void newPanel.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      newPanel.classList.remove('is-enter-from-right', 'is-enter-from-left');
    }));
    if (oldPanel) {
      oldPanel.classList.add(direction === 'next' ? 'is-leaving-left' : 'is-leaving-right');
      setTimeout(() => oldPanel.remove(), 340);
    }
    return newPanel;
  }

  function playPush(btn, isRight) {
    if (btn.classList.contains('is-animating')) return false;
    btn.classList.add('is-animating', isRight ? 'is-pushing-right' : 'is-pushing-left');
    setTimeout(() => btn.classList.remove('is-animating', isRight ? 'is-pushing-right' : 'is-pushing-left'), 420);
    return true;
  }

  function goCarousel(delta, btn) {
    if (!playPush(btn, delta > 0)) return;
    carouselIndex = (carouselIndex + delta + CAROUSEL.length) % CAROUSEL.length;
    swapPanel(renderCarouselItem(CAROUSEL[carouselIndex]), delta > 0 ? 'next' : 'prev');
  }

  // -- Random: fast decelerating flicker across games, always settling
  // on a real game -- same technique as the root cabinet's app.js --
  function spinRandom() {
    mode = 'spinning';
    let ticks = 0;
    const totalTicks = 12 + Math.floor(Math.random() * 4);
    let delay = 55;
    const gameIndices = CAROUSEL.map((it, i) => i).filter((i) => CAROUSEL[i].kind === 'game');
    const flickerPool = [ENTRY_INDEX].concat(gameIndices);

    function renderInstant(index) {
      screenContent.innerHTML = '<div class="page-panel">' + renderCarouselItem(CAROUSEL[index]) + '</div>';
    }

    function tick() {
      carouselIndex = flickerPool[Math.floor(Math.random() * flickerPool.length)];
      renderInstant(carouselIndex);
      ticks++;
      if (ticks < totalTicks) {
        delay *= 1.12;
        setTimeout(tick, delay);
      } else {
        carouselIndex = gameIndices[Math.floor(Math.random() * gameIndices.length)];
        renderInstant(carouselIndex);
        mode = 'carousel';
      }
    }
    tick();
  }

  // Same iframe-popup mechanism as the root cabinet -- the chosen game
  // loads inline over the arcade instead of leaving the page, whether
  // it's a teammate's external Pages site or the local game.
  function openPopup(item) {
    popupIframe.src = item.src;
    popupOverlay.classList.add('is-open');
  }

  function closePopup() {
    popupOverlay.classList.remove('is-open');
    popupIframe.removeAttribute('src');
  }

  function confirmCarousel() {
    const item = CAROUSEL[carouselIndex];
    if (item.kind === 'exit') { window.location.href = '../index.html'; return; }
    if (item.kind === 'random') { spinRandom(); return; }
    openPopup(item);
  }

  arcadeButton.addEventListener('click', () => {
    if (mode === 'spinning') return;
    arcadeButton.classList.add('is-pressed');
    setTimeout(() => arcadeButton.classList.remove('is-pressed'), 220);
    confirmCarousel();
  });

  joyLeft.addEventListener('click', () => { if (mode !== 'spinning') goCarousel(-1, joyLeft); });
  joyRight.addEventListener('click', () => { if (mode !== 'spinning') goCarousel(1, joyRight); });

  popupClose.addEventListener('click', closePopup);
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closePopup();
  });

  screenContent.innerHTML = '<div class="page-panel">' + renderCarouselItem(CAROUSEL[carouselIndex]) + '</div>';

  if (requestedIndex !== -1) {
    setTimeout(() => openPopup(CAROUSEL[requestedIndex]), 500);
  }
});
