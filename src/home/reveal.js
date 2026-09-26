import { cars, CATEGORY_GROUP } from '../data/cars.js';

// Per-frame follow factor for the window. Low enough to read as inertia, high
// enough that the car under the cursor never feels detached from it.
const EASE = 0.16;
const SETTLE = 0.3;   // px below which the follow loop parks itself

// The reveal, rebuilt around one idea: the wordmark is no longer the aperture.
//
// Clipping to the letters meant a cursor anywhere but dead-centre on a stroke
// showed a wheel and a slice of nose. Now the clip is the AWTC Overall Zone —
// the brand box the mark sits in (see .hero-zone) — so the window can cross the
// black letterforms, the counters inside them and the gaps between them, and
// still never escape the mark's own footprint.
//
// What shows through is a single car, not a strip: five pre-sized windows ride
// on one shared stage, and only the window whose car the cursor is nearest to is
// faded in. Switching is a crossfade, and each window keeps its own proportions,
// so an open-wheeler gets a longer, lower band than a GT.
export function initReveal(hero, pointer) {
  const layer = hero.querySelector('.car-reveal');
  const zone = hero.querySelector('.hero-zone');
  const mark = hero.querySelector('.giant-logo');
  const stage = hero.querySelector('.car-stage');
  const readout = hero.querySelector('.hero-readout');
  const windows = [...hero.querySelectorAll('.car-window')];

  let zoneBox = { x: 0, y: 0, w: 0, h: 0 };
  const sizes = new Map();            // car id -> the window's rendered box
  let targetX = 0, targetY = 0;       // where the cursor is
  let currentX = 0, currentY = 0;     // where the window actually is
  let armX = 0, armY = 0;             // the clamped resting spot
  let car = cars[0];
  let shownCategory = '';
  let wasOpen = false;

  const clamp = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.min(Math.max(v, lo), hi));

  // Everything above is measured in hero coordinates, but the stage itself sits
  // at the zone's top-left corner — so the zone origin comes off again here, at
  // the one place the position is actually written.
  function place(x, y) {
    stage.style.setProperty('--sx', `${(x - zoneBox.x).toFixed(2)}px`);
    stage.style.setProperty('--sy', `${(y - zoneBox.y).toFixed(2)}px`);
  }

  // Keep the whole window inside the zone. Without this the window would hang
  // over the edge and the clip would halve the car — the exact failure this
  // rewrite exists to fix.
  //
  // The size comes from the element, not from re-deriving --su here: the windows
  // are media-query dependent (see the 760px block in home.css) and a second copy
  // of that arithmetic would silently disagree with the first.
  function boundsFor(spec) {
    const { w, h } = sizes.get(spec.id) || { w: 0, h: 0 };
    return {
      minX: zoneBox.x + w / 2, maxX: zoneBox.x + zoneBox.w - w / 2,
      minY: zoneBox.y + h / 2, maxY: zoneBox.y + zoneBox.h - h / 2,
    };
  }

  function insideZone(s) {
    return s.x >= zoneBox.x && s.x <= zoneBox.x + zoneBox.w
        && s.y >= zoneBox.y && s.y <= zoneBox.y + zoneBox.h;
  }

  // Judged from the cursor's own position, never from the window: the window has
  // inertia and would lag the car behind the pointer.
  function nearestCar(s) {
    const nx = (s.x - zoneBox.x) / zoneBox.w;
    const ny = (s.y - zoneBox.y) / zoneBox.h;
    let best = Infinity, pick = car;
    for (const item of cars) {
      const dx = nx - item.hotspotX;
      const dy = ny - item.hotspotY;
      const distance = dx * dx + dy * dy;
      if (distance < best) { best = distance; pick = item; }
    }
    return pick;
  }

  function show(next, force = false) {
    if (next === car && !force) return;
    car = next;
    for (const node of windows) node.classList.toggle('is-current', node.dataset.car === car.id);
    // The readout and the ambient layer both trail the active car, so they only
    // change when the category does — three of the five cars are GT3.
    if (car.category === shownCategory) return;
    shownCategory = car.category;
    for (const node of readout.children) node.classList.toggle('is-current', node.dataset.program === car.category);
    // Sticky by design: leaving the mark fades the window but keeps the last
    // programme lit, so the hero never snaps back to an empty state.
    hero.dataset.activeCategory = CATEGORY_GROUP[car.category] || '';
  }

  function measure(heroRect) {
    const zoneRect = zone.getBoundingClientRect();
    zoneBox = {
      x: zoneRect.left - heroRect.left,
      y: zoneRect.top - heroRect.top,
      w: zoneRect.width,
      h: zoneRect.height,
    };
    // offsetWidth/Height ignore the -50% centring translate and the clip, so they
    // give the window's true box — including the shear the parallelogram adds.
    for (const node of windows) {
      sizes.set(node.dataset.car, { w: node.offsetWidth, h: node.offsetHeight });
    }

    if (!wasOpen) {
      const { minX, maxX, minY, maxY } = boundsFor(car);
      armX = clamp(zoneBox.x + zoneBox.w / 2, minX, maxX);
      armY = clamp(zoneBox.y + zoneBox.h / 2, minY, maxY);
      targetX = currentX = armX;
      targetY = currentY = armY;
      place(armX, armY);
    }
  }

  function frame(s) {
    // Before the first real measurement (the hero is display:none behind the
    // loader) every box is zero, so there is nothing meaningful to place yet.
    if (!zoneBox.w) return false;

    const open = s.ready && !s.paused && insideZone(s);
    layer.classList.toggle('is-active', open);

    if (open && !wasOpen) {
      // Snap on re-entry: sweeping in from wherever the cursor last left would
      // race the window across all five cars.
      targetX = currentX = s.x;
      targetY = currentY = s.y;
      // A programme only becomes current once a car is actually on screen, so
      // the readout never claims a category nobody has reached. Forced, because
      // the car under the cursor may be the one already armed.
      show(nearestCar(s), true);
    }
    wasOpen = open;

    if (open) {
      targetX = s.x;
      targetY = s.y;
      show(nearestCar(s));
    }

    const ease = s.reduced ? 1 : EASE;
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;

    const { minX, maxX, minY, maxY } = boundsFor(car);
    place(clamp(currentX, minX, maxX), clamp(currentY, minY, maxY));

    // Park once the window has caught up. The cursor being inside the zone is not
    // by itself a reason to keep drawing: a stationary pointer would otherwise
    // hold the loop open at 60fps for as long as it rested on the mark.
    return Math.abs(targetX - currentX) > SETTLE || Math.abs(targetY - currentY) > SETTLE;
  }

  pointer.onMeasure(measure);
  pointer.onFrame(frame);

  // The mark scales in as the loader hands over, so re-measure once it settles.
  mark.addEventListener('animationend', () => pointer.measure(), { signal: pointer.signal });
  window.addEventListener('awtc:home-ready', () => pointer.measure(), { signal: pointer.signal });

  // Armed with the first car, but nothing is announced and no window is faded in
  // until the cursor actually opens the reveal.
  measure(hero.getBoundingClientRect());
}
