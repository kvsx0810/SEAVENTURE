// GSAP-driven motion for the landing page: a hero entrance on load, and
// scroll-triggered reveals for every major text block + image as it comes
// into view (also fires on nav-link jumps since those are just a smooth
// scroll -- see `scroll-behavior: smooth` in style.css -- not a hard
// instant jump, so ScrollTrigger sees the same scroll it would from a
// mouse-wheel scroll). Skips all of this for prefers-reduced-motion.

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

  // -------------------- scroll reveals --------------------
  // Text blocks: fade + rise into place.
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 36,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Groups (footer columns, footer credit clusters): stagger the children.
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
        toggleActions: 'play none none none',
      },
    });
  });

  // Prominent art (arcade machine, CTA hands, footer reef): fade + scale.
  gsap.utils.toArray('[data-reveal-img]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      scale: 0.92,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
});
