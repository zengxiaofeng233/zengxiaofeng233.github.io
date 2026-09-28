import { ambientItems, flowLines, DEPTH_SHIFT, TIER_DEPTH, ARCS } from '../data/ambient.js';

const EASE = 0.07;        // parallax lag — the layer drifts after the cursor
const NEAR_EASE = 0.12;   // proximity response
const REST = 0.02;        // below this the layer is considered settled

// The eased value approaches zero asymptotically and never quite lands on it, so
// a settled layer would otherwise keep writing "-0.00px". Anything that rounds to
// zero is written as zero.
const fmt = (value, suffix) => `${Math.abs(value) < 0.005 ? '0.00' : value.toFixed(2)}${suffix}`;

// Each contour is drawn in once, staggered, then the two strongest carry a
// "runner": a short bright dash that laps the same trajectory like a car on
// track. `--i` feeds the stagger; the runner's own delay keeps the two apart.
function flowSvg() {
  const attrs = (line, i) => `d="${line.d}" pathLength="1" transform="translate(0 ${line.offset || 0})" vector-effect="non-scaling-stroke" fill="none" style="--i:${i}"`;
  const paths = flowLines.map((line, i) =>
    `<path class="flow-line" ${attrs(line, i)} data-tint="${line.tint}" data-kind="${line.kind}" stroke-opacity="${line.opacity}"></path>`,
  ).join('');
  const runners = flowLines.filter(line => line.kind === 'solid').map((line, i) =>
    `<path class="flow-runner" ${attrs(line, i)}></path>`,
  ).join('');
  return `<svg class="hero-flow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${paths}${runners}</svg>`;
}

// pathLength normalises every stroke to 1, so one draw-in keyframe fits all.
function art(item) {
  if (item.shape === 'arc') {
    return `<svg class="amb-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${ARCS[item.variant]}" pathLength="1" vector-effect="non-scaling-stroke" fill="none"></path></svg>`;
  }
  if (item.shape === 'triangle') {
    return '<svg class="amb-art" viewBox="0 0 30 26" preserveAspectRatio="none" aria-hidden="true"><polygon points="1,25 15,1 29,25" pathLength="1" vector-effect="non-scaling-stroke" fill="none"></polygon></svg>';
  }
  return '';
}

function markup(item, index) {
  const vars = [
    `--x:${item.x}`, `--y:${item.y}`, `--w:${item.w}`, `--h:${item.h}`,
    `--rot:${item.rot}`, `--base:${item.opacity}`, `--i:${index}`,
    ...(item.near ? [`--push:${item.near.push}`, `--spin:${item.near.spin}`] : []),
  ].join(';');
  return `<i class="amb" data-tier="${item.tier}" data-depth="${TIER_DEPTH[item.tier]}" data-shape="${item.shape}"${item.near ? ' data-near="1"' : ''} style="${vars}">${art(item)}</i>`;
}

// Seeded from data, driven from the hero's one pointer loop.
//
// Three things move an ambient item, and they compose in CSS rather than in JS:
//   --px/--py   depth parallax, one variable per tier written once per frame
//   --near-*    proximity, only on the handful of items marked `near`
//   --rise      the lift the whole layer takes while the lens is open
// Everything is a read-modify-write of a custom property on an already-painted
// element, so nothing here forces layout.
export function mountAmbient(hero, pointer) {
  const host = hero.querySelector('.hero-ambient');
  host.innerHTML = flowSvg() + ambientItems.map(markup).join('');

  const nodes = [...host.querySelectorAll('.amb')];
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
    // trails rather than sticks to the pointer. Reduced motion skips it outright
    // rather than merely tightening the response.
    const tx = s.ready && s.inside && !s.idle && !s.paused && !s.reduced ? (s.nx - 0.5) * 2 : 0;
    const ty = s.ready && s.inside && !s.idle && !s.paused && !s.reduced ? (s.ny - 0.5) * 2 : 0;
    const ease = s.reduced ? 1 : EASE;
    ex += (tx - ex) * ease;
    ey += (ty - ey) * ease;

    // The ease never quite arrives, so once the remainder is imperceptible the
    // layer is landed exactly on the target. That is what makes "quiet at rest"
    // literally true rather than true to two decimals.
    let busy = Math.abs(tx - ex) > REST || Math.abs(ty - ey) > REST;
    if (!busy) { ex = tx; ey = ty; }

    for (const depth of [1, 2, 3]) {
      const shift = DEPTH_SHIFT[depth];
      hero.style.setProperty(`--px${depth}`, fmt(ex * shift, 'px'));
      hero.style.setProperty(`--py${depth}`, fmt(ey * shift * 0.5, 'px'));
    }

    // Proximity. Only the marked items, and only while the menu is closed — the
    // menu takes over as the focus and the layer settles behind it.
    const live = s.ready && s.inside && !s.idle && !s.paused && !s.reduced;
    for (const target of near) {
      const want = live ? Math.max(0, 1 - Math.hypot(s.x - target.cx, s.y - target.cy) / target.reach) : 0;
      target.value += (want - target.value) * (s.reduced ? 1 : NEAR_EASE);
      if (Math.abs(want - target.value) > REST) busy = true;
      else target.value = want;

      const v = target.value;
      if (v < 0.002) {
        for (const name of ['--near-x', '--near-y', '--near-r', '--near-s', '--near-o']) {
          target.node.style.removeProperty(name);
        }
        continue;
      }
      // Pushed away from the cursor, never toward it.
      const dx = target.cx - s.x, dy = target.cy - s.y;
      const len = Math.hypot(dx, dy) || 1;
      target.node.style.setProperty('--near-x', fmt((dx / len) * target.push * v, 'px'));
      target.node.style.setProperty('--near-y', fmt((dy / len) * target.push * v, 'px'));
      target.node.style.setProperty('--near-r', fmt((dx / len) * target.spin * v, 'deg'));
      target.node.style.setProperty('--near-s', (1 + 0.03 * v).toFixed(3));
      target.node.style.setProperty('--near-o', v.toFixed(3));
    }

    return busy;
  }

  pointer.onMeasure(measure);
  pointer.onFrame(frame);
}
