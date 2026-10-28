// Testimonials Carousel Logic with Automatic Rotation
export function initTestimonials() {
    const cards = document.querySelectorAll('.testimonials__card');
    const dots = document.querySelectorAll('.testimonials__dot');
    const prevBtn = document.querySelector('.testimonials__prev');
    const nextBtn = document.querySelector('.testimonials__next');
    const carouselRegion = document.querySelector('.testimonials__carousel');
    const testimonialsSection = document.querySelector('.testimonials');

    if (!cards.length) return;

    let currentIndex = 0;
    const total = cards.length;
    let autoRotateTimer = null;
    const ROTATION_INTERVAL = 5000; // 5 seconds

    function showSlide(index) {
        cards.forEach((card, i) => {
            if (i === index) {
                card.style.display = 'block';
                card.setAttribute('aria-hidden', 'false');
            } else {
                card.style.display = 'none';
                card.setAttribute('aria-hidden', 'true');
            }
        });

        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('is-active');
                dot.setAttribute('aria-pressed', 'true');
            } else {
                dot.classList.remove('is-active');
                dot.setAttribute('aria-pressed', 'false');
            }
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % total;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + total) % total;
        showSlide(currentIndex);
    }

    function startAutoRotate() {
        stopAutoRotate();
        autoRotateTimer = setInterval(nextSlide, ROTATION_INTERVAL);
    }

    function stopAutoRotate() {
        if (autoRotateTimer) {
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
        }
    }

    // Manual navigation event handlers
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoRotate();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoRotate();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            showSlide(currentIndex);
            startAutoRotate();
        });
    });

    // Pause auto-rotation on mouse hover / touch
    if (testimonialsSection) {
        testimonialsSection.addEventListener('mouseenter', stopAutoRotate);
        testimonialsSection.addEventListener('mouseleave', startAutoRotate);
        testimonialsSection.addEventListener('touchstart', stopAutoRotate, { passive: true });
        testimonialsSection.addEventListener('touchend', startAutoRotate, { passive: true });
    }

    // Initialize first slide & start auto rotation
    cards.forEach((card, i) => {
        if (i !== 0) card.setAttribute('aria-hidden', 'true');
    });

    startAutoRotate();
}
