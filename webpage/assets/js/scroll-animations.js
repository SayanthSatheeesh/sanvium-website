/**
 * Split-Text Reveal & Scroll Animations (Obys Agency Inspired Pattern)
 * Powered by GSAP ScrollTrigger with robust zero-dependency text splitting.
 */

// Helper to split text node into characters/words wrapped in mask containers
function splitElementText(element, type = 'chars') {
  if (element.dataset.splitReady === 'true') return;
  element.dataset.splitReady = 'true';

  const rawText = element.textContent.trim();
  element.setAttribute('aria-label', rawText); // Preserve screen reader accessibility

  if (type === 'lines') {
    const lines = element.innerHTML.split(/<br\s*[\/]?>/gi);
    element.innerHTML = '';
    lines.forEach((lineText) => {
      const lineWrap = document.createElement('span');
      lineWrap.className = 'split-line-wrap';
      const lineInner = document.createElement('span');
      lineInner.className = 'split-line';
      lineInner.innerHTML = lineText.trim();
      lineWrap.appendChild(lineInner);
      element.appendChild(lineWrap);
    });
    return;
  }

  // Split by words first, then characters (preserves clean wrapping)
  const words = rawText.split(/\s+/);
  element.innerHTML = '';

  words.forEach((word, wordIndex) => {
    const wordWrap = document.createElement('span');
    wordWrap.className = 'split-word-wrap';

    const chars = Array.from(word);
    chars.forEach((char) => {
      const charWrap = document.createElement('span');
      charWrap.className = 'split-char-wrap';

      const charInner = document.createElement('span');
      charInner.className = 'split-char';
      charInner.textContent = char;

      charWrap.appendChild(charInner);
      wordWrap.appendChild(charWrap);
    });

    element.appendChild(wordWrap);

    // Add space after word if not the last
    if (wordIndex < words.length - 1) {
      element.appendChild(document.createTextNode(' '));
    }
  });
}

export function initScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate], [data-split]').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const hasGsap = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
  const scrollerContainer = document.querySelector('[data-scroll-container]');
  const isLocoActive = document.documentElement.classList.contains('has-scroll-smooth');

  // Determine the scroller target for ScrollTrigger
  const scrollerTarget = isLocoActive && scrollerContainer ? scrollerContainer : window;

  // 1. Prepare and animate Split-Text Elements (Obys Agency masked reveal)
  const splitElements = document.querySelectorAll('[data-split]');
  splitElements.forEach((el) => {
    const splitType = el.getAttribute('data-split') || 'chars';
    splitElementText(el, splitType);

    if (hasGsap && hasScrollTrigger) {
      const targetItems = el.querySelectorAll('.split-char, .split-line');
      const isHero = el.closest('#hero') !== null || el.closest('.hero') !== null;
      const delay = parseFloat(el.dataset.delay || 0) * 0.15;

      if (isHero) {
        // Immediate stagger reveal on page entrance for hero
        window.gsap.to(targetItems, {
          y: '0%',
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.025,
          delay: 0.2 + delay
        });
      } else {
        // Scroll-triggered stagger reveal
        window.gsap.to(targetItems, {
          scrollTrigger: {
            trigger: el,
            scroller: scrollerTarget,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          y: '0%',
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.02,
          delay: delay
        });
      }
    } else {
      // Fallback if GSAP is unavailable
      el.querySelectorAll('.split-char, .split-line').forEach((item) => {
        item.style.transform = 'none';
        item.style.opacity = '1';
      });
    }
  });

  // 2. Animate other [data-animate] elements
  const animateElements = document.querySelectorAll('[data-animate]:not([data-split])');

  if (hasGsap && hasScrollTrigger) {
    animateElements.forEach((el) => {
      const isHero = el.closest('#hero') !== null || el.closest('.hero') !== null;
      const delay = parseFloat(el.dataset.delay || 0) * 0.12;

      if (isHero) {
        window.gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.35 + delay,
          onComplete: () => el.classList.add('is-visible')
        });
      } else {
        window.gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            scroller: scrollerTarget,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power2.out',
          delay: delay,
          onComplete: () => el.classList.add('is-visible')
        });
      }
    });
  } else {
    // IntersectionObserver fallback
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.15 });

    animateElements.forEach((el) => observer.observe(el));
  }
}
