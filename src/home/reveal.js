import { cars } from '../data/home.js';

export function initReveal(hero) {
  const layer = hero.querySelector('.racing-reveal');
  const label = hero.querySelector('.reveal-category');
  const montage = hero.querySelector('.racing-montage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(hover: none), (pointer: coarse), (max-width: 600px)');
  let bounds, montageLeft = 0, montageWidth = 1, targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let active = false, frame = 0, category = '', visible = true;

  function render() {
    frame = 0;
    if (!active || !visible) return;
    const factor = reduced.matches ? 1 : 0.13;
    currentX += (targetX - currentX) * factor;
    currentY += (targetY - currentY) * factor;
    layer.style.setProperty('--mx', `${currentX}px`);
    layer.style.setProperty('--my', `${currentY}px`);
    const ratio = (currentX - montageLeft) / montageWidth * 100;
    const nearest = cars.reduce((best, car) => Math.abs(ratio - (car.x + car.width / 2)) < Math.abs(ratio - (best.x + best.width / 2)) ? car : best);
    if (category !== nearest.category) { category = nearest.category; label.textContent = category; }
    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.15) frame = requestAnimationFrame(render);
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  function measure() {
    bounds = hero.getBoundingClientRect();
    const montageBounds = montage.getBoundingClientRect();
    montageLeft = montageBounds.left - bounds.left;
    montageWidth = montageBounds.width || 1;
    if (coarse.matches || !active) {
      currentX = targetX = bounds.width * 0.5;
      currentY = targetY = bounds.height * (bounds.width <= 600 ? 0.64 : 0.53);
    }
    active = coarse.matches || active;
    layer.classList.toggle('is-active', active);
    schedule();
  }
  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' && !coarse.matches) return;
    targetX = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
    targetY = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
    if (!active) { currentX = targetX; currentY = targetY; }
    active = true; layer.classList.add('is-active'); schedule();
  }, { passive: true });
  hero.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    targetX = event.clientX - bounds.left; targetY = event.clientY - bounds.top;
    active = true; layer.classList.add('is-active'); schedule();
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    if (coarse.matches) return;
    active = false; layer.classList.remove('is-active'); cancelAnimationFrame(frame); frame = 0;
  });
  window.addEventListener('scroll', () => { bounds = hero.getBoundingClientRect(); }, { passive: true });
  new ResizeObserver(measure).observe(hero);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else { cancelAnimationFrame(frame); frame = 0; }
  }).observe(hero);
  reduced.addEventListener('change', schedule);
  coarse.addEventListener('change', () => { active = coarse.matches; measure(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  });
  measure();
}
