import { cars } from '../data/cars.js';
import { createVehicleDetail } from './vehicle-detail.js';

const THRESHOLD = 90;
const DURATION = 620;

export function initGarage(garage) {
  const rail = garage.querySelector('.garage-rail');
  const figures = [...garage.querySelectorAll('.garage-car')];
  const vehicles = figures.map(el => el.querySelector('.garage-vehicle'));
  const counter = garage.querySelector('.garage-counter');
  const interaction = garage.querySelector('.garage-interaction-zone');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const signal = controller.signal;
  const detail = createVehicleDetail(garage);
  let suppressClickUntil = 0;
  let index = 0, accumulated = 0, lastWheel = 0, lockUntil = 0;
  let endTimer = 0, raf = 0, touch = null;
  let offsets = [];
  let wheelConsumed = false, wheelDirection = 0;

  function measure() {
    raf = 0;
    offsets = figures.map(el => el.offsetLeft - figures[0].offsetLeft);
    rail.style.setProperty('--rail-x', `${-(offsets[index] || 0)}px`);
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
  const ready = () => garage.classList.contains('is-ready') && !garage.inert && !detail.isOpen;
  const currentHit = target => target instanceof Element && (vehicles[index].contains(target)
    || (garage.classList.contains('is-changing') && target === interaction));

  function change(direction) {
    const now = performance.now();
    if (!ready() || now < lockUntil) return false;
    const next = Math.max(0, Math.min(figures.length - 1, index + direction));
    if (next === index) return false;
    // Keep the starting vehicle's hit area stable while it leaves. Otherwise
    // successive wheel events fall through the moving gap and scroll the page.
    // These layout reads happen once per change, before the DOM writes.
    const rect = vehicles[index].getBoundingClientRect();
    const host = garage.getBoundingClientRect();
    interaction.style.cssText = `left:${rect.left - host.left}px;top:${rect.top - host.top}px;width:${rect.width}px;height:${rect.height}px`;
    const focused = document.activeElement === vehicles[index];
    index = next;
    accumulated = 0;
    lockUntil = now + (reduced.matches ? 160 : DURATION);
    garage.classList.remove('is-hovered');
    garage.classList.add('is-changing');
    garage.dataset.index = String(index);
    garage.style.setProperty('--direction', String(direction));
    figures.forEach((figure, i) => {
      figure.classList.toggle('is-current', i === index);
      vehicles[i].tabIndex = i === index ? 0 : -1;
    });
    rail.style.setProperty('--rail-x', `${-(offsets[index] || 0)}px`);
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(figures.length).padStart(2, '0')}`;
    if (focused) vehicles[index].focus({ preventScroll: true });
    clearTimeout(endTimer);
    endTimer = setTimeout(() => garage.classList.remove('is-changing'), reduced.matches ? 160 : DURATION);
    return true;
  }

  garage.addEventListener('pointerover', event => {
    if (event.pointerType !== 'touch' && ready() && currentHit(event.target)) garage.classList.add('is-hovered');
  }, { passive: true, signal });
  garage.addEventListener('pointerout', event => {
    if (currentHit(event.relatedTarget)) return;
    garage.classList.remove('is-hovered');
    accumulated = 0;
    wheelConsumed = false;
    lastWheel = 0;
  }, { passive: true, signal });

  // Cancel scroll only over the current vehicle, never the whole stage.
  // Outward gestures at the first/last car return to native document scrolling.
  garage.addEventListener('wheel', event => {
    if (!ready() || !currentHit(event.target) || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (!delta) return;
    const now = performance.now();
    const direction = Math.sign(delta);
    const locked = now < lockUntil;
    if (!locked && ((index === 0 && direction < 0) || (index === figures.length - 1 && direction > 0))) {
      accumulated = 0;
      return;
    }
    event.preventDefault();
    const gap = now - lastWheel;
    lastWheel = now;
    if (gap > 180 || wheelDirection !== direction) { accumulated = 0; wheelConsumed = false; }
    wheelDirection = direction;
    if (locked) return;
    if (wheelConsumed) return;
    accumulated += delta;
    if (Math.abs(accumulated) >= THRESHOLD && change(direction)) wheelConsumed = true;
  }, { passive: false, signal });

  garage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || !ready() || !currentHit(event.target)) return;
    touch = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
  }, { passive: true, signal });
  garage.addEventListener('pointermove', event => {
    if (!touch || event.pointerId !== touch.id) return;
    const dx = event.clientX - touch.x, dy = event.clientY - touch.y;
    if (!touch.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { touch = null; return; }
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.3) { touch.horizontal = true; suppressClickUntil = performance.now() + 800; }
    if (touch.horizontal && Math.abs(dx) >= 48) { change(dx < 0 ? 1 : -1); touch = null; }
  }, { passive: true, signal });
  for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, () => { touch = null; }, { passive: true, signal });
  function openDetail(event) {
    if (!ready() || !currentHit(event.target) || garage.classList.contains('is-changing') || performance.now() < suppressClickUntil || !cars[index].model3d) return;
    event.preventDefault();
    garage.classList.remove('is-hovered');
    detail.open(cars[index], vehicles[index]);
  }
  garage.addEventListener('click', openDetail, { signal });
  garage.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { openDetail(event); return; }
    if (!currentHit(event.target) || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    change(event.key === 'ArrowRight' ? 1 : -1);
  }, { signal });

  const observer = new ResizeObserver(schedule);
  observer.observe(garage);
  reduced.addEventListener('change', schedule, { signal });
  measure();
  return { destroy() { detail.destroy(); controller.abort(); observer.disconnect(); cancelAnimationFrame(raf); clearTimeout(endTimer); } };
}
