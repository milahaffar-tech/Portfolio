// Shared by every page. Pieces fade in as they reach the screen.
//
// On the Work page each project keeps its own light: pointing at a card
// lends the page that project's colors for a moment, and on touch screens a
// card's cover lifts as it passes. Nothing names it; the color just changes.
// On the homepage, Mila's handwritten letters gather into her M as soon as
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

  // — the M —
  if (!window.Mila) return;

  // Plays the joining gesture once, when at least half of el is on screen.
  // While the letters wait apart they drift a little on their own.
  function gather(el, sign, { spread = 1, delay = 0, duration = 3000 } = {}) {
    if (reduce) { sign.set(1); return; }
    let visible = false, start = 0, running = false, done = false;
    const frame = (now) => {
      if (!visible && !start) { running = false; return; }
      if (!start && now >= waitUntil) start = now;
      const p = start ? clamp01((now - start) / duration) : 0;
      sign.set(p, { spread, time: now });
      if (p < 1) requestAnimationFrame(frame);
      else { running = false; done = true; }
    };
    let waitUntil = 0;
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible || running || done) return;
      waitUntil = performance.now() + delay;
      running = true;
      requestAnimationFrame(frame);
    }, { threshold: 0.5 }).observe(el);
    sign.set(0, { spread });
  }

  // The opening: four letters, a beat to see them apart, then her M.
  const heroEl = document.querySelector('[data-mila="hero"]');
  if (heroEl) gather(heroEl, Mila.create(heroEl, { crop: 'wide', float: 16 }), { spread: 1.6, delay: 1000, duration: 3000 });
})();
