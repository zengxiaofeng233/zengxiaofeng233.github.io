import { header, initHeader, markCurrentPage } from './header.js';
import { hero } from './hero.js';
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
import { pageFor } from '../data/nav.js';

const home = document.querySelector('#home');

// The header is rendered once and survives every route change, so its document
// listeners are bound exactly once. Only the view below it is swapped.
home.innerHTML = `${header()}<main id="view"></main>`;
const view = home.querySelector('#view');

let pointer = null;
let heroEl = null;
let nextRace = null;
let scroll = null;

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
  pointer = null;
  heroEl = null;
  nextRace = null;
  scroll = null;

  const page = pageFor(path);
  document.title = page?.title ? `${page.title} — AWTC` : 'AWTC — Motorsport';
  markCurrentPage(home, path);

  if (!page) { view.innerHTML = notFound(); return; }
  if (page.id !== 'home') { view.innerHTML = placeholder(page); return; }

  view.innerHTML = `${siteTrack()}${hero()}${sections()}`;
  heroEl = view.querySelector('.home-hero');
  pointer = createPointer(heroEl);
  mountAmbient(heroEl, pointer);
  initReveal(heroEl, pointer);
  nextRace = mountNextRaceSlot(heroEl);
  scroll = initScroll(view, pointer);
}

const router = createRouter(render);
restoreDeepLink();
router.start();
void transitionToHome(home);
