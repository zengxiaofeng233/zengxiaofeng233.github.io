import { cars, site } from '../data/home.js';

// Progress is successful, decoded critical resources / total tracked resources.
// It is not elapsed time or an estimate of downloaded bytes.
export function canEnterHome(successful, total, essentialsReady) {
  return essentialsReady && successful / total > 0.7;
}

export async function transitionToHome(home) {
  const stage = document.querySelector('#loader-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const images = [site.logo, ...cars.map(car => car.src)];
  const total = images.length + 2; // Already loaded home module + blocking stylesheet.
  const ready = new Set(['module', 'stylesheet']);
  const failed = [];
  let firstCycle = reduced.matches;
  let entering = false;

  const enter = async () => {
    if (entering || !firstCycle || !canEnterHome(ready.size, total, ready.has(site.logo) && ready.has(cars[2].src))) return;
    entering = true;
    home.hidden = false;
    home.classList.add('is-entered');
    const animation = stage.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], {
      duration: reduced.matches ? 1 : 760,
      easing: 'cubic-bezier(.76, 0, .24, 1)', fill: 'forwards',
    });
    await animation.finished;
    stage.hidden = true;
    home.inert = false;
    document.body.classList.remove('home-loading');
    window.dispatchEvent(new CustomEvent('awtc:home-ready'));
  };
  function update() {
    stage.dataset.progress = String(Math.round(ready.size / total * 100));
    window.dispatchEvent(new CustomEvent('awtc:load-progress', { detail: { loaded: ready.size, total, progress: ready.size / total } }));
    void enter();
  }
  // Preserve a complete cycle of the existing logo animation, without changing it.
  const letter = stage.querySelector('.letter-a');
  const duration = parseFloat(getComputedStyle(letter).animationDuration) * 1000 || 0;
  setTimeout(() => { firstCycle = true; void enter(); }, reduced.matches ? 0 : duration);
  update();
  await Promise.all(images.map(async src => {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    try { await image.decode(); ready.add(src); }
    catch { failed.push(src); }
    update();
  }));
  if (!canEnterHome(ready.size, total, ready.has(site.logo) && ready.has(cars[2].src))) {
    const message = document.createElement('p');
    message.className = 'load-error';
    message.setAttribute('role', 'alert');
    message.textContent = '部分主页资源未能加载，请刷新页面重试。';
    document.body.append(message);
  }
  // Failed non-essential assets do not count as loaded and do not fabricate progress.
  return { loaded: ready.size, total, failed };
}
