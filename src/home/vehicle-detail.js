import './vehicle-detail.css';

export function createVehicleDetail(garage) {
  let panel, viewer, viewerPromise, opened = false, destroyed = false, version = 0;
  let origin, restore, closeTimer = 0, activeCar, mode;
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
    panel.innerHTML = `<div class="vehicle-backdrop" aria-hidden="true"></div>
      <div class="vehicle-watermark" aria-hidden="true"><img src="/awtc.png" alt=""></div>
      <div class="vehicle-speed" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="vehicle-event" aria-hidden="true"></div>
      <button class="vehicle-close" aria-label="关闭" title="关闭">×</button>
      <div class="vehicle-info"><div class="vehicle-topline"><span class="vehicle-eyebrow">AWTC / 车辆档案</span><i></i><span class="vehicle-index"></span></div>
        <h2 id="vehicle-detail-title"></h2>
        <div class="vehicle-identity"><span class="vehicle-number"></span><div><p class="vehicle-category"></p><p class="vehicle-subtitle"></p></div></div>
        <section class="vehicle-history"><h3>参赛记录 <small>RACE HISTORY</small></h3><div class="vehicle-history-list" tabindex="0" aria-label="参赛记录"></div></section>
        <section class="vehicle-drivers"><h3>车手阵容 <small>DRIVER LINEUP</small></h3><ol class="vehicle-driver-list" tabindex="0" aria-label="车手阵容，可上下滚动"></ol></section>
        <section class="vehicle-modes"><h3>查看模式 <small>VIEW MODE</small></h3><div class="vehicle-mode-options" role="group" aria-label="查看模式"></div></section>
        <button class="vehicle-back"><span aria-hidden="true">←</span>返回车库</button></div>
      <div class="vehicle-stage" role="region"><div class="vehicle-shadow" aria-hidden="true"></div>
        <div class="vehicle-poster"></div><div class="vehicle-canvas"></div>
        <div class="vehicle-status" role="status" aria-live="polite"></div>
        <p class="vehicle-help">拖动旋转 · 滚轮缩放</p></div>`;
    document.querySelector('#home').append(panel);
    panel.querySelectorAll('.vehicle-close, .vehicle-back').forEach(button => button.addEventListener('click', close, { signal: events.signal }));
    panel.querySelector('.vehicle-mode-options').addEventListener('click', event => {
      const button = event.target.closest('[data-mode]');
      if (button) setMode(button.dataset.mode);
    }, { signal: events.signal });
    panel.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab') {
        const buttons = [...panel.querySelectorAll('button, [tabindex="0"]')];
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
    if (!opened || destroyed || mode !== '3d' || panel.classList.contains('is-closing')) return;
    console.error('[AWTC vehicle]', error);
    viewer?.hide();
    panel.classList.remove('is-ready');
    panel.classList.add('is-error');
    panel.querySelector('.vehicle-status').textContent = '3D 加载失败，当前显示车辆侧视图';
    panel.querySelector('.vehicle-stage').setAttribute('aria-busy', 'false');
  }
  async function open(car, source) {
    if (opened || destroyed) return;
    ensurePanel(); clearTimeout(closeTimer);
    opened = true; origin = source; activeCar = car; mode = null;
    const sourceRect = source.getBoundingClientRect();
    panel.hidden = false;
    panel.scrollTop = 0;
    panel.classList.remove('is-ready', 'is-error', 'is-closing');
    renderArchive(car);
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
    await setMode(car.has3D && car.model3d ? '3d' : '2d');
  }
  function renderArchive(car) {
    const text = (selector, value) => { panel.querySelector(selector).textContent = value; };
    text('h2', car.displayName || '车辆名称待补充');
    text('.vehicle-number', car.number || '—');
    text('.vehicle-category', car.className || '—');
    text('.vehicle-subtitle', car.displayName || '');
    const race = car.raceHistory[0];
    text('.vehicle-event', race ? [race.year, race.nameEn].filter(Boolean).join('\n') : '');
    const index = panel.querySelector('.vehicle-index');
    const current = document.createElement('b'); current.textContent = car.archiveIndex;
    index.replaceChildren(current, document.createTextNode(` / ${car.archiveTotal}`));
    const history = panel.querySelector('.vehicle-history-list');
    history.replaceChildren();
    for (const race of car.raceHistory.length ? car.raceHistory : [{ year: '—', nameZh: '参赛记录待补充' }]) {
      const item = document.createElement('article');
      for (const [tag, value] of [['time', race.year], ['p', race.nameZh], ['small', race.nameEn]]) {
        if (!value) continue;
        const node = document.createElement(tag); node.textContent = value; item.append(node);
      }
      history.append(item);
    }
    const drivers = panel.querySelector('.vehicle-driver-list');
    drivers.replaceChildren();
    const names = car.drivers.filter(driver => driver.name?.trim());
    for (let i = 0; i < Math.max(4, names.length); i++) {
      const item = document.createElement('li');
      const number = document.createElement('span'); number.textContent = String(i + 1).padStart(2, '0');
      const name = document.createElement('span'); name.textContent = names[i]?.name || '——';
      item.classList.toggle('is-placeholder', !names[i]); item.append(number, name); drivers.append(item);
    }
    drivers.scrollTop = history.scrollTop = 0;
    const options = panel.querySelector('.vehicle-mode-options'); options.replaceChildren();
    for (const value of [car.has3D && car.model3d && '3d', car.has2D && car.src && '2d'].filter(Boolean)) {
      const button = document.createElement('button'); button.dataset.mode = value; button.textContent = value.toUpperCase();
      button.setAttribute('aria-pressed', 'false'); options.append(button);
    }
    const backdrop = panel.querySelector('.vehicle-backdrop'); backdrop.replaceChildren();
    // Only these two resource objects may supply circuit atmosphere.
    const background = (car.id === 'cyan-gt' && car.backgroundType === 'daytona') || (car.id === 'red-gt' && car.backgroundType === 'nurburgring');
    if (background && car.backgroundSrc) {
      const image = document.createElement('img'); image.alt = ''; image.src = car.backgroundSrc;
      image.addEventListener('error', () => image.remove(), { once: true }); backdrop.append(image);
    }
  }
  async function setMode(next) {
    if (!opened || destroyed || panel.classList.contains('is-closing') || next === mode) return;
    const car = activeCar;
    if (next === '3d' && !(car.has3D && car.model3d)) return;
    mode = next;
    const ticket = ++version, started = performance.now();
    viewer?.hide();
    panel.classList.remove('is-ready', 'is-error');
    panel.dataset.mode = mode;
    panel.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    const status = panel.querySelector('.vehicle-status');
    const stage = panel.querySelector('.vehicle-stage');
    stage.setAttribute('aria-label', mode === '2d' ? '车辆侧视图' : '车辆三维展示');
    stage.setAttribute('aria-busy', String(mode === '3d'));
    status.textContent = mode === '3d' ? '正在加载车辆' : '';
    if (mode === '2d') return;
    const valid = () => opened && !destroyed && ticket === version;
    const progress = percent => { if (valid()) status.textContent = percent === null ? '正在加载车辆' : `正在加载车辆 · ${percent}%`; };
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
