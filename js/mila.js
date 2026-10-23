// Mila's handwritten name. Her letters start apart, each in its own ink, and
// gather into one word.
//
// An instance is driven by set(p, { spread, time }):
//   spread  how far apart the separate letters sit (1 is the drawing's own spacing)
//   p       the joining gesture: 0 is four letters, 1 is the signature. The
//           letters travel, the inks turn to one color, and the i is dotted last.
// The story page uses spread while the visitor walks through the rooms, and p
// once, at the end.
//
// The geometry is cut from Mila's drawing (assets/handwriting/p_*.png) and
// was ported from the Claude Design file (mila.jsx, animations-v3.jsx).
//
// Usage: Mila.create(element, { tone, crop }) returns { set }.
// Elements with data-mila="static" are drawn joined on load, with no motion.
(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const IMG_DIR = new URL('../assets/handwriting/', document.currentScript.src).href;
  // Named views of the 1920×1080 drawing: [x, y, width, height].
  const CROPS = {
    apart: [240, 105, 1440, 775],   // the four letters at their own spacing
    wide: [120, 105, 1680, 775],    // room for a wider spread
    joined: [630, 140, 680, 740],   // just the signature
  };
  const CENTER_X = 960;

  // Each letter's own ink, then the one ink they share once joined.
  const INKS = {
    dark: { M: '#8fa4d2', I: '#8db79c', L: '#d9907e', A: '#b59bd2', end: '#f0e8dd' },
    light: { M: '#1f3a8a', I: '#14532d', L: '#991b1b', A: '#581c87', end: '#2a201c' },
  };
  // When each letter travels, as a share of p (the original timeline). Then
  // the extra strokes fade, the inks unify, and the dot lands last.
  const WINDOWS = { M: [0.04, 0.6, 'move'], I: [0.04, 0.6, 'move'], L: [0.08, 0.64, 'move'], A: [0.12, 0.74, 'smooth'] };
  const UNIFY = [0.32, 0.74];
  const DOT = [0.78, 1];

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const cl = (v) => clamp(v, 0, 1);
  const EASE = {
    smooth: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
    move: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
  };
  const prog = (p, [a, b], ease = EASE.smooth) => ease(cl((p - a) / (b - a)));
  const lerp = (a, b, t) => a + (b - a) * t;
  const bump = (p, [a, b]) => Math.sin(Math.PI * cl((p - a) / (b - a)));
  const mixHex = (a, b, t) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };

  // "mat" pieces move as one whole shape; "seg" pieces map one stroke onto another.
  const S = 1.6;
  const SEP0 = [960 - 500 * S, 540 - 398 * S], MER0 = [960 - 562 * S, 540 - 993 * S];
  const sep = (q) => [SEP0[0] + q[0] * S, SEP0[1] + q[1] * S];
  const mer = (q) => [MER0[0] + q[0] * S, MER0[1] + q[1] * S];
  const PIECES = [{"id":"M","L":"M","kind":"mat","M":[1,0,0,1,191,600]},{"id":"I","L":"I","kind":"seg","a":[485,220],"b":[420,500],"A":[680,822],"B":[596,1190]},{"id":"Iu","L":"I","kind":"mat","M":[1,0,0,1,170,610],"merge":"stem"},{"id":"L1","L":"L","kind":"seg","a":[612,215],"b":[535,545],"A":[680,822],"B":[600,1110],"merge":"stem"},{"id":"L2","L":"L","kind":"seg","a":[535,545],"b":[665,510],"A":[600,1110],"B":[648,1090],"merge":"stem"},{"id":"A","L":"A","kind":"mat","M":[0.9465935441127756,0.4394714564393242,0.14792594501085796,0.7538002870919062,-79.44521329456366,461.9027200117781]}];
  const BOXES = {"M":[190,215,308,313],"I":[402,211,96,287],"Iu":[401,360,135,164],"L1":[524,211,103,344],"L2":[524,502,146,85],"A":[633,252,179,248],"dot":[490,283,33,40]};
  const DOT_SRC = [507, 303], DOT_DST = [700, 780];

  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const ang = (v) => Math.atan2(v[1], v[0]);
  const len = (v) => Math.hypot(v[0], v[1]);
  const deg = (r) => (r * 180 / Math.PI).toFixed(3);
  const canvasMat = (M) => [M[0], M[1], M[2], M[3],
    S * M[4] + MER0[0] - (M[0] * SEP0[0] + M[2] * SEP0[1]),
    S * M[5] + MER0[1] - (M[1] * SEP0[0] + M[3] * SEP0[1])];

  // Where each letter sits while apart, so "spread" can push it further out.
  const LETTER_BOXES = { M: ['M'], I: ['I', 'Iu', 'dot'], L: ['L1', 'L2'], A: ['A'] };
  const letterX = {};
  for (const L in LETTER_BOXES) {
    const xs = LETTER_BOXES[L].flatMap((id) => [BOXES[id][0], BOXES[id][0] + BOXES[id][2]]);
    letterX[L] = sep([(Math.min(...xs) + Math.max(...xs)) / 2, 0])[0];
  }
  const PHASE = { M: 0, I: 1.7, L: 3.1, A: 4.4 };

  let uid = 0;
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  function create(root, { tone = 'dark', crop = 'apart', float = 0 } = {}) {
    const inks = INKS[tone] || INKS.dark;
    const [CX, CY, CW, CH] = CROPS[crop] || CROPS.apart;
    root.style.aspectRatio = `${CW} / ${CH}`;
    const id = 'mila' + (++uid);
    const stage = document.createElement('div');
    stage.className = 'mila-stage';
    const svg = el('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080', 'aria-hidden': 'true', focusable: 'false' }, stage);
    const defs = el('defs', {}, svg);
    const floods = {};
    ['M', 'I', 'L', 'A'].forEach((L) => {
      const f = el('filter', { id: `${id}-${L}`, x: 0, y: 0, width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' }, defs);
      floods[L] = el('feFlood', { 'flood-color': inks[L] }, f);
      el('feComposite', { in2: 'SourceAlpha', operator: 'in' }, f);
    });
    const all = el('g', {}, svg);
    const parts = PIECES.map((pc) => {
      const box = BOXES[pc.id], o = sep([box[0], box[1]]);
      const g = el('g', {}, all);
      el('image', { href: IMG_DIR + 'p_' + pc.id + '.png', x: o[0], y: o[1], width: box[2] * S, height: box[3] * S, filter: `url(#${id}-${pc.L})` }, g);
      return { pc, g };
    });
    const dbox = BOXES.dot, dO = sep([dbox[0], dbox[1]]);
    const dot = el('g', {}, all);
    el('image', { href: IMG_DIR + 'p_dot.png', x: dO[0], y: dO[1], width: dbox[2] * S, height: dbox[3] * S, filter: `url(#${id}-I)` }, dot);
    root.appendChild(stage);

    // Fit the crop to the container.
    const measure = () => {
      const scale = (root.clientWidth || 400) / CW;
      stage.style.transform = `scale(${scale}) translate(${-CX}px, ${-CY}px)`;
    };
    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(root);

    let spread = 1;
    let lastUnify = -1;
    // Extra offset while a letter is still apart: pushed out by "spread",
    // drifting gently by "float".
    const apart = (L, t, time) => {
      const k = 1 - t;
      const dx = (letterX[L] - CENTER_X) * (spread - 1) * k;
      const dy = float ? Math.sin(time * 0.0007 + PHASE[L]) * float * k : 0;
      return [dx, dy];
    };

    function set(p, opts = {}) {
      p = cl(p);
      spread = opts.spread ?? 1;
      const time = opts.time ?? 0;
      const unify = prog(p, UNIFY);
      // Only touch the ink filters when the color actually changes; redrawing
      // a filter is the expensive part of a frame.
      if (unify !== lastUnify) {
        for (const L in floods) floods[L].setAttribute('flood-color', mixHex(inks[L], inks.end, unify));
        lastUnify = unify;
      }

      const motion = {};
      for (const L in WINDOWS) {
        const [a, b, ease] = WINDOWS[L];
        motion[L] = { t: prog(p, [a, b], EASE[ease]), lift: (L === 'A' ? -90 : -45) * bump(p, [a, a + (b - a) * 0.9]) };
      }

      for (const { pc, g } of parts) {
        const { t, lift } = motion[pc.L];
        const [ox, oy] = apart(pc.L, t, time);
        let tf;
        if (pc.kind === 'mat') {
          const M = canvasMat(pc.M), I = [1, 0, 0, 1, 0, 0];
          const m = I.map((v, j) => lerp(v, M[j], t));
          m[4] += ox; m[5] += lift + oy;
          tf = `matrix(${m.map((v) => v.toFixed(4)).join(' ')})`;
        } else {
          const a = sep(pc.a), b = sep(pc.b), A = mer(pc.A), B = mer(pc.B);
          const a2 = [lerp(a[0], A[0], t) + ox, lerp(a[1], A[1], t) + lift + oy];
          const b2 = [lerp(b[0], B[0], t) + ox, lerp(b[1], B[1], t) + lift + oy];
          const m0 = mid(a, b), m = mid(a2, b2), th0 = ang(sub(b, a)), k = len(sub(b2, a2)) / len(sub(b, a));
          tf = `translate(${m[0].toFixed(2)} ${m[1].toFixed(2)}) rotate(${deg(ang(sub(b2, a2)))}) scale(${k.toFixed(4)} 1) rotate(${deg(-th0)}) translate(${(-m0[0]).toFixed(2)} ${(-m0[1]).toFixed(2)})`;
        }
        g.setAttribute('transform', tf);
        g.setAttribute('opacity', pc.merge ? (1 - unify).toFixed(3) : 1);
      }

      // The dot travels with the i, waits just above the word, and lands last.
      const di = motion.I, [dx0, dy0] = apart('I', di.t, time);
      const ds = sep(DOT_SRC), dd = mer(DOT_DST);
      const above = [dd[0] + 14, dd[1] - 110];
      const wait = [lerp(ds[0] + dx0, above[0], di.t), lerp(ds[1] + dy0, above[1], di.t) + di.lift];
      const land = prog(p, DOT, EASE.move);
      const x = lerp(wait[0], dd[0], land) - ds[0], y = lerp(wait[1], dd[1], land) - ds[1];
      dot.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    }

    set(0);
    return { set };
  }

  window.Mila = { create };

  // Static signatures (About, Contact): joined, no motion.
  document.querySelectorAll('[data-mila="static"]').forEach((node) => {
    create(node, { tone: node.dataset.tone || 'dark', crop: 'joined' }).set(1);
  });
})();
