// Shared by both landing/index.html (data-transition-mode="depart") and
// landing/cabinet/index.html (data-transition-mode="arrive"). A plain
// multi-page site has no real route transition, so this fakes one: the
// landing page slides a full-screen mascot overlay UP to cover the
// screen before navigating into the cabinet, and the cabinet's own copy
// of the same overlay starts already covering its screen and slides
// DOWN to reveal it -- the visual illusion of one continuous transition
// across the hard page-navigation boundary.

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('pageTransition');
  if (!overlay) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  // NOTE: this used to also bail out (display:none) on phone/touch, as a
  // diagnostic for the sticky-header/horizontal-overflow saga (see git
  // history) -- this overlay turned out not to be the cause (the real
  // causes were the .sdg decorations' bleed offsets and .nav-group's own
  // edge-overflowing transform, both unrelated to this file), so the
  // transition is back on for everyone, phone included.
  if (reduceMotion || !hasGsap) {
    overlay.style.display = 'none';
    return;
  }

  const mode = overlay.dataset.transitionMode;

  if (mode === 'arrive') {
    // Landing's own overlay reads its background from the same
    // --page-grad-top/bottom tokens the rest of that page uses, so it's
    // already theme-correct. The cabinet has no theme system of its own
    // (always dark), so its copy of the overlay defaulted to a fixed
    // dark background -- a visible color mismatch against the light
    // overlay landing had just slid up if the visitor was in light mode.
    // Read the same 'seaventure-theme' the toggle writes (same origin,
    // so it's already there) and match landing's exact gradient values.
    let theme = null;
    try { theme = localStorage.getItem('seaventure-theme'); } catch (e) {}
    if (theme !== 'light' && theme !== 'dark') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const GRADIENTS = { light: ['#bbe8fb', '#11aef3'], dark: ['#063e79', '#021427'] };
    const g = GRADIENTS[theme];
    overlay.style.background = 'linear-gradient(180deg,' + g[0] + ',' + g[1] + ')';
    const lightMascot = overlay.querySelector('img[data-mascot="light"]');
    const darkMascot = overlay.querySelector('img[data-mascot="dark"]');
    if (lightMascot && darkMascot) {
      lightMascot.style.display = theme === 'light' ? 'block' : 'none';
      darkMascot.style.display = theme === 'light' ? 'none' : 'block';
    }

    // Extra beat before revealing -- the cover should hold for a moment
    // (mascot fully in frame) instead of sliding away almost as soon as
    // the new page has painted.
    gsap.to(overlay, {
      y: '100%',
      duration: 0.7,
      ease: 'power2.inOut',
      delay: 1,
      onComplete: () => {
        // See the matching comment in the 'depart' branch below -- once
        // this is done revealing the cabinet, it has no more job to do
        // for as long as the visitor stays on this page (which can be a
        // while, browsing the carousel), so it's fully hidden instead of
        // sitting there translated off-screen but still a live
        // position:fixed layer the whole time.
        overlay.style.visibility = 'hidden';
      },
    });
  }

  if (mode === 'depart') {
    // Idle for as long as the visitor is just reading/scrolling this
    // page (which, for the landing page, can be the whole visit) --
    // fully hidden rather than merely translated off-screen. A
    // position:fixed element that's only visually off-screen still has
    // to be tracked by the browser as a real layer throughout every
    // scroll on the page; reports of a solid block flickering in and
    // out near the bottom of the screen while scrolling (see git
    // history) point at exactly this staying resident the whole time
    // being the actual problem, more than the will-change hint that was
    // tried and reverted first. visibility:hidden removes it from
    // painting/compositing entirely until a link click needs it back.
    overlay.style.visibility = 'hidden';

    // Every link that heads into the cabinet (the games section's START
    // button, and the footer's per-game links) gets the same departure
    // animation before the browser actually navigates.
    document.querySelectorAll('a[href^="cabinet/"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const dest = link.href;
        overlay.style.visibility = 'visible';
        gsap.to(overlay, {
          y: '0%',
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            window.location.href = dest;
          },
        });
      });
    });
  }
});
