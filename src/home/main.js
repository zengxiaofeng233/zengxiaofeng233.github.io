import { header, initHeader, markCurrentPage } from './header.js';
import { hero } from './hero.js';
import { racingGarage } from './garage.js';
import { initGarage } from './garage-controller.js';
import { sections } from './sections.js';
import { siteTrack } from './track.js';
import { initScroll } from './scroll.js';
import { initReveal } from './reveal.js';
import { mountAmbient } from './ambient.js';
import { createPointer } from './pointer.js';
import { mountNextRaceSlot } from './next-race.js';
import { transitionToHome } from './loading.js';
import { placeholder, notFound } from '../pages/placeholder.js';
import { createRouter, restoreDeepLink } from '../router.js';
import { createTransition } from './transition.js';
import { pageFor } from '../data/nav.js';
import { calendar } from '../pages/calendar.js';

const home = document.querySelector('#home');

// The header is rendered once and survives every route change, so its document
// listeners are bound exactly once. Only the view below it is swapped.
home.innerHTML = `${header()}<main id="view"></main>`;
const view = home.querySelector('#view');

let pointer = null;
let heroEl = null;
let nextRace = null;
let scroll = null;
let garage = null;

initHeader(home, open => {
  heroEl?.classList.toggle('is-menu-open', open);
  if (!pointer) return;
  pointer.state.paused = open;
  pointer.schedule();
});

function render(path) {
  // The hero's listeners and observers outlive its element, so it has to be
  // taken down explicitly before the next view is built.
  pointer?.destroy();
  nextRace?.destroy();
  scroll?.destroy();
  garage?.destroy();
  pointer = null;
  heroEl = null;
  nextRace = null;
  scroll = null;
  garage = null;

  const page = pageFor(path);
  document.title = page?.title ? `${page.title} — AWTC` : 'AWTC — Motorsport';
  markCurrentPage(home, path);

  if (!page) { view.innerHTML = notFound(); return; }
  if (page.id === 'calendar') { view.innerHTML = calendar(); return; }
  if (page.id !== 'home') { view.innerHTML = placeholder(page); return; }

  view.innerHTML = `${siteTrack()}<div class="opening-sequence"><span id="garage" class="garage-anchor" aria-hidden="true"></span><div class="opening-stage">${hero()}${racingGarage()}</div></div>${sections()}`;
  heroEl = view.querySelector('.home-hero');
  pointer = createPointer(heroEl);
  mountAmbient(heroEl, pointer);
  initReveal(heroEl, pointer);
  nextRace = mountNextRaceSlot(heroEl);
  scroll = initScroll(view, pointer);
  garage = initGarage(view.querySelector('.garage-chapter'));
}

const transition = createTransition(home);

const router = createRouter(render, (path, swap) => {
  const page = pageFor(path);
  void transition.run(swap, {
    title: page?.title ?? (path === '/' ? 'HOME' : '404'),
    meta: page?.blurb ?? (path === '/' ? '主页面' : '页面不存在'),
  });
});
restoreDeepLink();
router.start();
void transitionToHome(home);
