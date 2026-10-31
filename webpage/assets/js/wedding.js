/**
 * /wedding live demo: a guest's invitation (left) wired to the family's headcount panel (right).
 * All numbers are demo data. The phone grows with its content instead of scrolling inside,
 * because an inner scroll area fights Locomotive's wheel handling on desktop.
 */
import { updateLocoScroll, scrollToSectionProgress } from './loco-scroll.js';

const COUPLE = 'Meera & Arjun';
const TOTAL_FAMILIES = 316;
const SEEN_BASE = 268; // families outside the demo who have opened the invite

// base = the rest of the guest list, before the three demo families reply
const FUNCTIONS = {
  haldi: {
    name: 'Haldi',
    day: 19, start: [10, 0], hours: 3,
    when: 'Fri 19 Feb · 10:00 AM',
    where: 'The Mehta home, Malviya Nagar, Jaipur',
    note: 'Wear yellow, and clothes you don’t mind getting stained.',
    dir: 'Lane opposite the park gate. Park on the main road; it’s a two-minute walk.',
    base: { invited: 42, coming: 61, awaiting: 9 },
  },
  sangeet: {
    name: 'Sangeet',
    day: 19, start: [19, 30], hours: 4,
    when: 'Fri 19 Feb · 7:30 PM',
    changedStart: [20, 30],
    changedWhen: 'Fri 19 Feb · 8:30 PM',
    where: 'Shree Vatika Gardens, Tonk Road, Jaipur',
    note: 'Indo-western, and shoes you can dance in.',
    dir: 'Enter by Gate 2 on Tonk Road. Parking in the east lawn; valet from 7 PM.',
    base: { invited: 186, coming: 312, awaiting: 41 },
  },
  wedding: {
    name: 'Wedding',
    day: 20, start: [19, 0], hours: 5,
    when: 'Sat 20 Feb · 7:00 PM · pheras at 9:15 PM',
    where: 'Shree Vatika Gardens, Lotus Lawn',
    note: 'Traditional wear.',
    dir: 'Gate 2, then follow the marigold path to Lotus Lawn. Ramp at the side entrance.',
    base: { invited: 240, coming: 455, awaiting: 58 },
  },
  reception: {
    name: 'Reception',
    day: 21, start: [20, 0], hours: 3,
    when: 'Sun 21 Feb · 8:00 PM',
    where: 'Hall B, Hotel Aravali Grand, MI Road, Jaipur',
    note: 'Evening formal.',
    dir: 'Hall B is on the first floor; take the lift beside the lobby. Hotel parking is free for guests.',
    base: { invited: 310, coming: 520, awaiting: 97 },
  },
};

const GUESTS = {
  sharma: { greet: 'Dear Sharma family', fns: ['haldi', 'sangeet', 'wedding', 'reception'], max: 4, simple: false },
  kabir: { greet: 'Hey Kabir', fns: ['sangeet', 'reception'], max: 2, simple: false },
  nani: { greet: 'Namaste Nani-ji', fns: ['haldi', 'wedding'], max: 2, simple: true },
};

export function initWeddingDemo() {
  initDemoLink();
  initFaq();

  const root = document.querySelector('[data-wedding-demo]');
  if (!root) return;

  const screen = root.querySelector('[data-invite]');
  const guestButtons = [...root.querySelectorAll('[data-guest]')];
  const simpleToggle = root.querySelector('[data-simple-toggle]');
  const rows = root.querySelector('[data-panel-rows]');
  const seenEl = root.querySelector('[data-panel-seen]');
  const log = root.querySelector('[data-panel-log]');
  const changeBtn = root.querySelector('[data-simulate-change]');

  // Screen-reader announcements for the guest side live outside the re-rendered markup
  const live = document.createElement('p');
  live.className = 'wd-sr';
  live.setAttribute('role', 'status');
  screen.after(live);

  const state = {
    guest: 'sharma',
    simple: false,
    changed: false,
    replies: { sharma: {}, kabir: {}, nani: {} }, // fnId -> number of people (0 = not coming)
    activeFn: { sharma: 'haldi', kabir: 'sangeet', nani: 'haldi' },
    seen: new Set(['sharma']),
    toast: '',
  };

  function fnTime(fn) {
    return state.changed && fn.changedWhen ? fn.changedWhen : fn.when;
  }

  function statusText(reply) {
    if (reply === undefined) return { text: 'Not replied yet', cls: '' };
    if (reply === 0) return { text: 'Not coming. Thank you for letting us know.', cls: 'is-no' };
    return { text: `✓ ${reply} ${reply === 1 ? 'person' : 'people'} coming`, cls: 'is-yes' };
  }

  function fnBlock(id, guest) {
    const fn = FUNCTIONS[id];
    const reply = state.replies[state.guest][id];
    const status = statusText(reply);
    const when = state.changed && fn.changedWhen
      ? `<del>${fn.when.split(' · ')[1]}</del>${fnTime(fn)}`
      : fn.when;

    return `
      <div class="wd-inv__fn" id="wd-fn-${id}" ${state.simple ? '' : 'role="tabpanel"'} aria-label="${fn.name}">
        <p class="wd-inv__fn-name">${fn.name}</p>
        <p class="wd-inv__fn-when">${when}</p>
        <p class="wd-inv__fn-where">${fn.where}</p>
        <p class="wd-inv__fn-note">${fn.note}</p>
        <div class="wd-inv__rsvp">
          <p class="wd-inv__rsvp-q" id="wd-q-${id}">How many of you are coming?</p>
          <div class="wd-stepper" role="group" aria-labelledby="wd-q-${id}">
            <button type="button" data-step="-1" data-fn="${id}" aria-label="One fewer person for ${fn.name}" ${reply === 0 ? 'disabled' : ''}>−</button>
            <output aria-live="off">${reply ?? 0}</output>
            <button type="button" data-step="1" data-fn="${id}" aria-label="One more person for ${fn.name}" ${reply === guest.max ? 'disabled' : ''}>+</button>
          </div>
          <p class="wd-inv__status ${status.cls}">${status.text}</p>
        </div>
        <div class="wd-inv__dir">
          <p><strong>Getting there</strong></p>
          <p>${fn.dir}</p>
          <div class="wd-inv__actions">
            <button type="button" class="wd-inv__action" data-ics="${id}">Add to calendar</button>
            <button type="button" class="wd-inv__action" data-maps="${id}">Open in Maps</button>
          </div>
        </div>
      </div>`;
  }

  function renderInvite({ entering = false, focus = null } = {}) {
    const guest = GUESTS[state.guest];
    const replies = state.replies[state.guest];
    const active = state.activeFn[state.guest];
    const seats = guest.max === 1 ? '1 seat' : `${guest.max} seats`;
    const showBanner = state.changed && guest.fns.includes('sangeet');

    const tabs = state.simple ? '' : `
      <div class="wd-inv__tabs" role="tablist" aria-label="Your functions">
        ${guest.fns.map((id) => `
          <button type="button" class="wd-inv__tab ${replies[id] === undefined ? 'is-pending' : ''}" role="tab"
            id="wd-tab-${id}" data-tab="${id}" aria-controls="wd-fn-${id}"
            aria-selected="${id === active}" tabindex="${id === active ? 0 : -1}">${FUNCTIONS[id].name}</button>`).join('')}
      </div>`;

    const body = state.simple
      ? guest.fns.map((id) => fnBlock(id, guest)).join('')
      : fnBlock(active, guest);

    screen.innerHTML = `
      <div class="wd-inv ${state.simple ? 'is-simple' : ''} ${entering ? 'is-entering' : ''}">
        <div class="wd-inv__head">
          <p class="wd-inv__bless">With the blessings of our families</p>
          <p class="wd-inv__names">Meera <span>&amp;</span> Arjun</p>
          <p class="wd-inv__dates">19 – 21 February 2027 · Jaipur</p>
        </div>
        ${showBanner ? '<p class="wd-inv__banner"><strong>Updated:</strong> the sangeet now starts at 8:30 PM (was 7:30 PM).</p>' : ''}
        <p class="wd-inv__greet">${guest.greet}, you’re invited to <strong>${guest.fns.length} functions</strong>. We’ve kept <strong>${seats}</strong> for you.</p>
        ${tabs}
        ${body}
        <p class="wd-inv__toast" data-toast role="status">${state.toast}</p>
        <p class="wd-inv__foot">Questions? Reply on WhatsApp to “${COUPLE}’s wedding desk”.</p>
      </div>`;

    // Re-rendering drops focus; put it back on the first candidate that can take it
    if (focus) {
      const el = [].concat(focus)
        .map((sel) => screen.querySelector(sel))
        .find((node) => node && !node.disabled);
      if (el) el.focus({ preventScroll: true });
    }
    updateLocoScroll();
  }

  function renderPanel(flashId = null) {
    rows.innerHTML = Object.entries(FUNCTIONS).map(([id, fn]) => {
      let { invited, coming, awaiting } = fn.base;
      Object.entries(GUESTS).forEach(([gid, g]) => {
        if (!g.fns.includes(id)) return;
        invited += 1;
        const reply = state.replies[gid][id];
        if (reply === undefined) awaiting += 1;
        else coming += reply;
      });
      const label = id === 'sangeet' && state.changed ? `${fn.name} <small>(8:30 PM)</small>` : fn.name;
      return `<tr class="${id === flashId ? 'is-flash' : ''}"><td>${label}</td><td>${invited}</td><td>${coming}</td><td>${awaiting}</td></tr>`;
    }).join('');

    seenEl.textContent = `${SEEN_BASE + state.seen.size} of ${TOTAL_FAMILIES} families`;

    if (flashId) {
      setTimeout(() => {
        const row = rows.querySelector('.is-flash');
        if (row) row.classList.remove('is-flash');
      }, 900);
    }
  }

  function selectGuest(id) {
    state.guest = id;
    state.simple = GUESTS[id].simple;
    state.toast = '';
    simpleToggle.checked = state.simple;
    state.seen.add(id);
    guestButtons.forEach((btn) => {
      const on = btn.dataset.guest === id;
      btn.setAttribute('aria-checked', String(on));
      btn.tabIndex = on ? 0 : -1;
    });
    renderInvite({ entering: true });
    renderPanel();
  }

  // Guest picker behaves as a radio group: click, or arrow keys to move between options
  guestButtons.forEach((btn, i) => {
    btn.tabIndex = btn.getAttribute('aria-checked') === 'true' ? 0 : -1;
    btn.addEventListener('click', () => selectGuest(btn.dataset.guest));
    btn.addEventListener('keydown', (e) => {
      const delta = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!delta) return;
      e.preventDefault();
      const next = guestButtons[(i + delta + guestButtons.length) % guestButtons.length];
      next.focus();
      selectGuest(next.dataset.guest);
    });
  });

  simpleToggle.addEventListener('change', () => {
    state.simple = simpleToggle.checked;
    renderInvite();
  });

  screen.addEventListener('click', (e) => {
    const step = e.target.closest('[data-step]');
    const tab = e.target.closest('[data-tab]');
    const ics = e.target.closest('[data-ics]');
    const maps = e.target.closest('[data-maps]');

    if (tab) {
      state.activeFn[state.guest] = tab.dataset.tab;
      state.toast = '';
      renderInvite({ focus: `[data-tab="${tab.dataset.tab}"]` });
    } else if (step) {
      const id = step.dataset.fn;
      const max = GUESTS[state.guest].max;
      const current = state.replies[state.guest][id];
      const next = current === undefined
        ? (step.dataset.step === '1' ? 1 : 0)
        : Math.min(Math.max(current + Number(step.dataset.step), 0), max);
      state.replies[state.guest][id] = next;
      state.toast = '';
      const other = step.dataset.step === '1' ? '-1' : '1';
      renderInvite({ focus: [`[data-step="${step.dataset.step}"][data-fn="${id}"]`, `[data-step="${other}"][data-fn="${id}"]`] });
      renderPanel(id);
      live.textContent = `${FUNCTIONS[id].name}: ${statusText(next).text}`;
    } else if (ics) {
      downloadIcs(ics.dataset.ics);
    } else if (maps) {
      state.toast = 'Demo invite: on a real one, this opens Google Maps at the right gate.';
      const toast = screen.querySelector('[data-toast]');
      if (toast) toast.textContent = state.toast;
    }
  });

  screen.addEventListener('keydown', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (!tab || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const fns = GUESTS[state.guest].fns;
    const i = fns.indexOf(tab.dataset.tab);
    const next = fns[(i + (e.key === 'ArrowRight' ? 1 : -1) + fns.length) % fns.length];
    state.activeFn[state.guest] = next;
    renderInvite({ focus: `[data-tab="${next}"]` });
  });

  changeBtn.addEventListener('click', () => {
    state.changed = !state.changed;
    changeBtn.setAttribute('aria-pressed', String(state.changed));
    changeBtn.textContent = state.changed
      ? 'Undo the change'
      : 'Simulate a change: sangeet moves to 8:30 PM';
    const invited = FUNCTIONS.sangeet.base.invited + Object.values(GUESTS).filter((g) => g.fns.includes('sangeet')).length;
    log.textContent = state.changed
      ? `Change alert sent to the ${invited} families invited to the sangeet. Their invitation and calendar entry now say 8:30 PM.`
      : 'Change undone. In a real wedding we’d send a correction the same way.';
    renderInvite();
    renderPanel('sangeet');
  });

  function downloadIcs(id) {
    const fn = FUNCTIONS[id];
    const [h, m] = state.changed && fn.changedStart ? fn.changedStart : fn.start;
    // Times are IST (UTC+5:30); convert to UTC so every calendar app agrees
    const start = new Date(Date.UTC(2027, 1, fn.day, h, m) - 330 * 60000);
    const end = new Date(start.getTime() + fn.hours * 3600000);
    const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => `\\${c}`);
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sanvium Technologies//Wedding demo//EN',
      'BEGIN:VEVENT',
      `UID:${id}-meera-arjun-demo@sanviumtechnologies.com`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${esc(`${fn.name} · ${COUPLE}`)}`,
      `LOCATION:${esc(fn.where)}`,
      `DESCRIPTION:${esc(fn.dir)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fn.name.toLowerCase()}-meera-arjun.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  selectGuest('sharma');
}

// "Open the demo" link: Locomotive moves content with transforms, so native anchor jumps miss
function initDemoLink() {
  const link = document.querySelector('[data-scroll-to-demo]');
  const demo = document.getElementById('demo');
  if (!link || !demo) return;

  link.addEventListener('click', (e) => {
    if (!document.documentElement.classList.contains('has-scroll-smooth')) return;
    e.preventDefault();
    scrollToSectionProgress(demo, 0);
  });
}

// FAQ accordions change the page height; Locomotive needs to re-measure
function initFaq() {
  document.querySelectorAll('.wd-faq__item').forEach((item) => {
    item.addEventListener('toggle', updateLocoScroll);
  });
}
