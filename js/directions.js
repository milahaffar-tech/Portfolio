// Three directions from Mila's survey, to try on the live site. Each one
// leans on a different part of her answers; the switcher in the corner swaps
// between them on every page.
//
// The choice is set as data-direction on <html> (styles in css/styles.css),
// remembered in this browser, and kept in the address as ?direction=… so a
// link opens straight into one. A small script in each page's <head> applies
// it before first paint.
//
// Once she picks one, delete this file, its <script> tag and the
// "— directions —" styles, and keep only the chosen direction's rules.
(() => {
  const DIRECTIONS = [
    {
      id: 'velvet', name: 'Velvet', theme: '#241916', swatch: ['#241916', '#c9a978'],
      note: 'Golden hour after dark. Each project is a lit room in an evening exhibition: velvet, film grain, letters in colored ink.',
      from: 'Dark, alive with motion, museum exhibitions, velvet, film grain.',
    },
    {
      id: 'notebook', name: 'Notebook', theme: '#f0e8dd', swatch: ['#f0e8dd', '#5e2a30'],
      note: 'A personal diary. Cream paper, ruled lines, photos taped onto the page, notes in the margin, graphite handwriting.',
      from: 'Diary entry, handwritten letter, notebooks and sketchbooks, golden hour.',
    },
    {
      id: 'stone', name: 'Stone', theme: '#e8dfd2', swatch: ['#e8dfd2', '#a5532f'],
      note: 'A slow stay at a Mediterranean hotel. Warm limestone, arched doorways, shutter shadows, a card left on the pillow.',
      from: 'Aman, boutique hotels, Aegean stone, ceramic, living room.',
    },
  ];
  const root = document.documentElement;
  const byId = Object.fromEntries(DIRECTIONS.map((d) => [d.id, d]));
  const current = () => (byId[root.dataset.direction] ? root.dataset.direction : 'velvet');

  // Arriving from a ?direction= link: remember it for the other pages.
  try {
    const fromUrl = new URLSearchParams(location.search).get('direction');
    if (byId[fromUrl]) localStorage.setItem('direction', fromUrl);
  } catch (e) { /* storage blocked: the choice lasts for this page only */ }

  // — the switcher —
  const panel = document.createElement('div');
  panel.className = 'directions';
  const note = document.createElement('p');
  note.className = 'directions-note';
  note.setAttribute('aria-live', 'polite');
  const bar = document.createElement('div');
  bar.className = 'directions-bar';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Try a direction');
  const label = document.createElement('span');
  label.className = 'directions-label';
  label.textContent = 'Try a direction';
  bar.appendChild(label);
  const buttons = DIRECTIONS.map((d) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.pick = d.id;
    b.innerHTML = `<span class="directions-swatch" style="--a: ${d.swatch[0]}; --b: ${d.swatch[1]}" aria-hidden="true"></span>${d.name}`;
    b.addEventListener('click', () => apply(d.id, true));
    bar.appendChild(b);
    return b;
  });
  panel.append(note, bar);
  document.body.appendChild(panel);

  let hideTimer = 0, switchTimer = 0;
  const showNote = (ms) => {
    panel.classList.add('show-note');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => panel.classList.remove('show-note'), ms);
  };

  function render() {
    const d = byId[current()];
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pick === d.id)));
    note.innerHTML = `<strong>${d.name}.</strong> ${d.note}<span class="directions-from">From the survey: ${d.from}</span>`;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = d.theme;
  }

  function apply(id, fromClick) {
    if (!byId[id]) return;
    // a quicker crossfade for a switch than for walking between rooms
    root.classList.add('is-switching');
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => root.classList.remove('is-switching'), 900);
    root.dataset.direction = id;
    render();
    if (window.Mila && window.Mila.retone) window.Mila.retone();
    if (!fromClick) return;
    try { localStorage.setItem('direction', id); } catch (e) { /* see above */ }
    try {
      const url = new URL(location.href);
      url.searchParams.set('direction', id);
      history.replaceState(history.state, '', url);
    } catch (e) { /* address stays as it was */ }
    showNote(6000);
  }

  render();
  // Introduce the switcher once per visit, not on every page.
  let introduced = false;
  try { introduced = sessionStorage.getItem('direction-intro') === '1'; sessionStorage.setItem('direction-intro', '1'); } catch (e) { /* show it */ }
  if (!introduced) setTimeout(() => showNote(6500), 900);
})();
