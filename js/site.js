// Shared by every page. Pieces fade in as they reach the screen.
//
// On the Work page each project keeps its own light: pointing at a card
// lends the page that project's colors for a moment, and on touch screens a
// card's cover lifts as it passes. Nothing names it; the color just changes.
// On case pages, the drawing beside each section draws itself in. On the
// homepage, Mila's handwritten M opens into its four letters and closes
// again, twice, as soon as the page opens.
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

  // — touch screens have no hover, so a cover lifts as it passes the upper
  // part of the screen (seen closed first, then opened) —
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

  // Her M opens into its four letters and closes again, twice, then rests as
  // the M. Starts once at least half of el is on screen. While apart, the
  // letters drift a little on their own.
  const OPEN_CLOSE = [
    { hold: 700 },            // her M
    { to: 0, ms: 1900 },      // opens into M, i, L, A
    { hold: 900 },
    { to: 1, ms: 1900 },      // closes back into the M
    { hold: 600 },
    { to: 0, ms: 1900 },      // and once more
    { hold: 900 },
    { to: 1, ms: 1900 },
  ];
  function openAndClose(el, sign, { spread = 1, steps = OPEN_CLOSE } = {}) {
    sign.set(1, { spread });
    if (reduce) return;
    // When each step starts and what p it starts from.
    let t = 0, p = 1;
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
      if (step.hold) {
        sign.set(step.from, { spread, time: now, gesture: step.from === 0 ? 'expand' : 'gather' });
      } else {
        const k = clamp01((elapsed - step.at) / step.ms);
        sign.set(step.from + (step.to - step.from) * k, { spread, time: now, gesture: step.to === 0 ? 'expand' : 'gather' });
      }
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
  if (heroEl) openAndClose(heroEl, Mila.create(heroEl, { crop: 'wide', float: 16 }), { spread: 1.6 });
})();
