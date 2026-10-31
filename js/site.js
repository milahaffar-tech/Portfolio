// Shared by every page. Pieces fade in as they reach the screen.
//
// On the Work page each project keeps its own light: pointing at a card
// lends the page that project's colors for a moment, and its cover's palette
// bleeds across it like ink (on touch screens, as it passes). Nothing names
// it; the color just changes. On case pages, the drawing beside each section
// draws itself in. On the homepage, Mila's four handwritten letters start
// apart and come together into her M as soon as the page opens.
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  // — entrances —
  const reveal = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      reveal.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  document.querySelectorAll('[data-reveal]').forEach((n) => reveal.observe(n));

  // — the light: pointing at a project lends the page its world —
  const pageWorld = root.dataset.world;
  document.querySelectorAll('.work-item[data-world]').forEach((item) => {
    const on = () => { root.dataset.world = item.dataset.world; };
    const off = () => { root.dataset.world = pageWorld; };
    item.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') on(); });
    item.addEventListener('pointerleave', off);
    item.addEventListener('focusin', on);
    item.addEventListener('focusout', off);
  });

  // — the ink on each cover bleeds in from wherever the pointer comes in, and
  // draws back toward wherever it leaves —
  document.querySelectorAll('.work-card').forEach((card) => {
    const box = card.querySelector('.box');
    if (!box) return;
    const from = (e) => {
      const r = box.getBoundingClientRect();
      box.style.setProperty('--x', `${(clamp01((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      box.style.setProperty('--y', `${(clamp01((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    card.addEventListener('pointerenter', from);
    card.addEventListener('pointerleave', from);
  });

  // — touch screens have no hover, so a cover's ink spreads as it passes the
  // upper part of the screen (seen as the photo first, then the palette) —
  if (window.matchMedia('(hover: none)').matches) {
    const lids = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle('is-open', e.isIntersecting);
    }, { rootMargin: '-12% 0px -60% 0px' });
    document.querySelectorAll('.box').forEach((b) => lids.observe(b));
  }

  // — the drawings on case pages draw themselves in when they reach the screen —
  if (!reduce) {
    document.querySelectorAll('.case-illo').forEach((fig) => {
      fig.querySelectorAll('.ink').forEach((line, i) => {
        const len = line.getTotalLength();
        line.style.strokeDasharray = `${len} ${len}`;
        line.style.strokeDashoffset = len;
        line.style.transitionDelay = `${150 + i * 70}ms, 900ms`;
      });
      fig.classList.add('is-drawing');
    });
  }

  // — the M —
  if (!window.Mila) return;

  // Her four letters start apart, drifting a little on their own, then come
  // together into her M and rest there. Starts once at least half of el is
  // on screen.
  const GATHER = [
    { hold: 900 },            // M, i, L, A, apart
    { to: 1, ms: 2600 },      // they come together into her M
  ];
  function gather(el, sign, { spread = 1, steps = GATHER } = {}) {
    if (reduce) { sign.set(1, { spread }); return; }
    sign.set(0, { spread, gesture: 'gather' });
    // When each step starts and what p it starts from.
    let t = 0, p = 0;
    const plan = steps.map((step) => {
      const s = { ...step, at: t, from: p };
      t += step.hold || step.ms;
      if (step.to !== undefined) p = step.to;
      return s;
    });
    const total = t;
    let start = 0;
    const frame = (now) => {
      if (!start) start = now;
      const elapsed = now - start;
      let step = plan[0];
      for (const s of plan) if (s.at <= elapsed) step = s;
      if (elapsed >= total) { sign.set(1, { spread, gesture: 'gather' }); return; }
      const k = step.hold ? 0 : clamp01((elapsed - step.at) / step.ms);
      const to = step.to ?? step.from;
      sign.set(step.from + (to - step.from) * k, { spread, time: now, gesture: 'gather' });
      requestAnimationFrame(frame);
    };
    const seen = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      seen.disconnect();
      requestAnimationFrame(frame);
    }, { threshold: 0.5 });
    seen.observe(el);
  }

  const heroEl = document.querySelector('[data-mila="hero"]');
  if (heroEl) gather(heroEl, Mila.create(heroEl, { crop: 'wide', float: 16 }), { spread: 1.6 });
})();
