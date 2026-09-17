// GSAP-driven motion for the landing page: a hero entrance on load,
// line-by-line scroll reveals for text, slide-in hands, prominent-art
// reveals, and a scroll-spy underline on the nav. Also fires on nav-link
// jumps since those are just a smooth scroll -- see `scroll-behavior:
// smooth` in style.css -- not a hard instant jump, so ScrollTrigger sees
// the same scroll it would from a mouse-wheel scroll. Skips all of this
// for prefers-reduced-motion.

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  // -------------------- hero entrance (plays once, on load) --------------------
  const heroMascot = document.querySelectorAll('.hero-mascot');
  const heroTitle = document.querySelector('.hero-title');
  const heroWaves = document.querySelectorAll('.hero-waves .wave');

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from(heroWaves, { opacity: 0, y: 40, duration: 1, stagger: 0.15 })
    .from(heroMascot, { opacity: 0, y: 30, scale: 0.85, duration: 0.8 }, '-=0.6')
    .from(heroTitle, { opacity: 0, y: 30, duration: 0.8 }, '-=0.5');

  // -------------------- line-by-line text reveal --------------------
  // Wraps every word of a [data-reveal] element in its own inline-block
  // span (keeping any nested markup, e.g. the <span class="hl"> quote
  // highlights, intact as an ancestor of those word-spans -- this is a
  // DOM walk over text nodes, not a naive innerHTML regex, specifically
  // so it doesn't clobber that markup). Words are then grouped by their
  // rendered top position into lines, and animated with a stagger keyed
  // off the LINE index (not the word index), so every word on the same
  // line moves together -- a line-by-line reveal, not a per-word one,
  // without needing GSAP's SplitText plugin.
  function splitIntoWords(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);
    textNodes.forEach((textNode) => {
      const tokens = textNode.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      tokens.forEach((token) => {
        if (token === '') return;
        if (/^\s+$/.test(token)) {
          frag.appendChild(document.createTextNode(token));
        } else {
          const span = document.createElement('span');
          span.className = 'reveal-word';
          span.textContent = token;
          frag.appendChild(span);
        }
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
    return Array.from(el.querySelectorAll('.reveal-word'));
  }

  function lineIndexPerWord(words) {
    let lastTop = null;
    let line = -1;
    return words.map((w) => {
      const top = Math.round(w.getBoundingClientRect().top);
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        line++;
        lastTop = top;
      }
      return line;
    });
  }

  // Several headings/paragraphs are gradient text (background-clip:text +
  // color:transparent) -- giving a *child* span its own transform/opacity
  // (which GSAP does for every word here) pushes Chrome to isolate it
  // into its own compositing layer, which breaks the "see the ancestor's
  // clipped background through me" trick and the word just renders
  // invisible. Fix: paint the SAME gradient directly on each word too,
  // sized to the whole container and shifted so every word still shows
  // the correct slice of one continuous gradient (as if it were never
  // split at all). Words inside a `.hl` highlight keep their own solid
  // override color instead -- untouched, since solid color never had
  // this problem.
  function applyGradientSlice(container, words) {
    const cs = getComputedStyle(container);
    const isClipped = cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text';
    if (!isClipped) return;
    const rect = container.getBoundingClientRect();
    const bgImage = cs.backgroundImage;
    words.forEach((w) => {
      if (w.closest('.hl')) return;
      const wRect = w.getBoundingClientRect();
      w.style.backgroundImage = bgImage;
      w.style.backgroundSize = rect.width + 'px ' + rect.height + 'px';
      w.style.backgroundPosition = (rect.left - wRect.left) + 'px ' + (rect.top - wRect.top) + 'px';
      w.style.backgroundRepeat = 'no-repeat';
      w.style.webkitBackgroundClip = 'text';
      w.style.backgroundClip = 'text';
      w.style.color = 'transparent';
    });
  }

  // Every reveal below is a TOGGLE, not a one-shot: scrolling a section
  // out of view (either direction) hides it again, so scrolling back
  // re-triggers the reveal instead of it staying permanently visible.
  // `toggleActions: 'play reverse play reverse'` maps to the 4
  // ScrollTrigger events in order -- onEnter/onLeave/onEnterBack/
  // onLeaveBack -- play forward on the way in, run in reverse on the
  // way out, from either direction.
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    const words = splitIntoWords(el);
    if (!words.length) return;
    const lines = lineIndexPerWord(words);
    applyGradientSlice(el, words);
    gsap.set(words, { opacity: 0, y: 22 });
    const show = () => gsap.to(words, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', overwrite: true, stagger: (i) => lines[i] * 0.12 });
    const hide = () => gsap.to(words, { opacity: 0, y: 22, duration: 0.35, ease: 'power2.in', overwrite: true });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: show,
      onEnterBack: show,
      onLeave: hide,
      onLeaveBack: hide,
    });
  });

  // -------------------- CTA hands: slide + fade in from opposite sides --------------------
  gsap.utils.toArray('[data-reveal-hand="right"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      x: 120,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: { trigger: el.closest('.quote-hands-wrap'), start: 'top 85%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' },
    });
  });
  gsap.utils.toArray('[data-reveal-hand="left"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      x: -120,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: { trigger: el.closest('.quote-hands-wrap'), start: 'top 85%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' },
    });
  });

  // -------------------- groups (footer columns, footer credit clusters) --------------------
  gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
    gsap.from(group.children, {
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: group,
        start: 'top 88%',
        end: 'bottom 12%',
        toggleActions: 'play reverse play reverse',
      },
    });
  });

  // -------------------- prominent art (arcade machine, footer reef) --------------------
  gsap.utils.toArray('[data-reveal-img]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      scale: 0.92,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play reverse play reverse',
      },
    });
  });

  // -------------------- nav scroll-spy underline --------------------
  const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
  navLinks.forEach((link) => {
    const id = link.getAttribute('href').replace('#', '');
    const section = document.getElementById(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) {
          navLinks.forEach((l) => l.classList.toggle('is-active', l === link));
        }
      },
    });
  });
});
