/**
 * Locomotive Scroll v3 + GSAP ScrollTrigger Proxy Integration
 * Enables smooth inertia scrolling on desktop while preserving native touch scrolling on mobile.
 */

let locoInstance = null;

export function initLocoScroll() {
  const isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const container = document.querySelector('[data-scroll-container]');

  if (isTouch || prefersReducedMotion || !container || typeof window.LocomotiveScroll === 'undefined') {
    document.documentElement.classList.add('no-loco');
    return null;
  }

  try {
    locoInstance = new window.LocomotiveScroll({
      el: container,
      smooth: true,
      lerp: 0.08, // Smooth inertia factor
      multiplier: 1.0,
      smartphone: { smooth: false },
      tablet: { smooth: false },
      getDirection: true,
      reloadOnContextChange: true
    });

    document.documentElement.classList.add('has-scroll-smooth');

    // Register ScrollTrigger proxy if GSAP is present
    if (window.gsap && window.ScrollTrigger) {
      const ScrollTrigger = window.ScrollTrigger;
      window.gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.scrollerProxy(container, {
        scrollTop(value) {
          return arguments.length
            ? locoInstance.scrollTo(value, 0, 0)
            : locoInstance.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight
          };
        },
        pinType: container.style.transform ? 'transform' : 'fixed'
      });

      locoInstance.on('scroll', ScrollTrigger.update);
      ScrollTrigger.addEventListener('refresh', () => locoInstance.update());
      ScrollTrigger.refresh();
    }

    // Handle window resize and full page load
    window.addEventListener('resize', () => {
      if (locoInstance) locoInstance.update();
    });

    window.addEventListener('load', () => {
      if (locoInstance) {
        // Wait for all images to fully decode before recalculating
        const images = document.querySelectorAll('img[loading="lazy"]');
        const imagePromises = Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          });
        });

        Promise.all(imagePromises).then(() => {
          locoInstance.update();
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        });

        // Safety net refresh
        setTimeout(() => {
          if (locoInstance) locoInstance.update();
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }, 2000);
      }
    });

    return locoInstance;
  } catch (err) {
    console.warn('[LocomotiveScroll] Falling back to native scrolling:', err);
    document.documentElement.classList.remove('has-scroll-smooth');
    return null;
  }
}

export function stopLocoScroll() {
  if (locoInstance) {
    locoInstance.stop();
  }
}

export function startLocoScroll() {
  if (locoInstance) {
    locoInstance.start();
  }
}

// Pinned scroll sections only on desktop pointers with motion allowed (mirrors the CSS media query)
const PIN_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 992px) and (prefers-reduced-motion: no-preference)';

export function canPinSections() {
  return window.matchMedia(PIN_QUERY).matches;
}

/**
 * Keeps `sticky` fixed in the viewport while scrolling through `track`.
 * Native scroll uses CSS `position: sticky`; Locomotive moves content with
 * transforms, so there we counter-translate on its own scroll event (same frame, no jitter).
 */
export function pinSection(track, sticky) {
  if (!locoInstance) return;

  const update = () => {
    const rect = track.getBoundingClientRect();
    const max = Math.max(track.offsetHeight - window.innerHeight, 0);
    const y = Math.min(Math.max(-rect.top, 0), max);
    sticky.style.transform = `translate3d(0, ${y}px, 0)`;
  };

  locoInstance.on('scroll', update);
  update();
}

/**
 * Scroll progress (0 → 1) through a pinned section: 0 when its top meets the
 * viewport top, 1 when its bottom meets the viewport bottom. Reads the bounding
 * rect, so it works under Locomotive's transforms and with native scrolling.
 */
export function getSectionProgress(section) {
  const rect = section.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  if (distance <= 0) return 0;
  return Math.min(Math.max(-rect.top / distance, 0), 1);
}

// Smooth-scroll so the given section sits at progress p (0 → 1)
export function scrollToSectionProgress(section, p) {
  const offset = p * Math.max(section.offsetHeight - window.innerHeight, 0);
  if (locoInstance) {
    // v3.5 takes positional args (target, offset, duration); an absolute Y is the safest target
    const y = locoInstance.scroll.instance.scroll.y + section.getBoundingClientRect().top + offset;
    locoInstance.scrollTo(y, 0, 900);
  } else {
    const top = section.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
