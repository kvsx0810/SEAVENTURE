document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.joystick-btn').forEach((btn) => {
    const target = btn.dataset.href;
    const isRight = btn.classList.contains('joystick-btn--right');
    const pushClass = isRight ? 'is-pushing-right' : 'is-pushing-left';

    if (!target) {
      btn.classList.add('is-disabled');
      btn.setAttribute('aria-disabled', 'true');
    }

    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-animating')) return;
      btn.classList.add('is-animating');

      if (!target) {
        btn.classList.add('is-refusing');
        window.setTimeout(() => {
          btn.classList.remove('is-animating', 'is-refusing');
        }, 300);
        return;
      }

      btn.classList.add(pushClass);
      window.setTimeout(() => {
        window.location.href = target;
      }, 380);
    });
  });
});
