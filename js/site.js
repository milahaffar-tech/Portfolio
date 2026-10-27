// Shared by every page. Pieces fade in as they reach the screen.
//
// On the Work page each project keeps its own light: pointing at a card
// lends the page that project's colors for a moment, and on touch screens a
// card's cover lifts as it passes. Nothing names it; the color just changes.
// On case pages, the drawing beside each section draws itself in. On the
// homepage, Mila's handwritten M opens out into its four letters as soon as
// the page opens.
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

  // Opens on her M, waits a beat once at least half of el is on screen, then
  // lets the letters out, each into its own ink. Once apart they keep
  // drifting a little on their own while they are on screen.
  function expand(el, sign, { spread = 1, delay = 0, duration = 3000 } = {}) {
    if (reduce) { sign.set(0, { spread }); return; }
    let visible = false, running = false, start = 0, waitUntil = 0;
    const frame = (now) => {
      if (!visible) { running = false; return; }
      if (!start && now >= waitUntil) start = now;
      const s = start ? clamp01((now - start) / duration) : 0;
      sign.set(1 - s, { spread, time: now });
      requestAnimationFrame(frame);
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible || running) return;
      if (!start) waitUntil = performance.now() + delay;
      running = true;
      requestAnimationFrame(frame);
    }, { threshold: 0.5 }).observe(el);
    sign.set(1, { spread });
  }

  // The opening: her M, a beat to see it whole, then the four letters.
  const heroEl = document.querySelector('[data-mila="hero"]');
  if (heroEl) expand(heroEl, Mila.create(heroEl, { crop: 'wide', float: 16, gesture: 'expand' }), { spread: 1.6, delay: 600, duration: 2800 });
})();
