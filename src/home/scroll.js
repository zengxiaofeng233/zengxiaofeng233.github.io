// Native document scrolling owns the scene. Selection lives in garage-controller.
const clamp = value => Math.max(0, Math.min(1, value));
const phase = (p, start, end) => {
  const t = clamp((p - start) / (end - start));
  return t * t * (3 - 2 * t);
};

export function initScroll(root, pointer) {
  const sequence = root.querySelector('.opening-sequence');
  const stage = root.querySelector('.opening-stage');
  const heroChapter = root.querySelector('.hero-chapter');
  const garage = root.querySelector('.garage-chapter');
  const path = root.querySelector('.site-track path');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const options = { passive: true, signal: controller.signal };
  let metrics, raf = 0, dirty = true;
  const schedule = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(update); };

  function measure() {
    metrics = {
      top: sequence.getBoundingClientRect().top + scrollY,
      range: Math.max(1, sequence.offsetHeight - stage.offsetHeight),
      rootTop: root.getBoundingClientRect().top + scrollY,
      rootHeight: root.offsetHeight,
    };
    dirty = false;
  }

  function update() {
    raf = 0;
    if (dirty) measure();
    const p = clamp((scrollY - metrics.top) / metrics.range);
    const values = {
      '--open': p,
      '--breathe':     phase(p,  .00, .16),
      '--compose':     phase(p,  .16, .40),
      '--split':       reduced.matches ? 0 : phase(p, .38, .56),
      '--ink-exit':    phase(p,  .50, .62),
      '--cars-reveal': phase(p,  .64, .78),
      '--handoff':     phase(p,  .75,  1),
      '--garage-ui':   phase(p,  .85,  1),
    };
    for (const [name, value] of Object.entries(values)) stage.style.setProperty(name, value.toFixed(4));
    const ready = p >= .999;
    garage.classList.toggle('is-ready', ready);
    garage.inert = !ready;
    garage.setAttribute('aria-hidden', String(!ready));
    heroChapter.inert = ready;
    heroChapter.setAttribute('aria-hidden', String(ready));
    pointer.state.scrollOpen = p > .18;
    pointer.schedule();
    const progress = clamp((scrollY - metrics.rootTop + innerHeight) / metrics.rootHeight);
    path.style.strokeDashoffset = String(1 - progress);
  }

  window.addEventListener('scroll', schedule, options);
  const remeasure = () => { dirty = true; schedule(); };
  window.addEventListener('resize', remeasure, options);
  window.addEventListener('awtc:home-ready', remeasure, options);
  reduced.addEventListener('change', remeasure, { signal: controller.signal });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else remeasure();
  }, { signal: controller.signal });
  const observer = new ResizeObserver(remeasure);
  observer.observe(root);
  observer.observe(stage);
  schedule();
  return { destroy() { controller.abort(); observer.disconnect(); cancelAnimationFrame(raf); } };
}
