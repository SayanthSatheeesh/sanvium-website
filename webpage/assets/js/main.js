import { initLocoScroll } from './loco-scroll.js';
import { initNav } from './nav.js';
import { initScrollAnimations } from './scroll-animations.js';
import { initCursorSpotlight } from './cursor-spotlight.js';
import { initProjectModal } from './project-modal.js';
import { initHeroScene } from './hero-scene.js';
import { initLetsScrollWorld } from './lets-scroll-world.js';
import { initCraftDeck } from './craft-deck.js';

// Page-specific modules
import { initCounters } from './counter.js';
import { initTestimonials } from './testimonials.js';
import { initPortfolioFilter } from './portfolio-filter.js';
import { initForm } from './form.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Locomotive Smooth Inertia (Desktop)
    initLocoScroll();

    // 2. Global UI initializations
    initNav();
    initScrollAnimations();
    initCursorSpotlight();
    initProjectModal();

    // 3. Page-specific initializations
    const bodyClass = document.body.className;

    if (bodyClass.includes('page-home')) {
        initHeroScene();
        initCraftDeck();
        initLetsScrollWorld();
        initCounters();
        initTestimonials();
    }

    if (bodyClass.includes('page-portfolio')) {
        initPortfolioFilter();
    }

    if (bodyClass.includes('page-connect')) {
        initForm();
    }

    if (bodyClass.includes('page-journal')) {
        import('./journal.js').then(module => {
            module.initJournal();
        });
    }
});

