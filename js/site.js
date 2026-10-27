// Shared by every page. Pieces fade in as they reach the screen.
//
// On the homepage it also does the rest:
// - Mila's handwritten letters gather into her M as soon as the page opens,
//   so every visitor sees it, and gather once more at the end.
// - Each project keeps its own light. The page's light shifts to it as its
//   chapter reaches the middle of the screen, or while a cover in the grid
//   is pointed at. Nothing names it; the color just changes.
// - On touch screens a chapter's cover lifts as it passes.
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

  // — the light: whichever section crosses the middle of the screen —
  const dock = document.querySelector('.dock');
  const topbar = document.querySelector('.topbar');
  const dockNum = dock && dock.querySelector('.dock-num');
  const dockChapter = dock && dock.querySelector('.dock-chapter');
  let scrollWorld = root.dataset.world;
  let pointedWorld = null;
  const paint = () => { root.dataset.world = pointedWorld || scrollWorld; };
  const setSection = (section) => {
    scrollWorld = section.dataset.world;
    paint();
    if (dock) {
      const num = section.dataset.num;
      if (num) {
        dockNum.textContent = `${num} of VI`;
        dockChapter.textContent = section.dataset.chapter || '';
      }
      dock.classList.toggle('is-on', Boolean(num));
      if (topbar) topbar.classList.toggle('is-docked', Boolean(num));
    }
  };
  const worlds = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) setSection(e.target);
  }, { rootMargin: '-50% 0px -50% 0px' });
  document.querySelectorAll('main > [data-world]').forEach((s) => worlds.observe(s));

  // Pointing at a project in the grid lends the page its light for a moment.
  document.querySelectorAll('.index-item[data-world]').forEach((item) => {
    const on = () => { pointedWorld = item.dataset.world; paint(); };
    const off = () => { pointedWorld = null; paint(); };
    item.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') on(); });
    item.addEventListener('pointerleave', off);
    item.addEventListener('focusin', on);
    item.addEventListener('focusout', off);
  });

  // — touch screens have no hover, so a chapter's cover lifts as it passes
  // the upper part of the screen (seen closed first, then opened) —
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

  const heroEl = document.querySelector('[data-mila="hero"]');
  const finaleEl = document.querySelector('[data-mila="finale"]');

  // At the top: four letters, a beat to see them apart, then her M.
  if (heroEl) gather(heroEl, Mila.create(heroEl, { crop: 'wide', float: 16 }), { spread: 1.6, delay: 1000, duration: 3000 });
  // At the end, for anyone who read every chapter: the same gesture again.
  if (finaleEl) gather(finaleEl, Mila.create(finaleEl, { crop: 'apart', float: 10 }), { spread: 1.15, delay: 400, duration: 2800 });
})();
