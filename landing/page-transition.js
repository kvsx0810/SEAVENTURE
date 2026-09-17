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

  if (reduceMotion || !hasGsap) {
    overlay.style.display = 'none';
    return;
  }

  const mode = overlay.dataset.transitionMode;

  if (mode === 'arrive') {
    gsap.to(overlay, { y: '100%', duration: 0.7, ease: 'power2.inOut', delay: 0.2 });
  }

  if (mode === 'depart') {
    // Every link that heads into the cabinet (the games section's START
    // button, and the footer's per-game links) gets the same departure
    // animation before the browser actually navigates.
    document.querySelectorAll('a[href^="cabinet/"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const dest = link.href;
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
