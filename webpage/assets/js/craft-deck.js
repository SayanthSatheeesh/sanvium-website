import { canPinSections, pinSection, getSectionProgress, scrollToSectionProgress } from './loco-scroll.js';

/**
 * "What We Craft" stacked card deck.
 * Desktop: the section pins and scroll position flips the top card up and away.
 * Touch / reduced motion: no pinning; swipe or prev/next buttons flip cards.
 */
export function initCraftDeck() {
  const track = document.getElementById('craft-track');
  if (!track) return;

  const sticky = track.querySelector('.craft__sticky');
  const deck = track.querySelector('.craft__deck');
  const cards = Array.from(deck.querySelectorAll('.craft-card'));
  const prevBtn = track.querySelector('[data-craft-prev]');
  const nextBtn = track.querySelector('[data-craft-next]');
  const currentLabel = track.querySelector('[data-craft-current]');
  const progressBar = track.querySelector('.craft__progress-bar');
  const hint = track.querySelector('.craft__hint');

  const total = cards.length;
  const lastIndex = total - 1;
  const isPinned = canPinSections();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  deck.classList.add('is-deck');
  if (isPinned) pinSection(track, sticky);
  if (!isPinned && hint) hint.hidden = true;

  // Each card rests for the first/last 25% of its scroll segment and flips in between
  function dwell(raw) {
    const segment = Math.min(Math.floor(raw), lastIndex);
    const t = Math.min(Math.max((raw - segment - 0.25) / 0.5, 0), 1);
    return segment + t * t * (3 - 2 * t);
  }

  // flip = 0 → first card on top; flip = lastIndex → last card on top
  let flip = 0;
  let targetFlip = 0;
  let activeIndex = -1;

  function render() {
    cards.forEach((card, i) => {
      const flipped = Math.min(Math.max(flip - i, 0), 1); // how far this card has flown away
      const depth = Math.max(i - flip, 0);                // position in the stack behind the top card

      if (flipped > 0) {
        card.style.transform = `translate3d(0, ${-flipped * 115}%, 0) rotateX(${flipped * 32}deg) scale(${1 - flipped * 0.06})`;
        card.style.opacity = String(1 - flipped);
        card.style.filter = 'none';
      } else {
        // Dim with brightness, not opacity, so cards behind never show through the top card
        card.style.transform = `translate3d(0, ${depth * 26}px, ${-depth * 60}px) scale(${1 - depth * 0.05})`;
        card.style.opacity = depth > 3 ? '0' : '1';
        card.style.filter = `brightness(${Math.max(1 - depth * 0.3, 0.2)})`;
      }
      card.style.zIndex = String(total - i);
      card.style.visibility = flipped >= 1 ? 'hidden' : 'visible';
    });

    const index = Math.min(Math.round(flip), lastIndex);
    if (index !== activeIndex) {
      activeIndex = index;
      cards.forEach((card, i) => {
        card.classList.toggle('is-active', i === index);
        card.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      if (currentLabel) currentLabel.textContent = String(index + 1).padStart(2, '0');
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === lastIndex;
    }

    if (progressBar) progressBar.style.transform = `scaleX(${(flip + 1) / total})`;
  }

  function goTo(index) {
    const clamped = Math.min(Math.max(index, 0), lastIndex);
    if (isPinned) {
      scrollToSectionProgress(track, clamped / lastIndex);
    } else {
      targetFlip = clamped;
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(activeIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(activeIndex + 1));

  // Swipe to flip on touch
  let touchStartX = null;
  deck.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) > 40) goTo(activeIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // Animation loop, paused while the section is off-screen
  let isVisible = false;
  let frameId = null;

  function tick() {
    if (!isVisible) {
      frameId = null;
      return;
    }
    frameId = requestAnimationFrame(tick);

    if (isPinned) targetFlip = dwell(getSectionProgress(track) * lastIndex);
    const ease = prefersReducedMotion ? 1 : (isPinned ? 0.2 : 0.12);
    flip += (targetFlip - flip) * ease;
    if (Math.abs(targetFlip - flip) < 0.001) flip = targetFlip;
    render();
  }

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && frameId === null) frameId = requestAnimationFrame(tick);
  });
  observer.observe(track);

  render();
}
