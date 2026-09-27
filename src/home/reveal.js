import { cars } from '../data/cars.js';

const EASE = 0.13;
const RETURN_MS = 650;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Both strips are static. Only the scanner window clips them, not the letters.
export function initReveal(hero, pointer) {
  const zone = hero.querySelector('.hero-zone');
  const logo = hero.querySelector('.giant-logo');
  const lens = hero.querySelector('.car-lens');
  let box = { x: 0, w: 0 }, lensWidth = 0;
  let logoBounds = { left: 0, top: 0, right: 0, bottom: 0 };
  let currentX = 0, opacity = 0, seen = false, tracking = false;
  let returnAt = 0, returnX = 0, returnOpacity = 0, lastTime = 0, restTarget = .55;

  function measure() {
    // Untransformed layout coordinates: no layout reads in pointermove or RAF.
    const w = zone.offsetWidth, h = zone.offsetHeight;
    box = { x: zone.offsetLeft - w / 2, w };
    const logoH = logo.offsetHeight;
    const left = box.x + logo.offsetLeft;
    const logoTop = zone.offsetTop - h / 2 + logo.offsetTop;
    logoBounds = { left, top: logoTop, right: left + logo.offsetWidth, bottom: logoTop + logoH };
    const top = Math.min(...cars.map(car => car.baseline * h - w * car.width / car.aspect));
    const bottom = Math.max(...cars.map(car => car.baseline * h));
    const bandRatio = ((top + bottom) / 2 - logo.offsetTop) / (logoH || 1);
    const fixedY = logo.offsetTop + logoH * bandRatio;
    lensWidth = Math.min(w * .65, 540);
    lens.style.setProperty('--lensW', `${lensWidth.toFixed(2)}px`);
    lens.style.setProperty('--lensH', `${Math.min(h, (bottom - top) * 1.08 + h * .06).toFixed(2)}px`);
    lens.style.setProperty('--cy', `${((fixedY - h / 2) * 1.08 + h / 2).toFixed(2)}px`);
    currentX = seen ? clamp(currentX, lensWidth / 2, w - lensWidth / 2) : w / 2;
    returnAt = 0;
  }

  function frame(s) {
    if (!box.w) return false;
    const now = performance.now();
    const dt = Math.min(48, lastTime ? now - lastTime : 16.67);
    lastTime = now;
    // Y only gates entry into the logo rectangle; it never positions the lens.
    const insideLogo = s.inside && s.x >= logoBounds.left && s.x <= logoBounds.right
      && s.y >= logoBounds.top && s.y <= logoBounds.bottom;
    const live = s.ready && insideLogo && !s.idle && !s.paused && !s.scrollOpen;
    const targetX = live ? clamp(s.x - box.x, lensWidth / 2, box.w - lensWidth / 2) : box.w / 2;
    if (live) {
      seen = true;
      returnAt = 0;
      const ease = s.reduced ? 1 : 1 - Math.pow(1 - EASE, dt / 16.67);
      currentX += (targetX - currentX) * ease;
      opacity += (1 - opacity) * ease;
    } else if (seen) {
      const restOpacity = !insideLogo || s.paused || s.scrollOpen ? 0 : .55;
      if (tracking || !returnAt || restOpacity !== restTarget) {
        returnAt = now;
        returnX = currentX;
        returnOpacity = opacity;
        restTarget = restOpacity;
      }
      const t = s.reduced ? 1 : clamp((now - returnAt) / RETURN_MS, 0, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      currentX = returnX + (targetX - returnX) * ease;
      opacity = returnOpacity + (restOpacity - returnOpacity) * ease;
    }
    tracking = live;
    hero.dataset.lens = live ? 'on' : 'off';
    lens.style.setProperty('--cx', `${currentX.toFixed(2)}px`);
    lens.style.setProperty('--lens-opacity', opacity.toFixed(3));
    return live ? Math.abs(targetX - currentX) > .1 || Math.abs(1 - opacity) > .002
      : seen && !s.reduced && now - returnAt < RETURN_MS;
  }

  pointer.onMeasure(measure);
  pointer.onFrame(frame);
  window.addEventListener('awtc:home-ready', () => pointer.measure(), { signal: pointer.signal });
}
