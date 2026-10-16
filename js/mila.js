// Hero signature. Mila's handwritten letters start apart, each in its own ink,
// then gather into one graphite word as the visitor scrolls at the top of the
// page. Ported from MilaScroll in the Claude Design file (mila.jsx, with the
// easing and clamp helpers from animations-v3.jsx) to plain DOM + SVG.
(() => {
  const root = document.getElementById('mila');
  if (!root) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const IMG_DIR = 'assets/handwriting/';
  const SCROLL_LENGTH = 600; // wheel pixels to go from apart to joined
  const CROP_X = 240, CROP_W = 1440, CROP_Y = 105;

  // each letter starts in its own deep ink, then all turn to graphite black as they merge
  const LETTER_INK = { M: '#1f3a8a', I: '#14532d', L: '#991b1b', A: '#581c87' };
  const BLACK = '#201e1d';
  const mixHex = (a, b, t) => {
    const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const Easing = {
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
    easeOutBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
  };
  const MOTION = { move: Easing.easeOutBack, smooth: Easing.easeInOutCubic, fade: Easing.easeInOutCubic };
  const cl = (v) => clamp(v, 0, 1);
  const prog = (T, a, b, ease) => ease(cl((T - a) / (b - a)));
  const lerp = (a, b, p) => a + (b - a) * p;
  const bump = (T, a, b) => Math.sin(Math.PI * cl((T - a) / (b - a)));

  // scene timeline (OM_SCENES): each cue is the scene's start time
  const SCENES = [['Write', 0.4], ['Individuals', 0.1], ['Gather', 0.7], ['Hold', 0.8]];
  const CUES = {};
  let END = 0;
  SCENES.forEach(([name, dur]) => { CUES[name] = END; END += dur; });
  const G = CUES.Gather;
  const T0 = CUES.Gather, T1 = CUES.Hold + 0.1;

  // all ink is cut from Mila's drawing (handwriting/p_*.png). Coordinates are the drawing's pixels.
  // "mat" pieces move as one whole shape (no cuts, so they can't break); "seg" pieces map one stroke onto another.
  const S = 1.6;
  const SEP0 = [960 - 500 * S, 540 - 398 * S], MER0 = [960 - 562 * S, 540 - 993 * S];
  const sep = (p) => [SEP0[0] + p[0] * S, SEP0[1] + p[1] * S];
  const mer = (p) => [MER0[0] + p[0] * S, MER0[1] + p[1] * S];
  const PIECES = [{"id":"M","L":"M","kind":"mat","M":[1,0,0,1,191,600]},{"id":"I","L":"I","kind":"seg","a":[485,220],"b":[420,500],"A":[680,822],"B":[596,1190]},{"id":"Iu","L":"I","kind":"mat","M":[1,0,0,1,170,610],"merge":"stem"},{"id":"L1","L":"L","kind":"seg","a":[612,215],"b":[535,545],"A":[680,822],"B":[600,1110],"merge":"stem"},{"id":"L2","L":"L","kind":"seg","a":[535,545],"b":[665,510],"A":[600,1110],"B":[648,1090],"merge":"stem"},{"id":"A","L":"A","kind":"mat","M":[0.9465935441127756,0.4394714564393242,0.14792594501085796,0.7538002870919062,-79.44521329456366,461.9027200117781]}];
  const BOXES = {"M":[190,215,308,313],"I":[402,211,96,287],"Iu":[401,360,135,164],"L1":[524,211,103,344],"L2":[524,502,146,85],"A":[633,252,179,248],"dot":[490,283,33,40]};
  const DOT_SRC = [507, 303], DOT_DST = [700, 780];
  const TIMING = { M: [0.03, 0.45, 'move'], I: [0.03, 0.45, 'move'], L: [0.06, 0.45, 'move'], A: [0.1, 0.5, 'smooth'] };

  const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const ang = (v) => Math.atan2(v[1], v[0]);
  const len = (v) => Math.hypot(v[0], v[1]);
  const deg = (r) => (r * 180 / Math.PI).toFixed(3);
  // a drawing-space matrix expressed in canvas space (start frame -> end frame)
  const canvasMat = (M) => [M[0], M[1], M[2], M[3],
    S * M[4] + MER0[0] - (M[0] * SEP0[0] + M[2] * SEP0[1]),
    S * M[5] + MER0[1] - (M[1] * SEP0[0] + M[3] * SEP0[1])];

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  // — build the drawing once; frame() only updates attributes —
  const stage = document.createElement('div');
  stage.className = 'mila-stage';
  const svg = el('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080', 'aria-hidden': 'true' }, stage);
  const defs = el('defs', {}, svg);
  const floods = {};
  ['M', 'I', 'L', 'A'].forEach((L) => {
    const f = el('filter', { id: 'mila-ink' + L, x: 0, y: 0, width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' }, defs);
    floods[L] = el('feFlood', { 'flood-color': LETTER_INK[L] }, f);
    el('feComposite', { in2: 'SourceAlpha', operator: 'in' }, f);
  });
  const all = el('g', {}, svg);
  const parts = PIECES.map((pc) => {
    const box = BOXES[pc.id], o = sep([box[0], box[1]]);
    const g = el('g', {}, all);
    el('image', { href: IMG_DIR + 'p_' + pc.id + '.png', x: o[0], y: o[1], width: box[2] * S, height: box[3] * S, filter: 'url(#mila-ink' + pc.L + ')' }, g);
    return { pc, g };
  });
  const dbox = BOXES.dot, dO = sep([dbox[0], dbox[1]]);
  const dot = el('g', {}, all);
  el('image', { href: IMG_DIR + 'p_dot.png', x: dO[0], y: dO[1], width: dbox[2] * S, height: dbox[3] * S, filter: 'url(#mila-inkI)' }, dot);
  root.appendChild(stage);

  function frame(T) {
    const stemFade = 1 - prog(T, G + 0.25, G + 0.45, MOTION.fade);
    const out = 1 - prog(T, END - 0.35, END, MOTION.fade);
    const toBlack = prog(T, G + 0.25, G + 0.6, MOTION.fade);
    const motion = (L) => {
      const [t0, dur, ease] = TIMING[L];
      return { p: prog(T, G + t0, G + t0 + dur, MOTION[ease]), lift: (L === 'A' ? -90 : -45) * bump(T, G + t0, G + t0 + dur * 0.9) };
    };

    for (const L in floods) floods[L].setAttribute('flood-color', mixHex(LETTER_INK[L], BLACK, toBlack));
    all.setAttribute('opacity', out);

    for (const { pc, g } of parts) {
      const { p, lift } = motion(pc.L);
      let tf;
      if (pc.kind === 'mat') {
        const M = canvasMat(pc.M), I = [1, 0, 0, 1, 0, 0];
        const m = I.map((v, j) => lerp(v, M[j], p)); m[5] += lift;
        tf = `matrix(${m.map(v => v.toFixed(4)).join(' ')})`;
      } else {
        const a = sep(pc.a), b = sep(pc.b), A = mer(pc.A), B = mer(pc.B);
        const a2 = [lerp(a[0], A[0], p), lerp(a[1], A[1], p) + lift], b2 = [lerp(b[0], B[0], p), lerp(b[1], B[1], p) + lift];
        const m0 = mid(a, b), m = mid(a2, b2), th0 = ang(sub(b, a)), k = len(sub(b2, a2)) / len(sub(b, a));
        tf = `translate(${m[0].toFixed(2)} ${m[1].toFixed(2)}) rotate(${deg(ang(sub(b2, a2)))}) scale(${k.toFixed(4)} 1) rotate(${deg(-th0)}) translate(${(-m0[0]).toFixed(2)} ${(-m0[1]).toFixed(2)})`;
      }
      g.setAttribute('transform', tf);
      g.setAttribute('opacity', pc.merge ? stemFade : 1);
    }

    const dm = motion('I'), ds = sep(DOT_SRC), dd = mer(DOT_DST);
    dot.setAttribute('transform', `translate(${((dd[0] - ds[0]) * dm.p).toFixed(2)} ${((dd[1] - ds[1]) * dm.p + dm.lift).toFixed(2)})`);
  }

  // — fit the 1440×775 crop to the container —
  const measure = () => {
    const scale = (root.clientWidth || 400) / CROP_W;
    stage.style.transform = `scale(${scale}) translate(${-CROP_X}px, ${-CROP_Y}px)`;
  };
  measure();
  new ResizeObserver(measure).observe(root);

  // — scroll scrubbing: at the very top of the page, wheel / touch / keys drive
  // the letters together (or apart) before the page itself starts to scroll —
  let p = 0, raf = 0;
  const render = () => { raf = 0; frame(T0 + p * (T1 - T0)); };

  // reduced motion: show the joined signature and leave scrolling alone
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    p = 1;
    render();
    return;
  }
  if (window.scrollY > 4) p = 1; // arrived mid-page (reload, #link): start joined
  render();

  const push = (dy) => {
    if (window.scrollY > 0) return false;
    if ((dy > 0 && p >= 1) || (dy < 0 && p <= 0)) return false;
    p = clamp(p + dy / SCROLL_LENGTH, 0, 1);
    if (!raf) raf = requestAnimationFrame(render);
    return true;
  };
  window.addEventListener('wheel', (e) => { if (push(e.deltaY)) e.preventDefault(); }, { passive: false });
  let ty = null;
  window.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (ty == null) return;
    const y = e.touches[0].clientY, dy = (ty - y) * 1.5;
    ty = y;
    if (push(dy)) e.preventDefault();
  }, { passive: false });
  window.addEventListener('keydown', (e) => {
    const step = { ArrowDown: 60, ArrowUp: -60, PageDown: 300, PageUp: -300, ' ': 300 }[e.key];
    if (step == null) return;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (push(step)) e.preventDefault();
  });
})();
