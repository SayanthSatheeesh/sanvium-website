import { canPinSections, pinSection, getSectionProgress, scrollToSectionProgress } from './loco-scroll.js';

/**
 * lets-scroll: Fly-Through Studio World — Scene Engine
 * Desktop: the section pins for ~5 viewports and scroll position scrubs
 * through the 5 scenes (canvas phase + progress bar follow scroll). If the
 * user stops scrolling while pinned, it auto-advances to the next scene.
 * Touch / reduced motion: no pinning; scenes auto-cycle and can be swiped.
 */

export function initLetsScrollWorld() {
  const container = document.getElementById('agency-world');
  if (!container) return;

  const track = document.getElementById('world-track');
  const sticky = container.querySelector('.world-sticky');
  const canvas = container.querySelector('.world-canvas');
  const cards = container.querySelectorAll('.world-card');
  const railSteps = container.querySelectorAll('.world-rail__step');
  const sceneProgressText = container.querySelector('#world-scene-index');
  const progressBar = container.querySelector('.world-progress__bar');
  const hudHint = container.querySelector('.world-hud__hint');

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const TOTAL_SCENES = 5;
  const SCENE_DURATION = 4000; // ms per scene (touch autoplay)
  const IDLE_DELAY = 5000;     // ms without scrolling before auto-advancing (desktop)
  const isScrubbed = canPinSections() && track && sticky;

  let activeScene = -1;
  let time = 0;
  let scrollPhase = 0;
  let sceneTimer = null;
  let isInView = false;
  let frameId = null;

  if (isScrubbed) {
    pinSection(track, sticky);
    container.classList.add('is-scrubbed');
  } else if (hudHint) {
    hudHint.textContent = 'AUTO-CYCLING // SWIPE TO NAVIGATE';
  }

  // --- Canvas sizing ---
  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width || window.innerWidth;
    canvas.height = rect.height || window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // --- Scene switching ---
  function setScene(index) {
    if (index < 0 || index >= TOTAL_SCENES || index === activeScene) return;
    activeScene = index;

    // Update HUD counter
    if (sceneProgressText) {
      sceneProgressText.textContent = '0' + (index + 1) + ' / 05';
    }

    // Update cards
    cards.forEach(function(card, i) {
      card.classList.toggle('is-visible', i === index);
    });

    // Update rail
    railSteps.forEach(function(step, i) {
      step.classList.toggle('is-active', i === index);
      step.setAttribute('aria-current', i === index ? 'step' : 'false');
    });

    // Timed mode: reset and restart the progress bar transition
    if (progressBar && !isScrubbed) {
      progressBar.classList.remove('is-running');
      // Force reflow so the transition restarts
      void progressBar.offsetWidth;
      progressBar.classList.add('is-running');
    }
  }

  // Jump to a scene: scroll there when scrubbed, switch directly otherwise
  function goToScene(index) {
    const clamped = Math.min(Math.max(index, 0), TOTAL_SCENES - 1);
    if (isScrubbed) {
      scrollToSectionProgress(track, (clamped + 0.5) / TOTAL_SCENES);
    } else {
      setScene(clamped);
      startAutoPlay();
    }
  }

  // --- Touch autoplay ---
  function startAutoPlay() {
    stopAutoPlay();
    if (isScrubbed) return;
    sceneTimer = setInterval(function() {
      setScene((activeScene + 1) % TOTAL_SCENES);
    }, SCENE_DURATION);
  }

  function stopAutoPlay() {
    if (sceneTimer) {
      clearInterval(sceneTimer);
      sceneTimer = null;
    }
  }

  // --- Rail click handlers ---
  railSteps.forEach(function(btn, idx) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      goToScene(idx);
    });
  });

  // --- Swipe between scenes (touch) ---
  let touchStartX = null;
  sticky.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  sticky.addEventListener('touchend', function(e) {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) > 40) goToScene((activeScene + (dx < 0 ? 1 : TOTAL_SCENES - 1)) % TOTAL_SCENES);
  }, { passive: true });

  // --- IntersectionObserver: only animate when in view ---
  const observer = new IntersectionObserver(function(entries) {
    isInView = entries[0].isIntersecting;
    if (isInView) {
      startAutoPlay();
      if (frameId === null) frameId = requestAnimationFrame(render);
    } else {
      stopAutoPlay();
    }
  }, { threshold: 0 });
  observer.observe(container);

  // --- Scroll scrubbing + idle auto-advance (desktop) ---
  let lastProgress = -1;
  let lastActivity = performance.now();

  function updateFromScroll(now) {
    const progress = getSectionProgress(track);
    const position = progress * TOTAL_SCENES;
    setScene(Math.min(Math.floor(position), TOTAL_SCENES - 1));

    if (progressBar) progressBar.style.transform = 'scaleX(' + progress + ')';
    scrollPhase += (progress * 14 - scrollPhase) * 0.12;

    // Compare against the position at the last activity, not the previous frame,
    // so Locomotive's slow inertia tail doesn't count as the user still scrolling
    if (Math.abs(progress - lastProgress) > 0.01) {
      lastProgress = progress;
      lastActivity = now;
      return;
    }

    // Only auto-advance while the stage is fully pinned in the viewport
    const rect = track.getBoundingClientRect();
    const isPinned = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    if (isPinned && now - lastActivity > IDLE_DELAY && activeScene < TOTAL_SCENES - 1) {
      lastActivity = now;
      goToScene(activeScene + 1);
    }
  }

  // --- Canvas Rendering ---
  function render(now) {
    if (!isInView) {
      frameId = null;
      return;
    }
    frameId = requestAnimationFrame(render);

    if (isScrubbed) updateFromScroll(now);

    time += 0.02;
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var cx = w > 991 ? w * 0.66 : w * 0.5;
    var cy = h * 0.5;
    var t = time + scrollPhase;

    ctx.save();
    ctx.translate(cx, cy);

    // Ambient glow
    var glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 320);
    glow.addColorStop(0, 'rgba(255, 229, 0, 0.16)');
    glow.addColorStop(0.6, 'rgba(255, 229, 0, 0.03)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 320, 0, Math.PI * 2);
    ctx.fill();

    // Draw the active scene
    switch (activeScene) {
      case 0: drawPortal(ctx, t); break;
      case 1: drawArchitecture(ctx, t); break;
      case 2: drawEngineering(ctx, t); break;
      case 3: drawSpatial(ctx, t); break;
      case 4: drawLaunchpad(ctx, t); break;
    }

    ctx.restore();
  }

  // --- Scene 1: Studio Entrance Portal ---
  function drawPortal(ctx, t) {
    ctx.rotate(0.2);
    for (var i = 0; i < 4; i++) {
      var r = 80 + i * 45;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.55, t * 0.4 + i * 0.2, 0, Math.PI * 2);
      ctx.strokeStyle = i === 0 ? '#FFE500' : 'rgba(255, 229, 0, 0.3)';
      ctx.lineWidth = i === 0 ? 2.5 : 1;
      ctx.stroke();
    }
    for (var n = 0; n < 8; n++) {
      var angle = (n / 8) * Math.PI * 2 + t * 0.6;
      var x = Math.cos(angle) * 160;
      var y = Math.sin(angle) * 88;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE500';
      ctx.shadowColor = '#FFE500';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // --- Scene 2: Architecture Lab Blueprint ---
  function drawArchitecture(ctx, t) {
    var spacing = 48;
    ctx.rotate(-0.15);
    ctx.strokeStyle = 'rgba(255, 229, 0, 0.2)';
    ctx.lineWidth = 1;
    for (var x = -5; x <= 5; x++) {
      ctx.beginPath();
      ctx.moveTo(x * spacing, -180);
      ctx.lineTo(x * spacing, 180);
      ctx.stroke();
    }
    for (var y = -4; y <= 4; y++) {
      ctx.beginPath();
      ctx.moveTo(-5 * spacing, y * spacing);
      ctx.lineTo(5 * spacing, y * spacing);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.rect(-70, -70, 140, 140);
    ctx.strokeStyle = '#FFE500';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 95 + Math.sin(t * 2) * 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 229, 0, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // --- Scene 3: Engineering Code Core ---
  function drawEngineering(ctx, t) {
    var nodes = 14;
    for (var i = 0; i < nodes; i++) {
      var a = (i / nodes) * Math.PI * 2 + t * 0.5;
      var d = 110 + Math.sin(t * 3 + i) * 25;
      var x = Math.cos(a) * d;
      var y = Math.sin(a) * d * 0.7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 229, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE500';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 36 + Math.sin(t * 4) * 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE500';
    ctx.shadowColor = '#FFE500';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // --- Scene 4: Spatial Realm ---
  function drawSpatial(ctx, t) {
    var rot = t * 0.8;
    for (var c = 0; c < 3; c++) {
      var s = 100 * (1 - c * 0.28);
      ctx.save();
      ctx.rotate(rot * (c % 2 === 0 ? 1 : -1) + c * 0.4);
      ctx.beginPath();
      ctx.rect(-s / 2, -s / 2, s, s);
      ctx.strokeStyle = c === 0 ? '#FFE500' : 'rgba(255, 229, 0, 0.35)';
      ctx.lineWidth = c === 0 ? 2 : 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  // --- Scene 5: Launchpad ---
  function drawLaunchpad(ctx, t) {
    for (var r = 1; r <= 4; r++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * 50, 0, Math.PI * 2);
      ctx.strokeStyle = r === 4 ? '#FFE500' : 'rgba(255, 229, 0, 0.25)';
      ctx.lineWidth = r === 4 ? 2 : 1;
      ctx.stroke();
    }
    ctx.save();
    ctx.rotate(t * 1.5);
    var grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
    grad.addColorStop(0, 'rgba(255, 229, 0, 0.3)');
    grad.addColorStop(1, 'rgba(255, 229, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 200, 0, Math.PI * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // --- Init ---
  setScene(0);
}
