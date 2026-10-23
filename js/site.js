// Shared by every page. Pieces fade in as they reach the screen.
//
// On the story page (index.html) it also does the rest: as each room reaches
// the middle of the screen the light changes to that room's world, and on
// touch screens its cover lifts. Mila's name follows along: four separate
// letters in the prologue, drifting closer room by room in the top bar, and
// joining into her signature in the epilogue.
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
  const setWorld = (section) => {
    root.dataset.world = section.dataset.world;
    if (dock && section.dataset.num) {
      dockNum.textContent = `Room ${section.dataset.num} of VI`;
      dockChapter.textContent = section.dataset.chapter || '';
    }
  };
  const worlds = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) setWorld(e.target);
  }, { rootMargin: '-50% 0px -50% 0px' });
  document.querySelectorAll('main > [data-world]').forEach((s) => worlds.observe(s));

  // — touch screens have no hover, so a cover lifts as it passes the upper
  // part of the screen (seen closed first, then opened) —
  if (window.matchMedia('(hover: none)').matches) {
    const lids = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle('is-open', e.isIntersecting);
    }, { rootMargin: '-12% 0px -60% 0px' });
    document.querySelectorAll('.box').forEach((b) => lids.observe(b));
  }

  // — the name —
  if (!window.Mila) return;
  const heroEl = document.querySelector('[data-mila="hero"]');
  const dockEl = document.querySelector('[data-mila="dock"]');
  const finaleEl = document.querySelector('[data-mila="finale"]');
  const firstRoom = document.querySelector('.room');
  const epilogue = document.querySelector('.epilogue');

  const hero = heroEl && Mila.create(heroEl, { crop: 'wide', float: reduce ? 0 : 16 });
  const mini = dockEl && Mila.create(dockEl, { crop: 'wide' });
  const finale = finaleEl && Mila.create(finaleEl, { crop: 'apart' });

  // How far apart the letters sit: wide in the prologue, closer with each
  // room, at their own spacing by the epilogue.
  const HERO_SPREAD = [1.7, 1.55];
  const ROOMS_SPREAD = [1.55, 1];

  let heroSpread = HERO_SPREAD[0];
  let heroVisible = true;
  let raf = 0;

  function update() {
    raf = 0;
    const vh = window.innerHeight;
    const y = window.scrollY;

    if (hero && heroEl) {
      const h = heroEl.closest('section') || heroEl;
      const t = clamp01(y / Math.max(1, h.offsetHeight));
      heroSpread = HERO_SPREAD[0] + (HERO_SPREAD[1] - HERO_SPREAD[0]) * t;
      if (reduce) hero.set(0, { spread: heroSpread });
    }

    if (mini && firstRoom && epilogue) {
      const start = firstRoom.offsetTop, end = epilogue.offsetTop;
      const mid = y + vh / 2;
      const r = clamp01((mid - start) / Math.max(1, end - start));
      mini.set(0, { spread: ROOMS_SPREAD[0] + (ROOMS_SPREAD[1] - ROOMS_SPREAD[0]) * r });
      const on = mid > start && mid < end;
      dock.classList.toggle('is-on', on);
      if (topbar) topbar.classList.toggle('is-docked', on);
    }

    if (finale && finaleEl) {
      const rect = finaleEl.getBoundingClientRect();
      const f = reduce ? 1 : clamp01((vh * 0.92 - rect.top) / (vh * 0.55));
      finale.set(f);
    }
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // The prologue letters drift a little on their own while they are on screen.
  if (hero && !reduce) {
    new IntersectionObserver(([e]) => {
      heroVisible = e.isIntersecting;
      if (heroVisible) requestAnimationFrame(float);
    }).observe(heroEl);
    const float = (time) => {
      if (!heroVisible) return;
      hero.set(0, { spread: heroSpread, time });
      requestAnimationFrame(float);
    };
  }
})();
