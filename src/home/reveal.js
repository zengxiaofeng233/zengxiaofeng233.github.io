import { cars } from '../data/cars.js';

const EASE = 0.16;
const SETTLE = 0.15;

// Only the clip polygon moves. Both racing-strip copies have fixed geometry,
// including the lens's constant 1.08 scale about the zone centre.
export function initReveal(hero, pointer) {
  const zone = hero.querySelector('.hero-zone');
  const lens = hero.querySelector('.car-lens');
  let box = { x: 0, y: 0, w: 0, h: 0 };
  let currentX = 0, currentY = 0, wasOpen = false, fitted = '';
  let stripTop = 0, stripBottom = 0, lensWidth = 0, lensHeight = 0;

  function measure(rect) {
    const b = zone.getBoundingClientRect();
    box = { x: b.left - rect.left, y: b.top - rect.top, w: b.width, h: b.height };
    // Measure the fixed, enlarged car silhouettes, excluding transparent canvas.
    const tops = cars.map(car => (car.baseline * box.h - box.w * car.width / car.aspect - box.h / 2) * 1.08 + box.h / 2);
    const bottoms = cars.map(car => (car.baseline * box.h - box.h / 2) * 1.08 + box.h / 2);
    stripTop = Math.min(...tops);
    stripBottom = Math.max(...bottoms);
    fitted = '';
  }
  function frame(s) {
    if (!box.w) return false;
    const inside = s.x >= box.x && s.x <= box.x + box.w && s.y >= box.y && s.y <= box.y + box.h;
    const open = s.ready && s.inside && !s.idle && !s.paused && !s.scrollOpen && inside;
    lens.classList.toggle('is-active', open);
    hero.dataset.lens = open ? 'on' : 'off';
    if (open && !wasOpen) { currentX = s.x; currentY = s.y; }
    wasOpen = open;
    if (!open) return false;

    const ease = s.reduced ? 1 : EASE;
    currentX += (s.x - currentX) * ease;
    currentY += (s.y - currentY) * ease;
    const u = (currentX - box.x) / box.w;
    const car = cars.reduce((best, next) => Math.abs(next.x - u) < Math.abs(best.x - u) ? next : best);
    if (fitted !== car.id) {
      const formula = car.id.includes('formula');
      lensWidth = Math.min(box.w * .65, formula ? 540 : 510);
      lensHeight = Math.min(box.h, stripBottom - stripTop + 32);
      lens.style.setProperty('--lensW', `${lensWidth}px`);
      lens.style.setProperty('--lensH', `${lensHeight}px`);
      fitted = car.id;
    }
    // Move only the window. Keep its vertical span over the whole car band,
    // so pointing near the tyres does not slice through roofs and rear wings.
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const x = clamp(currentX - box.x, lensWidth / 2, box.w - lensWidth / 2);
    const y = clamp(currentY - box.y, stripBottom - lensHeight / 2 + 12, stripTop + lensHeight / 2 - 12);
    lens.style.setProperty('--cx', `${x.toFixed(2)}px`);
    lens.style.setProperty('--cy', `${y.toFixed(2)}px`);
    return Math.abs(s.x - currentX) + Math.abs(s.y - currentY) > SETTLE;
  }
  pointer.onMeasure(measure);
  pointer.onFrame(frame);
  window.addEventListener('awtc:home-ready', () => pointer.measure(), { signal: pointer.signal });
}
