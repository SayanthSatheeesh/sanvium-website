/**
 * 2.5D Hero Scene — Volt floating in a field of stars.
 * Load: Volt rises out of the hover glow and waves (CSS, triggered here).
 * Idle: float + glow pulse (CSS); desktop pointers add a gentle tilt toward the cursor.
 * Scroll: as the hero leaves, Volt turns and drifts with the camera, the stars stretch
 * into streaks, leading into Studio Flight (the next section).
 */

export function initHeroScene() {
  const scene = document.getElementById('hero-scene');
  if (!scene) return;

  const hero = scene.closest('.hero') || scene;
  const bot = scene.querySelector('.hero-scene__bot');
  const robot = scene.querySelector('.hero-bot');
  const stars = scene.querySelector('.hero-scene__stars');
  const glow = scene.querySelector('.hero__glow');
  const images = Array.from(scene.querySelectorAll('img'));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Wave the arm (restartable; also replayed when the robot is hovered)
  function wave() {
    if (prefersReducedMotion || !robot) return;
    robot.classList.remove('is-waving');
    void robot.offsetWidth; // restart the animation
    robot.classList.add('is-waving');
  }
  if (robot) robot.addEventListener('animationend', (e) => {
    if (e.animationName === 'volt-wave') robot.classList.remove('is-waving');
  });

  // Reveal once both layers have loaded, then wave hello
  Promise.all(images.map((img) => (img.complete ? Promise.resolve() : new Promise((resolve) => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', resolve, { once: true });
  })))).then(() => {
    requestAnimationFrame(() => scene.classList.add('is-ready'));
    setTimeout(wave, 900);
  });

  if (prefersReducedMotion) return;

  if (hasFinePointer && bot) {
    bot.style.pointerEvents = 'auto';
    bot.addEventListener('mouseenter', wave);
  }

  // Cursor tilt (desktop only)
  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;

  if (hasFinePointer) {
    window.addEventListener('mousemove', (event) => {
      targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = (event.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  // Animation loop, paused while the hero is off-screen
  let progress = 0;
  let isVisible = true;
  let frameId = null;

  function tick() {
    if (!isVisible) {
      frameId = null;
      return;
    }
    frameId = requestAnimationFrame(tick);

    mouseX += (targetMouseX - mouseX) * 0.06;
    mouseY += (targetMouseY - mouseY) * 0.06;

    // Scroll progress as the hero leaves the viewport (rect works under Locomotive transforms)
    const rect = hero.getBoundingClientRect();
    const target = Math.min(Math.max(-rect.top / rect.height, 0), 1);
    progress += (target - progress) * 0.1;
    const p = progress;
    const w = scene.offsetWidth;

    // Volt: cursor tilt + scroll turn; drifts down against the scroll so the camera seems to follow it
    bot.style.transform =
      `translate3d(${mouseX * 14 + p * w * 0.08}px, ${mouseY * 10 + p * w * 0.32}px, 0) ` +
      `rotateY(${mouseX * 10 + p * 18}deg) rotateX(${-mouseY * 6 + p * 8}deg) rotateZ(${-p * 6}deg) ` +
      `scale(${1 - p * 0.18})`;

    // Stars stretch into light streaks with speed
    stars.style.transform = `translate3d(${-mouseX * 10}px, ${-mouseY * 6}px, 0) scaleX(${1 + p * 2.4})`;

    glow.style.opacity = String(1 + p * 0.6);
  }

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && frameId === null) frameId = requestAnimationFrame(tick);
  });
  observer.observe(hero);
}
