// The hero's single source of pointer truth.
//
// One listener, one rAF loop. Everything that reacts to the cursor — the reveal
// window, the car hotspot, the ambient layer — reads this and registers a frame
// callback, so the page never has more than one move handler running and every
// consumer sees the same sample of the cursor on the same frame.

export function createPointer(hero) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const state = {
    x: 0, y: 0,        // hero-local px, exactly where the cursor is
    nx: 0, ny: 0,      // the same point normalised over the hero box
    vx: 0, vy: 0,      // smoothed px-per-frame; published for speed-linked
                       // effects, currently unconsumed — the brief asks for no
                       // continuous motion, so nothing reads it yet
    idle: false,
    scrollOpen: false,
    inside: false,     // pointer is over the hero at all
    reduced: reduced.matches,
    paused: false,     // menu open: consumers drop to their quiet state
    ready: false,      // a real pointer sample has landed
  };

  const frames = [];
  const measures = [];
  // The hero is torn down and rebuilt on every route change, so everything that
  // outlives it — window and document listeners, observers — hangs off a signal
  // that destroy() aborts.
  const controller = new AbortController();
  const signal = controller.signal;
  const on = { passive: true, signal };
  let rect = hero.getBoundingClientRect();
  let raf = 0;
  let idleTimer = 0;
  let visible = true;
  let prevX = 0, prevY = 0, primed = false;
  let rectDirty = false;

  const schedule = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick); };

  function tick() {
    raf = 0;
    if (rectDirty) { rect = hero.getBoundingClientRect(); rectDirty = false; }
    if (primed) {
      // Exponential smoothing keeps the speed response from flickering on the
      // single-pixel jitter a real mouse produces.
      state.vx += ((state.x - prevX) - state.vx) * 0.25;
      state.vy += ((state.y - prevY) - state.vy) * 0.25;
    }
    prevX = state.x; prevY = state.y; primed = true;

    // A consumer returns true while it is still animating; the loop parks itself
    // the moment everything has settled.
    let busy = false;
    for (const fn of frames) if (fn(state) === true) busy = true;
    if (busy) schedule();
  }

  // Full re-measure: geometry changed, so consumers re-read their own boxes.
  function measure() {
    rect = hero.getBoundingClientRect();
    for (const fn of measures) fn(rect);
    schedule();
  }

  function sample(event) {
    state.x = event.clientX - rect.left;
    state.y = event.clientY - rect.top;
    state.nx = rect.width ? state.x / rect.width : 0.5;
    state.ny = rect.height ? state.y / rect.height : 0.5;
    state.ready = true;
    state.idle = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { state.idle = true; schedule(); }, 1400);
  }

  hero.addEventListener('pointermove', event => {
    // A touch only steers while the finger is down, so a swipe still scrolls.
    if (event.pointerType === 'touch' && event.buttons === 0) return;
    sample(event);
    state.inside = true;
    schedule();
  }, on);

  hero.addEventListener('pointerdown', event => {
    sample(event);
    state.inside = true;
    schedule();
  }, on);

  hero.addEventListener('pointerleave', () => { state.inside = false; schedule(); }, on);

  // A finger that lifts has left, as far as the reveal is concerned — there is no
  // hover to fall back on.
  for (const type of ['pointerup', 'pointercancel']) {
    window.addEventListener(type, event => {
      if (event.pointerType === 'touch') { state.inside = false; schedule(); }
    }, on);
  }

  // Hero-local coordinates do not move when the page scrolls, but the box we
  // subtract clientX/Y from does — the cheap resync is enough here.
  window.addEventListener('scroll', () => { rectDirty = true; schedule(); }, on);

  reduced.addEventListener('change', () => {
    state.reduced = reduced.matches;
    measure();
  }, { signal });

  const resizes = new ResizeObserver(measure);
  resizes.observe(hero);
  const intersections = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else { cancelAnimationFrame(raf); raf = 0; }
  });
  intersections.observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else schedule();
  }, { signal });

  return {
    state,
    signal,
    measure,
    schedule,
    destroy() {
      clearTimeout(idleTimer);
      controller.abort();
      resizes.disconnect();
      intersections.disconnect();
      cancelAnimationFrame(raf);
      raf = 0;
      frames.length = 0;
      measures.length = 0;
    },
    onFrame: fn => { frames.push(fn); return () => frames.splice(frames.indexOf(fn), 1); },
    onMeasure: fn => { measures.push(fn); fn(rect); return () => measures.splice(measures.indexOf(fn), 1); },
  };
}
