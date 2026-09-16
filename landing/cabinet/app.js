// Trimmed sibling of the root cabinet's app.js -- this one boots straight
// into the game-select carousel (random + the 5 games) since the landing
// page's START button is only meant to launch a game, not re-walk the
// SDG/credit/reference slides that live on the landing page itself now.
//
// Two of the five links below (Breath of the Ocean, A Fishy Situation) are
// plain GitHub repo URLs, not live GitHub Pages sites -- see chat. They'll
// 404 until those teammates enable Pages on their repos; wire the real
// live URL in here once they do.

document.addEventListener('DOMContentLoaded', () => {
  const screenContent = document.getElementById('screenContent');
  const joyLeft = document.getElementById('joyLeft');
  const joyRight = document.getElementById('joyRight');
  const arcadeButton = document.getElementById('arcadeButton');

  const CAROUSEL = [
    { id: 'random', kind: 'random' },
    { id: 'fishy-situation', kind: 'game', label: 'A Fishy Situation', thumb: '../../assets/images/KieuPhuongThumbnail.png', src: 'https://github.com/KieuPhuonggg/AFishySituu' },
    { id: 'embrace', kind: 'game', label: 'Embrace', thumb: '../../assets/images/TungPhuongThumbnail.png', src: 'https://phuongtung06.github.io/EmbraceA3/' },
    { id: 'breath-of-the-ocean', kind: 'game', label: 'Breath of the Ocean', thumb: '../../assets/images/AnPhamThumbnail.png', src: 'https://github.com/anphamb/Breath-of-the-Ocean' },
    { id: 'the-last-catch', kind: 'game', label: 'The Last Catch', thumb: '../../assets/images/TuanHungThumbnail.png', src: '../../games/tuan-hung/index.html' },
    { id: 'reeflect', kind: 'game', label: 'Reeflect', thumb: '../../assets/images/TieuDinhNgocThumbnail.png?v=3', src: 'https://ngoctieu0207.github.io/reeflect.2/' },
    { id: 'exit', kind: 'exit' }
  ];
  const ENTRY_INDEX = CAROUSEL.findIndex((it) => it.kind === 'random');

  let mode = 'carousel'; // 'carousel' | 'spinning'
  let carouselIndex = ENTRY_INDEX;

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

  // External games (teammates' own repos/pages) open in a new tab so the
  // cabinet stays put; the local game navigates the tab directly.
  function launchGame(item) {
    if (/^https?:\/\//.test(item.src)) {
      window.open(item.src, '_blank', 'noopener');
    } else {
      window.location.href = item.src;
    }
  }

  function confirmCarousel() {
    const item = CAROUSEL[carouselIndex];
    if (item.kind === 'exit') { window.location.href = '../index.html'; return; }
    if (item.kind === 'random') { spinRandom(); return; }
    launchGame(item);
  }

  arcadeButton.addEventListener('click', () => {
    if (mode === 'spinning') return;
    arcadeButton.classList.add('is-pressed');
    setTimeout(() => arcadeButton.classList.remove('is-pressed'), 220);
    confirmCarousel();
  });

  joyLeft.addEventListener('click', () => { if (mode !== 'spinning') goCarousel(-1, joyLeft); });
  joyRight.addEventListener('click', () => { if (mode !== 'spinning') goCarousel(1, joyRight); });

  screenContent.innerHTML = '<div class="page-panel">' + renderCarouselItem(CAROUSEL[carouselIndex]) + '</div>';
});
