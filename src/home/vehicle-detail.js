import './vehicle-detail.css';

export function createVehicleDetail(garage) {
  let panel, viewer, viewerPromise, opened = false, destroyed = false, version = 0;
  let origin, restore, closeTimer = 0;
  const events = new AbortController();
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ensurePanel() {
    if (panel) return;
    panel = document.createElement('section');
    panel.className = 'vehicle-detail';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'vehicle-detail-title');
    panel.innerHTML = `<button class="vehicle-close" aria-label="返回 Garage">×</button>
      <div class="vehicle-info"><span class="vehicle-eyebrow">AWTC / VEHICLE PREVIEW</span>
        <h2 id="vehicle-detail-title"></h2><p class="vehicle-category"></p>
        <button class="vehicle-back">BACK TO GARAGE <span aria-hidden="true">↗</span></button></div>
      <div class="vehicle-stage"><div class="vehicle-shadow" aria-hidden="true"></div>
        <div class="vehicle-poster"></div><div class="vehicle-canvas"></div>
        <div class="vehicle-status" role="status" aria-live="polite"></div>
        <p class="vehicle-help">DRAG TO ROTATE / SCROLL OR PINCH TO ZOOM</p></div>`;
    document.querySelector('#home').append(panel);
    panel.querySelectorAll('button').forEach(button => button.addEventListener('click', close, { signal: events.signal }));
    panel.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab') {
        const buttons = [...panel.querySelectorAll('button')];
        const index = buttons.indexOf(document.activeElement);
        event.preventDefault();
        buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
      }
    }, { signal: events.signal });
  }
  function lock() {
    const x = scrollX, y = scrollY;
    const elements = [document.documentElement, document.body];
    const previous = elements.map(el => el.getAttribute('style'));
    const siblings = [...panel.parentElement.children].filter(el => el !== panel);
    const inert = siblings.map(el => el.inert);
    const gap = innerWidth - document.documentElement.clientWidth;
    if (gap) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + gap}px`;
    elements.forEach(el => { el.style.overflow = 'hidden'; });
    siblings.forEach(el => { el.inert = true; });
    restore = () => {
      elements.forEach((el, i) => { if (previous[i] === null) el.removeAttribute('style'); else el.setAttribute('style', previous[i]); });
      siblings.forEach((el, i) => { el.inert = inert[i]; });
      window.scrollTo({ left: x, top: y, behavior: 'instant' });
    };
  }
  function fail(error) {
    if (!opened || destroyed) return;
    console.error('[AWTC vehicle]', error);
    viewer?.hide();
    panel.classList.remove('is-ready');
    panel.classList.add('is-error');
    panel.querySelector('.vehicle-status').textContent = '3D PREVIEW UNAVAILABLE';
    panel.querySelector('.vehicle-stage').setAttribute('aria-busy', 'false');
  }
  async function open(car, source) {
    if (opened || destroyed || !car.model3d) return;
    ensurePanel(); clearTimeout(closeTimer);
    opened = true; origin = source;
    const ticket = ++version, started = performance.now();
    const sourceRect = source.getBoundingClientRect();
    panel.hidden = false;
    panel.classList.remove('is-ready', 'is-error', 'is-closing');
    panel.querySelector('h2').textContent = car.label;
    panel.querySelector('.vehicle-category').textContent = car.category;
    const status = panel.querySelector('.vehicle-status');
    status.textContent = 'LOADING VEHICLE';
    panel.querySelector('.vehicle-stage').setAttribute('aria-busy', 'true');
    const poster = panel.querySelector('.vehicle-poster');
    const copy = source.cloneNode(true);
    copy.removeAttribute('tabindex'); copy.removeAttribute('role'); copy.removeAttribute('aria-label');
    copy.setAttribute('aria-hidden', 'true');
    poster.replaceChildren(copy);
    lock();
    garage.classList.add('has-vehicle-detail');
    if (!reduced()) {
      const target = copy.getBoundingClientRect();
      copy.animate([{ transformOrigin: '0 0', transform: `translate(${sourceRect.left - target.left}px,${sourceRect.top - target.top}px) scale(${sourceRect.width / target.width})` },
        { transformOrigin: '0 0', transform: 'none' }], { duration: 350, easing: 'ease-out' });
    }
    panel.querySelector('.vehicle-close').focus({ preventScroll: true });
    const valid = () => opened && !destroyed && ticket === version;
    const progress = percent => { if (valid()) status.textContent = percent === null ? 'LOADING VEHICLE' : `LOADING VEHICLE · ${percent}%`; };
    try {
      if (!viewerPromise) viewerPromise = import('./vehicle-viewer.js')
        .then(module => module.createViewer(panel.querySelector('.vehicle-canvas'), fail))
        .then(value => { viewer = value; if (destroyed) value.destroy(); return value; })
        .catch(error => { viewerPromise = null; throw error; });
      const current = await viewerPromise;
      if (!valid()) return;
      const url = matchMedia('(max-width: 760px)').matches && car.model3dMobile ? car.model3dMobile : car.model3d;
      let metrics;
      try { metrics = await current.show(car, url, progress, started); }
      catch (error) {
        if (!valid() || url === car.model3d) throw error;
        metrics = await current.show(car, car.model3d, progress, started);
      }
      if (!valid() || !metrics) return;
      panel.classList.add('is-ready');
      status.textContent = '';
      panel.querySelector('.vehicle-stage').setAttribute('aria-busy', 'false');
    } catch (error) { if (valid()) fail(error); }
  }
  function finishClose() {
    viewer?.hide();
    if (panel) { panel.hidden = true; panel.classList.remove('is-ready', 'is-closing'); }
    garage.classList.remove('has-vehicle-detail');
    restore?.(); restore = null;
    if (!destroyed && origin?.isConnected) origin.focus({ preventScroll: true });
    opened = false;
  }
  function close() {
    if (!opened || panel.classList.contains('is-closing')) return;
    ++version;
    panel.classList.add('is-closing');
    panel.classList.remove('is-ready');
    closeTimer = setTimeout(finishClose, reduced() ? 0 : 320);
  }
  return { open, get isOpen() { return opened; }, destroy() {
    destroyed = true; ++version; clearTimeout(closeTimer); finishClose();
    events.abort(); viewer?.destroy(); panel?.remove();
  } };
}
