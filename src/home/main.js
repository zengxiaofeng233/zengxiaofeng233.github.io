import { header, initHeader, markCurrentPage } from './header.js';
import { hero } from './hero.js';
import { racingGarage } from './garage.js';
import { initGarage } from './garage-controller.js';
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
import { register } from '../pages/register.js';
import { calendar, initCalendarCountdown } from '../pages/calendar.js';
import { driversTeams } from '../pages/drivers-teams.js';
import { pitLane, initFooter } from './footer.js';

const home = document.querySelector('#home');

// The header and the footer are rendered once and survive every route change,
// so their document listeners are bound exactly once. Only the view between
// them is swapped. The footer being outside #view is also what makes it the
// site footer rather than a homepage ending: every route, the sub-pages
// included, ends on the same navigation and the same way back to the top.
home.innerHTML = `${header()}<main id="view"></main>${pitLane()}`;
const view = home.querySelector('#view');

let pointer = null;
let heroEl = null;
let nextRace = null;
let calendarCountdown = null;
let scroll = null;
let garage = null;

initHeader(home, open => {
  heroEl?.classList.toggle('is-menu-open', open);
  if (!pointer) return;
  pointer.state.paused = open;
  pointer.schedule();
});

initFooter(home);

function render(path) {
  // The hero's listeners and observers outlive its element, so it has to be
  // taken down explicitly before the next view is built.
  pointer?.destroy();
  nextRace?.destroy();
  calendarCountdown?.destroy();
  scroll?.destroy();
  garage?.destroy();
  pointer = null;
  heroEl = null;
  nextRace = null;
  calendarCountdown = null;
  scroll = null;
  garage = null;

  const page = pageFor(path);
  document.title = page?.title ? `${page.title} — AWTC` : 'AWTC — Motorsport';
  markCurrentPage(home, path);

  if (!page) { view.innerHTML = notFound(); return; }
  if (page.id === 'register') { view.innerHTML = register(); return; }
  if (page.id === 'calendar') {
    view.innerHTML = calendar();
    calendarCountdown = initCalendarCountdown(view);
    return;
  }
  if (page.id === 'drivers') { view.innerHTML = driversTeams(); return; }
  if (page.id !== 'home') { view.innerHTML = placeholder(page); return; }

  view.innerHTML = `${siteTrack()}<div class="opening-sequence"><span id="garage" class="garage-anchor" aria-hidden="true"></span><div class="opening-stage">${hero()}${racingGarage()}</div></div>`;
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
