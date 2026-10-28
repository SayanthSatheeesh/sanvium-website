import { stopLocoScroll, startLocoScroll } from './loco-scroll.js';

export function initNav() {
  const menuToggle = document.getElementById('menu-toggle');
  const navOverlay = document.getElementById('nav-overlay');
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  if (!menuToggle || !navOverlay) return;

  const firstFocusableElement = navOverlay.querySelectorAll(focusableElements)[0];
  const focusableContent = navOverlay.querySelectorAll(focusableElements);
  const lastFocusableElement = focusableContent[focusableContent.length - 1];

  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    menuToggle.setAttribute('aria-expanded', isMenuOpen);
    
    if (isMenuOpen) {
      navOverlay.removeAttribute('hidden');
      document.body.style.overflow = 'hidden'; // Lock scroll
      stopLocoScroll();
      firstFocusableElement?.focus();
    } else {
      navOverlay.setAttribute('hidden', '');
      document.body.style.overflow = ''; // Unlock scroll
      startLocoScroll();
      menuToggle.focus();
    }
  }

  // Toggle on click
  menuToggle.addEventListener('click', toggleMenu);

  // Close on ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isMenuOpen) {
      toggleMenu();
    }
  });

  // Close on clicking outside grid
  navOverlay.addEventListener('click', function(e) {
    if (e.target === navOverlay) {
      toggleMenu();
    }
  });

  // Focus trap
  navOverlay.addEventListener('keydown', function(e) {
    const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

    if (!isTabPressed) return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  });
  
  // Set active link
  const currentPath = window.location.pathname;
  const navLinks = navOverlay.querySelectorAll('.nav-overlay__item');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath || (currentPath === '/' && link.getAttribute('href') === '/')) {
        if(currentPath === '/' && link.getAttribute('href') !== '/') return;
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}
