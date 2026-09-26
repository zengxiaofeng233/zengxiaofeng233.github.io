import { ambientItems, DEPTH_SHIFT } from '../data/ambient.js';

// Contour strokes for the `arc` shapes. They are stretched to each item's box,
// so the paths are drawn in a loose 100x40 space and never re-authored.
const ARCS = [
  'M0 32 Q 26 4 58 12 T 100 6',
  'M0 30 Q 30 30 52 14 T 100 20',
  'M0 22 Q 34 2 64 26 T 100 14',
];

const EASE = 0.07;        // parallax lag — the layer drifts after the cursor
const NEAR_EASE = 0.12;   // proximity response
const REST = 0.02;        // below this the layer is considered settled

// The eased value approaches zero asymptotically and never quite lands on it, so
// a settled layer would otherwise keep writing "-0.00px". Anything that rounds to
// zero is written as zero.
const fmt = (value, suffix) => `${Math.abs(value) < 0.005 ? '0.00' : value.toFixed(2)}${suffix}`;

function art(item) {
  if (item.shape === 'arc') {
    return `<svg class="amb-art" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="${ARCS[item.variant % ARCS.length]}" vector-effect="non-scaling-stroke" fill="none"/></svg>`;
  }
  if (item.shape === 'triangle') {
    return '<svg class="amb-art" viewBox="0 0 30 26" preserveAspectRatio="none" aria-hidden="true"><polygon points="1,25 15,1 29,25" vector-effect="non-scaling-stroke" fill="none"/></svg>';
  }
  return '';
}

function markup(item) {
  const vars = [
    `--x:${item.x}`, `--y:${item.y}`, `--w:${item.w}`, `--h:${item.h}`,
    `--rot:${item.rot}`, `--base:${item.opacity}`,
    ...(item.near ? [`--push:${item.near.push}`, `--spin:${item.near.spin}`] : []),
  ].join(';');
  const drop = item.sm === false ? ' data-sm="0"' : '';
  return `<i class="amb" data-shape="${item.shape}" data-group="${item.group}" data-depth="${item.depth}"${item.near ? ' data-near="1"' : ''}${drop} style="${vars}">${art(item)}</i>`;
}

// Seeded from data, driven from the hero's one pointer loop.
//
// Three things move an ambient item, and they compose in CSS rather than in JS:
//   --px/--py   depth parallax, one variable per tier written once per frame
//   --near-*    proximity, only on the handful of items marked `near`
//   --group-x   the active racing programme nudging its own shapes
// Everything is a read-modify-write of a custom property on an already-painted
// element, so nothing here forces layout.
export function mountAmbient(hero, pointer) {
  const host = hero.querySelector('.hero-ambient');
  host.innerHTML = ambientItems.map(markup).join('');

  const nodes = [...host.children];
  const near = ambientItems
    .map((item, i) => (item.near ? { ...item.near, node: nodes[i], cx: 0, cy: 0, value: 0 } : null))
    .filter(Boolean);

  let ex = 0, ey = 0;

  function measure(heroRect) {
    for (const target of near) {
      const rect = target.node.getBoundingClientRect();
      target.cx = rect.left - heroRect.left + rect.width / 2;
      target.cy = rect.top - heroRect.top + rect.height / 2;
    }
  }

  function frame(s) {
    // Parallax. The cursor's offset from the hero centre, eased, so the layer
    // trails rather than sticks to the pointer.
    const tx = s.ready ? (s.nx - 0.5) * 2 : 0;
    const ty = s.ready ? (s.ny - 0.5) * 2 : 0;
    const ease = s.reduced ? 1 : EASE;
    ex += (tx - ex) * ease;
    ey += (ty - ey) * ease;

    // The ease approaches the target asymptotically and never arrives, so once
    // the remainder is imperceptible the layer is landed exactly on it. That is
    // what makes "quiet at rest" literally true rather than true to two decimals.
    let busy = Math.abs(tx - ex) > REST || Math.abs(ty - ey) > REST;
    if (!busy) { ex = tx; ey = ty; }

    for (const depth of [1, 2, 3]) {
      const shift = DEPTH_SHIFT[depth];
      hero.style.setProperty(`--px${depth}`, fmt(ex * shift, 'px'));
      hero.style.setProperty(`--py${depth}`, fmt(ey * shift * 0.5, 'px'));
    }

    // Proximity. Only the marked items, and only while the menu is closed — the
    // menu takes over as the focus and the layer settles behind it.
    const live = s.ready && s.inside && !s.paused;
    for (const target of near) {
      const want = live ? Math.max(0, 1 - Math.hypot(s.x - target.cx, s.y - target.cy) / target.reach) : 0;
      target.value += (want - target.value) * (s.reduced ? 1 : NEAR_EASE);
      if (Math.abs(want - target.value) > REST) busy = true;

      const v = target.value;
      if (v < 0.002) {
        target.node.style.removeProperty('--near-x');
        target.node.style.removeProperty('--near-y');
        target.node.style.removeProperty('--near-r');
        target.node.style.removeProperty('--near-s');
        target.node.style.removeProperty('--near-o');
        continue;
      }
      // Pushed away from the cursor, never toward it.
      const dx = target.cx - s.x, dy = target.cy - s.y;
      const len = Math.hypot(dx, dy) || 1;
      target.node.style.setProperty('--near-x', fmt((dx / len) * target.push * v, 'px'));
      target.node.style.setProperty('--near-y', fmt((dy / len) * target.push * v, 'px'));
      target.node.style.setProperty('--near-r', fmt((dx / len) * target.spin * v, 'deg'));
      target.node.style.setProperty('--near-s', (1 + 0.04 * v).toFixed(3));
      target.node.style.setProperty('--near-o', v.toFixed(3));
    }

    return busy;
  }

  pointer.onMeasure(measure);
  pointer.onFrame(frame);
}
