import { stopLocoScroll, startLocoScroll } from './loco-scroll.js';

export function initProjectModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const modalIframe = modal.querySelector('.project-modal__iframe');
  const modalTitle = modal.querySelector('.project-modal__title');
  const modalBadge = modal.querySelector('.project-modal__badge');
  const modalExtLink = modal.querySelector('.project-modal__ext-link');
  const modalClose = modal.querySelector('.project-modal__close');
  const modalLoader = modal.querySelector('.project-modal__loader');

  // Calculate scaled iframe transform for cards
  function updateCardScales() {
    const scaleWrappers = document.querySelectorAll('.project-card__iframe-wrap');
    scaleWrappers.forEach(wrap => {
      const scaleTarget = wrap.querySelector('.project-card__iframe-scale');
      if (scaleTarget) {
        const wrapWidth = wrap.clientWidth;
        // Target virtual desktop width of 1440px
        const scale = wrapWidth / 1440;
        scaleTarget.style.transform = `scale(${scale})`;
      }
    });
  }

  // Initial scale calculation & resize listener
  updateCardScales();
  window.addEventListener('resize', updateCardScales);

  // Delegate click events on project cards to open modal
  document.body.addEventListener('click', (e) => {
    const cardLink = e.target.closest('[data-project-url]');
    if (!cardLink) return;

    e.preventDefault();

    const url = cardLink.getAttribute('data-project-url');
    const title = cardLink.getAttribute('data-project-title') || 'Website Preview';
    const badge = cardLink.getAttribute('data-project-badge') || 'PROJECT';

    openModal(url, title, badge);
  });

  function openModal(url, title, badge) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalBadge) modalBadge.textContent = badge;
    if (modalExtLink) modalExtLink.href = url;

    // Show loader
    if (modalLoader) {
      modalLoader.style.opacity = '1';
      modalLoader.style.display = 'flex';
    }

    if (modalIframe) {
      modalIframe.src = url;

      // Hide loader once iframe loads
      modalIframe.onload = () => {
        if (modalLoader) {
          modalLoader.style.opacity = '0';
          setTimeout(() => {
            modalLoader.style.display = 'none';
          }, 300);
        }
      };
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    stopLocoScroll();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    startLocoScroll();

    // Clear iframe src after transition to save bandwidth/resources
    setTimeout(() => {
      if (modalIframe) modalIframe.src = 'about:blank';
    }, 350);
  }

  // Close handlers
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}
