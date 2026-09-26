import { cars } from '../data/home.js';

const EASE = 0.16;      // per-frame follow factor; the window is small, so stay crisp
const SETTLE = 0.4;     // px below which the follow loop parks itself
const PROBE_W = 512;    // alpha probe resolution for the ink test (source is 4096 wide)

// The wordmark is the aperture. This module never moves the racing layer: it only
// publishes the cursor position, and home.css intersects two clips to decide what
// shows through — a skewed window around that point, and the logo's own alpha.
// Cars therefore cannot appear outside the letters, whatever the cursor does.
// The window's size and its clamp both live in CSS, so it stays responsive
// without this module ever measuring a revealed size.
export function initReveal(hero) {
  const layer = hero.querySelector('.racing-reveal');
  const mark = hero.querySelector('.giant-logo');
  const ink = mark.querySelector('img');
  const montage = hero.querySelector('.racing-montage');
  const readout = hero.querySelector('.hero-readout');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(hover: none), (pointer: coarse)');
  const cells = [...montage.querySelectorAll('.montage-car')];

  let heroRect = null;
  let bounds = { left: 0, top: 0, right: 0, bottom: 0 };
  let inkBox = { x: 0, y: 0, w: 0, h: 0 };
  let hotspots = [];
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let frame = 0, active = false, armed = false, visible = true, shown = '';

  // Mirrors the CSS clamp on --mx/--my: the window's centre is held inside the
  // mark's box, which is also what makes every car's hotspot reachable.
  const clampX = x => Math.min(Math.max(x, bounds.left), bounds.right);
  const clampY = y => Math.min(Math.max(y, bounds.top), bounds.bottom);

  // A slanted wordmark has real holes in it — the counter of the C, the notch of
  // the W. Cutting there reveals nothing, so the readout must not claim a car.
  // Sample the PNG's own alpha rather than trusting the bounding box.
  const probe = document.createElement('canvas');
  probe.width = PROBE_W;
  probe.height = Math.round(PROBE_W * 1608 / 4096);
  let probeAlpha = null;

  function buildProbe() {
    if (!ink.complete || !ink.naturalWidth) return;
    const ctx = probe.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, probe.width, probe.height);
    ctx.drawImage(ink, 0, 0, probe.width, probe.height);
    try { probeAlpha = ctx.getImageData(0, 0, probe.width, probe.height).data; }
    catch { probeAlpha = null; } // Tainted canvas: fall back to the bounding box.
  }

  function overInk(x, y) {
    if (!probeAlpha) return true;
    const u = (x - inkBox.x) / inkBox.w;
    const v = (y - inkBox.y) / inkBox.h;
    if (u < 0 || u > 1 || v < 0 || v > 1) return false;
    const cx = Math.round(u * probe.width);
    const cy = Math.round(v * probe.height);
    // A one-cell skirt, so thin strokes do not flicker as the cursor crosses them.
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const px = cx + dx, py = cy + dy;
        if (px < 0 || py < 0 || px >= probe.width || py >= probe.height) continue;
        if (probeAlpha[(py * probe.width + px) * 4 + 3] > 40) return true;
      }
    }
    return false;
  }

  // Everything here is a read. Writes happen only in render(), so a pointermove
  // never forces a synchronous layout.
  function measure() {
    buildProbe();
    heroRect = hero.getBoundingClientRect();
    const inkRect = ink.getBoundingClientRect();
    const markRect = mark.getBoundingClientRect();
    const left = markRect.left - heroRect.left;
    const top = markRect.top - heroRect.top;

    inkBox = { x: inkRect.left - heroRect.left, y: inkRect.top - heroRect.top, w: inkRect.width, h: inkRect.height };
    layer.style.setProperty('--mask-x', `${inkBox.x}px`);
    layer.style.setProperty('--mask-y', `${inkBox.y}px`);
    layer.style.setProperty('--mask-w', `${inkBox.w}px`);
    layer.style.setProperty('--logo-left', `${left}px`);
    layer.style.setProperty('--logo-top', `${top}px`);
    layer.style.setProperty('--logo-right', `${left + markRect.width}px`);
    layer.style.setProperty('--logo-bottom', `${top + markRect.height}px`);
    bounds = { left, top, right: left + markRect.width, bottom: top + markRect.height };

    hotspots = cells.map(cell => {
      const rect = cell.getBoundingClientRect();
      const car = cars.find(item => item.id === cell.dataset.car);
      return {
        category: cell.dataset.category,
        x: rect.left - heroRect.left + rect.width * car.hotspotX,
        y: rect.top - heroRect.top + rect.height * car.hotspotY,
      };
    });

    // Park the window on the mark, never at the hero's origin — that leftover
    // corner window is the artefact this replaced.
    if (!armed || coarse.matches) {
      targetX = currentX = (bounds.left + bounds.right) / 2;
      targetY = currentY = (bounds.top + bounds.bottom) / 2;
      layer.style.setProperty('--cursor-x', `${currentX}px`);
      layer.style.setProperty('--cursor-y', `${currentY}px`);
    }
  }

  function updateReadout() {
    let nearest = '', best = Infinity;
    // Nothing is "current" until the mark is actually cut open — otherwise the
    // readout claims a category nobody has reached and the last one sticks.
    if (active) {
      // Judge from the cursor as the aperture sees it: the outermost cars sit
      // past the mark's edges, so a raw cursor position reports a car the window
      // has not actually reached.
      const cx = clampX(targetX);
      const cy = clampY(targetY);
      for (const spot of hotspots) {
        const dx = cx - spot.x;
        const dy = cy - spot.y;
        const distance = dx * dx + dy * dy;
        if (distance < best) { best = distance; nearest = spot.category; }
      }
    }
    if (nearest === shown) return;
    shown = nearest;
    for (const item of readout.children) {
      item.classList.toggle('is-current', item.dataset.program === nearest);
    }
  }

  function render() {
    frame = 0;
    const ease = reduced.matches ? 1 : EASE;
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;
    layer.style.setProperty('--cursor-x', `${currentX.toFixed(2)}px`);
    layer.style.setProperty('--cursor-y', `${currentY.toFixed(2)}px`);
    updateReadout();
    if (Math.abs(targetX - currentX) > SETTLE || Math.abs(targetY - currentY) > SETTLE) {
      frame = requestAnimationFrame(render);
    }
  }

  function schedule() {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function setActive(next) {
    if (active === next) return;
    active = next;
    layer.classList.toggle('is-active', active);
    if (active) schedule();
    else { cancelAnimationFrame(frame); frame = 0; updateReadout(); }
  }

  hero.addEventListener('pointermove', event => {
    if (!heroRect) return;
    // Touch only steers the window while the finger is down; a swipe must still
    // scroll the page.
    if (event.pointerType === 'touch' && event.buttons === 0) return;
    const x = event.clientX - heroRect.left;
    const y = event.clientY - heroRect.top;
    targetX = x;
    targetY = y;
    armed = true;
    setActive(overInk(x, y) || coarse.matches);
    if (active) schedule();
  }, { passive: true });

  hero.addEventListener('pointerleave', () => { if (!coarse.matches) setActive(false); });
  window.addEventListener('scroll', () => { heroRect = hero.getBoundingClientRect(); }, { passive: true });

  // The mark scales in as the loader hands over, so re-measure once it settles.
  mark.addEventListener('animationend', measure);
  window.addEventListener('awtc:home-ready', measure);
  // The probe needs decoded pixels; the loader normally beats us to it.
  if (!ink.complete) ink.addEventListener('load', () => { buildProbe(); }, { once: true });
  new ResizeObserver(measure).observe(hero);
  reduced.addEventListener('change', schedule);
  coarse.addEventListener('change', () => { measure(); setActive(coarse.matches); });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else { cancelAnimationFrame(frame); frame = 0; }
  }).observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  });

  measure();
  setActive(coarse.matches);
  schedule();
}
