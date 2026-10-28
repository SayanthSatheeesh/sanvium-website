/**
 * Interactive Cursor Follower, Card Mouse Spotlight & Magnetic Buttons
 */
export function initCursorSpotlight() {
  // Check for fine pointing device (desktop mouse) and reduced motion preference
  if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Create ambient cursor glow element
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  document.body.classList.add('cursor-active');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  let isAnimating = false;
  let rafId = null;

  // Smooth lerp loop for cursor follower
  function render() {
    const dx = mouseX - currentX;
    const dy = mouseY - currentY;

    currentX += dx * 0.15;
    currentY += dy * 0.15;
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

    // Pause animation frame when converged to save CPU
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      rafId = requestAnimationFrame(render);
    } else {
      isAnimating = false;
    }
  }

  function startAnimation() {
    if (!isAnimating) {
      isAnimating = true;
      rafId = requestAnimationFrame(render);
    }
  }

  startAnimation();

  // Mouse move listener
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    startAnimation();

    // Update mouse position CSS variables on cards with [data-spotlight]
    const spotlightCards = document.querySelectorAll('[data-spotlight]');
    spotlightCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  }, { passive: true });

  // Magnetic Buttons Effect
  const magneticEls = document.querySelectorAll('.btn, .nav-dock__menu, .nav-dock__cta');
  magneticEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.25;
      const deltaY = (e.clientY - centerY) * 0.25;
      el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1.03)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = `translate3d(0, 0, 0) scale(1)`;
    });
  });
}
