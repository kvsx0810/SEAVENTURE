// SEAVENTURE single-page shell. One persistent cabinet (index.html); the
// joystick/center-button swap CONTENT inside the curved screen instead of
// navigating to a new .html per slide -- see the design walkthrough that
// led here: the previous per-page-.html build was a literal 1:1 export of
// each Figma frame, which is why alignment drifted page to page.
//
// PAGES holds the top-level deck (browsed with the joystick in 'page'
// mode). Add an entry here once a page's Figma design/link has been
// pulled and confirmed -- do not guess a page's layout ahead of that.
//
// CAROUSEL is the game-select sub-mode entered from the 'game-select'
// page: Exit at both ends, Random right after the first Exit, then one
// full-curved-screen panel per member's game (placeholders for now).

document.addEventListener('DOMContentLoaded', () => {
  const screenContent = document.getElementById('screenContent');
  const joyLeft = document.getElementById('joyLeft');
  const joyRight = document.getElementById('joyRight');
  const arcadeButton = document.getElementById('arcadeButton');
  const popupOverlay = document.getElementById('popupOverlay');
  const popupIframe = document.getElementById('popupIframe');
  const popupPlaceholder = document.getElementById('popupPlaceholder');
  const popupTitle = document.getElementById('popupTitle');
  const popupClose = document.getElementById('popupClose');

  // SDG 14.1-14.5 target statements, pulled verbatim from Figma (nodes
  // 180:203, 180:284, 180:363, 180:445, 180:544). `top` is each instance's
  // own vertical position -- Figma's own layout drifts a few px per target
  // depending on how many lines the statement wraps to.
  const SDG_TARGETS = [
    { top: 32.9630, text: '14.1 By 2025, prevent and significantly reduce marine pollution of all kinds, in particular from land-based activities, including marine debris and nutrient pollution.' },
    { top: 32.0417, text: '14.2 By 2020, sustainably manage and protect marine and coastal ecosystems to avoid significant adverse impacts, including by strengthening their resilience, and take action for their restoration in order to achieve healthy and productive oceans.' },
    { top: 32.9630, text: '14.3 Minimize and address the impacts of ocean acidification, including through enhanced scientific cooperation at all levels.' },
    { top: 32.9630, text: '14.4 Effectively regulate harvesting and end overfishing, illegal, unreported and unregulated fishing and destructive fishing practices' },
    { top: 32.9630, text: '14.5 By 2020, conserve at least 10 per cent of coastal and marine areas, consistent with national and international law and based on the best available scientific information.' }
  ];

  const CREDIT_LIST = [
    'Hồ Kiều Phương - S4109320',
    'Trịnh Tuấn Hưng - S4123995',
    'Trần Tùng Phương - S4113612',
    'Phạm Hoài An - S4012478',
    'Tiêu Dĩnh Ngọc - S4088312'
  ];

  const PAGES = [
    { id: 'title', render: renderTitle },
    { id: 'sdg14-overview', render: renderSdgOverview },
    { id: 'quote', render: renderQuote },
    { id: 'sdg14-1', render: () => renderTarget(SDG_TARGETS[0]) },
    { id: 'sdg14-2', render: () => renderTarget(SDG_TARGETS[1]) },
    { id: 'sdg14-3', render: () => renderTarget(SDG_TARGETS[2]) },
    { id: 'sdg14-4', render: () => renderTarget(SDG_TARGETS[3]) },
    { id: 'sdg14-5', render: () => renderTarget(SDG_TARGETS[4]) },
    { id: 'cta', render: renderCta },
    { id: 'paragraph', render: renderParagraph },
    { id: 'game-select', render: renderGameSelectIdle, isGameSelect: true },
    { id: 'credit', render: renderCredit },
    { id: 'reference', render: renderReference }
  ];

  // PLACEHOLDER entries -- set `src` to "games/<name>/index.html" once each
  // member's project folder is added to the repo.
  const CAROUSEL = [
    { id: 'exit-start', kind: 'exit' },
    { id: 'random', kind: 'random' },
    { id: 'member1', kind: 'game', label: 'Member 1', emoji: '\u{1F41F}', src: null },
    { id: 'member2', kind: 'game', label: 'Member 2', emoji: '\u{1F420}', src: null },
    { id: 'member3', kind: 'game', label: 'Member 3', emoji: '\u{1F991}', src: null },
    { id: 'member4', kind: 'game', label: 'Member 4', emoji: '\u{1F421}', src: null },
    { id: 'member5', kind: 'game', label: 'Member 5', emoji: '\u{1F988}', src: null },
    { id: 'exit-end', kind: 'exit' }
  ];

  let mode = 'page'; // 'page' | 'carousel' | 'spinning'
  let pageIndex = 0;
  let carouselIndex = 2; // first real game when entering the carousel

  function renderTitle() {
    return '<div class="title-box"><img src="assets/images/SEAVENTURE.svg" alt="SEAVENTURE" draggable="false"></div>';
  }

  function renderSdgOverview() {
    return '<div class="screen-heading-lines"><p>SDG GOAL 14</p><p>(LIFE BELOW WATER)</p></div>' +
      '<p class="screen-subtext-centered">Conserve and sustainably use the oceans, seas and marine resources for sustainable development</p>';
  }

  function renderQuote() {
    return '<p class="screen-quote">&ldquo; The greatest threat to our planet is the belief that someone else will save it &rdquo;</p>' +
      '<p class="screen-quote-author">Robert Swan</p>';
  }

  function renderTarget(target) {
    return '<p class="screen-heading">SDG 14 TARGETS</p>' +
      '<p class="screen-body" style="top:' + target.top + '%">' + target.text + '</p>';
  }

  function renderCta() {
    return '<div class="screen-title-italic"><p>Change everyday habits</p><p>to protect ocean health</p></div>';
  }

  function renderParagraph() {
    return '<p class="screen-paragraph">&ldquo;The greatest threat to our planet is the belief that someone else will save it&rdquo; reminds us that protecting the ocean starts with individual action. SDG 14 addresses issues such as pollution, overfishing, ocean acidification, and ecosystem loss, all of which are affected by our everyday choices. Small changes in how we consume, use resources, and manage waste can collectively make a difference. Change everyday habits to protect ocean health.</p>';
  }

  function renderCredit() {
    return '<p class="screen-heading screen-heading--top">CREDIT</p>' +
      '<p class="screen-team-name">Ngã 5 Chuồng Chó</p>' +
      '<div class="screen-list screen-list--credit" style="color:#042b54">' +
      CREDIT_LIST.map((line) => '<p>' + line + '</p>').join('') + '</div>';
  }

  function renderReference() {
    return '<p class="screen-heading screen-heading--top">REFERENCE</p>' +
      '<div class="screen-list">' + CREDIT_LIST.map((line) => '<p>' + line + '</p>').join('') + '</div>' +
      '<p class="screen-date">21/8/2026</p>';
  }

  function renderGameSelectIdle() {
    return '<div class="idle-prompt"><p class="prompt-label">Press start</p>' +
      '<p class="prompt-hint">to browse the crew&rsquo;s generative art</p></div>';
  }

  function renderCarouselItem(item) {
    if (item.kind === 'exit') {
      return '<div class="carousel-item kind-exit"><div class="item-emoji">&#8617;</div>' +
        '<div class="item-label">Exit</div><div class="item-hint">back to browsing</div></div>';
    }
    if (item.kind === 'random') {
      return '<div class="carousel-item kind-random"><div class="item-emoji">\u{1F3B2}</div>' +
        '<div class="item-label">Random</div><div class="item-hint">center button to spin</div></div>';
    }
    return '<div class="carousel-item kind-game"><div class="item-emoji">' + item.emoji + '</div>' +
      '<div class="item-label">' + item.label + '</div></div>';
  }

  // -- content transition: new panel slides/fades in from the pull
  // direction, old panel slides/fades out the opposite way, synced with
  // the joystick's own push animation timing (420ms) --
  function swapPanel(html, direction) {
    const oldPanel = screenContent.querySelector('.page-panel');
    const newPanel = document.createElement('div');
    newPanel.className = 'page-panel ' + (direction === 'next' ? 'is-enter-from-right' : 'is-enter-from-left');
    newPanel.innerHTML = html;
    screenContent.appendChild(newPanel);
    void newPanel.offsetWidth; // commit the offset start position before transitioning
    requestAnimationFrame(() => requestAnimationFrame(() => {
      newPanel.classList.remove('is-enter-from-right', 'is-enter-from-left');
    }));
    if (oldPanel) {
      oldPanel.classList.add(direction === 'next' ? 'is-leaving-left' : 'is-leaving-right');
      setTimeout(() => oldPanel.remove(), 340);
    }
    return newPanel;
  }

  // -- joystick push/refuse animation (same technique the old nav.js used) --
  function playPush(btn, isRight) {
    if (btn.classList.contains('is-animating')) return false;
    btn.classList.add('is-animating', isRight ? 'is-pushing-right' : 'is-pushing-left');
    setTimeout(() => btn.classList.remove('is-animating', isRight ? 'is-pushing-right' : 'is-pushing-left'), 420);
    return true;
  }

  function playRefuse(btn) {
    if (btn.classList.contains('is-animating')) return;
    btn.classList.add('is-animating', 'is-refusing');
    setTimeout(() => btn.classList.remove('is-animating', 'is-refusing'), 300);
  }

  function goPage(delta, btn) {
    const next = pageIndex + delta;
    if (next < 0 || next >= PAGES.length) { playRefuse(btn); return; }
    if (!playPush(btn, delta > 0)) return;
    pageIndex = next;
    swapPanel(PAGES[pageIndex].render(), delta > 0 ? 'next' : 'prev');
  }

  function goCarousel(delta, btn) {
    const next = carouselIndex + delta;
    if (next < 0 || next >= CAROUSEL.length) { playRefuse(btn); return; }
    if (!playPush(btn, delta > 0)) return;
    carouselIndex = next;
    swapPanel(renderCarouselItem(CAROUSEL[carouselIndex]), delta > 0 ? 'next' : 'prev');
  }

  function enterCarousel() {
    mode = 'carousel';
    carouselIndex = 2;
    swapPanel(renderCarouselItem(CAROUSEL[carouselIndex]), 'next');
  }

  function exitCarousel() {
    mode = 'page';
    swapPanel(PAGES[pageIndex].render(), 'prev');
  }

  // -- Random: fast decelerating flicker across games (+ the Random card
  // itself, for visual variety mid-spin), always settling on a real game --
  function spinRandom() {
    mode = 'spinning';
    let ticks = 0;
    const totalTicks = 12 + Math.floor(Math.random() * 4);
    let delay = 55;
    const gameIndices = CAROUSEL.map((it, i) => i).filter((i) => CAROUSEL[i].kind === 'game');
    const flickerPool = [1].concat(gameIndices);

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

  function confirmCarousel() {
    const item = CAROUSEL[carouselIndex];
    if (item.kind === 'exit') { exitCarousel(); return; }
    if (item.kind === 'random') { spinRandom(); return; }
    openPopup(item);
  }

  function openPopup(item) {
    popupTitle.textContent = item.label;
    if (item.src) {
      popupIframe.src = item.src;
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
    popupOverlay.classList.remove('is-open');
    popupIframe.removeAttribute('src');
    popupIframe.style.display = 'none';
  }

  arcadeButton.addEventListener('click', () => {
    if (mode === 'spinning') return;
    arcadeButton.classList.add('is-pressed');
    setTimeout(() => arcadeButton.classList.remove('is-pressed'), 220);

    if (mode === 'page') {
      if (PAGES[pageIndex].isGameSelect) enterCarousel();
    } else if (mode === 'carousel') {
      confirmCarousel();
    }
  });

  joyLeft.addEventListener('click', () => {
    if (mode === 'spinning') return;
    if (mode === 'page') goPage(-1, joyLeft);
    else goCarousel(-1, joyLeft);
  });

  joyRight.addEventListener('click', () => {
    if (mode === 'spinning') return;
    if (mode === 'page') goPage(1, joyRight);
    else goCarousel(1, joyRight);
  });

  // Popup closes via the explicit close button, or clicking the dimmed
  // backdrop -- the cabinet controls sit under the overlay (z-index) and
  // are unreachable while it's open, same as a real cabinet reading as
  // "dimmed = inactive".
  popupClose.addEventListener('click', closePopup);
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closePopup();
  });

  screenContent.innerHTML = '<div class="page-panel">' + PAGES[pageIndex].render() + '</div>';
});
