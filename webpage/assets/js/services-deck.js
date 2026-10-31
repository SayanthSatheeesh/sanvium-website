/**
 * "What We Do" deck: three overlapping service cards.
 * Fan mode (desktop): the stack fans out when it scrolls into view; hovering,
 * focusing or clicking a card lifts it to the front with a selection frame.
 * Swipe mode (touch / narrow): a pile you swipe through; the top card goes to the back.
 * Each card's position lives in CSS custom properties (--x, --y, --r, --s, --z).
 */

const SWIPE_QUERY = '(pointer: coarse), (max-width: 760px)';
const SWIPE_DISTANCE = 90; // px of drag that counts as a swipe

function place(card, { x = 0, y = 0, r = 0, s = 1, z = 1 }) {
  card.style.setProperty('--x', `${x}px`);
  card.style.setProperty('--y', `${y}px`);
  card.style.setProperty('--r', `${r}deg`);
  card.style.setProperty('--s', s);
  card.style.setProperty('--z', z);
}

export function initServicesDeck() {
  const deck = document.querySelector('[data-svc-deck]');
  if (!deck) return;

  const section = deck.closest('.svc');
  const cards = Array.from(deck.querySelectorAll('.svc-card'));
  const counter = section.querySelector('[data-deck-current]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const swipeQuery = window.matchMedia(SWIPE_QUERY);

  let fanned = reducedMotion;
  let active = 0;   // card lifted to the front (fan mode) or on top (swipe mode)
  let hovered = null;

  const layoutFan = () => {
    const cardW = cards[0].offsetWidth;
    const push = fanned ? 48 : 0; // neighbours step away from the lifted card so their text clears it
    const spread = fanned ? Math.min(300, (deck.clientWidth - cardW) / 2 - 12 - push) : 26;
    const shown = hovered ?? active;

    cards.forEach((card, i) => {
      const side = i - 1; // -1, 0, 1
      const isShown = i === shown;
      place(card, {
        x: side * spread + Math.sign(i - shown) * push,
        y: isShown ? -22 : (fanned ? Math.abs(side) * 26 : i * 6),
        r: isShown ? 0 : side * (fanned ? 7 : 3),
        s: isShown ? 1.03 : 1,
        z: isShown ? 10 : i + 1,
      });
      card.classList.toggle('is-active', isShown);
    });
  };

  const layoutSwipe = () => {
    const tilts = [0, -4, 4];
    cards.forEach((card, i) => {
      const depth = (i - active + cards.length) % cards.length;
      place(card, { y: depth * 14, r: tilts[depth], s: 1 - depth * 0.05, z: 10 - depth });
      card.classList.toggle('is-active', depth === 0);
    });
  };

  const isSwipe = () => deck.classList.contains('is-swipe');
  const layout = () => (isSwipe() ? layoutSwipe() : layoutFan());

  const select = (index) => {
    active = (index + cards.length) % cards.length;
    counter.textContent = String(active + 1).padStart(2, '0');
    layout();
  };

  // Equal card heights, and a stage tall enough for the lift, tilt and selection frame
  const sizeDeck = () => {
    cards.forEach((card) => { card.style.height = ''; });
    const tallest = Math.max(...cards.map((card) => card.offsetHeight));
    cards.forEach((card) => { card.style.height = `${tallest}px`; });
    deck.style.height = `${cards[0].offsetTop + tallest + (isSwipe() ? 48 : 80)}px`;
  };

  const applyMode = () => {
    deck.classList.toggle('is-swipe', swipeQuery.matches);
    cards.forEach((card) => card.setAttribute('tabindex', swipeQuery.matches ? '-1' : '0'));
    sizeDeck();
    layout();
  };

  // Fan mode: hover / focus previews a card, click keeps it in front
  cards.forEach((card, i) => {
    card.addEventListener('pointerenter', (e) => {
      if (isSwipe() || e.pointerType !== 'mouse') return;
      hovered = i;
      layoutFan();
    });
    card.addEventListener('focus', () => { if (!isSwipe()) select(i); });
    card.addEventListener('click', () => { if (!isSwipe()) select(i); });
  });

  deck.addEventListener('pointerleave', () => {
    if (isSwipe() || hovered === null) return;
    hovered = null;
    layoutFan();
  });

  // Swipe mode: drag the top card sideways; past the threshold it flies off and goes to the back
  let drag = null;

  deck.addEventListener('pointerdown', (e) => {
    const card = cards[active];
    if (!isSwipe() || !card.contains(e.target)) return;
    drag = { id: e.pointerId, startX: e.clientX, dx: 0, card };
    try { card.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    card.classList.add('is-dragging');
  });

  deck.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.startX;
    place(drag.card, { x: drag.dx, y: Math.abs(drag.dx) * 0.08, r: drag.dx * 0.08, z: 10 });
  });

  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { card, dx } = drag;
    drag = null;
    card.classList.remove('is-dragging');

    if (Math.abs(dx) < SWIPE_DISTANCE) {
      layoutSwipe();
      return;
    }
    // Throw it off-screen, then slide it in at the back of the pile
    place(card, { x: Math.sign(dx) * deck.clientWidth, r: Math.sign(dx) * 24, z: 10 });
    setTimeout(() => select(active + 1), reducedMotion ? 0 : 220);
  };

  deck.addEventListener('pointerup', endDrag);
  deck.addEventListener('pointercancel', endDrag);

  // Buttons work in both modes
  section.querySelector('[data-deck-prev]').addEventListener('click', () => select(active - 1));
  section.querySelector('[data-deck-next]').addEventListener('click', () => select(active + 1));

  // Fan out the first time the deck scrolls into view
  if (!fanned) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      fanned = true;
      layout();
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(deck);
  }

  swipeQuery.addEventListener('change', applyMode);
  window.addEventListener('resize', () => { sizeDeck(); layout(); });
  applyMode();
  document.fonts?.ready.then(sizeDeck); // web fonts change text wrapping, so measure again
}
