import { site } from '../data/home.js';
import { navItems } from '../data/nav.js';

export function logo(className = '') {
  return `<span class="home-logo ${className}"><img src="${site.logo}" alt="AWTC" width="4096" height="1608" decoding="async"></span>`;
}

// Kept deliberately spare: the mark, and the menu. The Season 6 entry lives in
// the section further down the page, not in the first screen.
export function header() {
  return `<header class="home-header">
    <a class="home-brand" href="/" aria-label="AWTC 主页">${logo()}</a>
    <div class="header-actions">
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="home-menu">
        <span class="menu-word">MENU</span>
        <span class="menu-icon" aria-hidden="true"><i></i><i></i></span>
      </button>
    </div>
    <nav class="home-menu" id="home-menu" aria-label="主导航" hidden>
      <span class="menu-speed" aria-hidden="true"></span>
      <ul>${navItems.map(item => `<li><a href="${item.href}">${item.label}</a></li>`).join('')}</ul>
    </nav>
  </header>`;
}

// How long the whole launch takes, derived so the hide never races the exit.
const OPEN_STEP = 50, CLOSE_STEP = 40, TRAVEL = 420;

// `onToggle` lets the view layer pause whatever owns the hero while the menu is
// open, without the header needing to know the hero exists.
export function initHeader(root, onToggle) {
  const button = root.querySelector('.menu-toggle');
  const word = root.querySelector('.menu-word');
  const menu = root.querySelector('.home-menu');
  const items = [...menu.querySelectorAll('li')];
  let open = false;
  let hideTimer = 0;
  menu.inert = true;

  // Delay is read at the instant the class flips, so it has to be written first:
  // on the way in the rightmost entry leads, on the way out the reverse.
  const stagger = step => {
    const last = items.length - 1;
    items.forEach((li, i) => li.style.setProperty('--d', `${(open ? last - i : i) * step}ms`));
  };

  function setOpen(next) {
    if (open === next) return;
    open = next;
    button.setAttribute('aria-expanded', String(next));
    word.textContent = next ? 'CLOSE' : 'MENU';
    onToggle(next);

    clearTimeout(hideTimer);
    if (next) {
      menu.hidden = false;
      menu.inert = false;
      // Flush the closed state so the browser has something to animate from.
      void menu.offsetWidth;
      stagger(OPEN_STEP);
      menu.classList.add('is-open');
    } else {
      // Inert immediately: the entries stay in the DOM for the length of the
      // exit, and an invisible link should not be reachable by Tab meanwhile.
      menu.inert = true;
      stagger(CLOSE_STEP);
      menu.classList.remove('is-open');
      const last = (items.length - 1) * CLOSE_STEP;
      hideTimer = setTimeout(() => { menu.hidden = true; }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 160 : last + TRAVEL + 60);
    }
  }

  button.addEventListener('click', () => setOpen(!open));
  menu.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('click', event => { if (open && !event.target.closest('.home-header')) setOpen(false); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !open) return;
    setOpen(false);
    button.focus();
  });

  return { close: () => setOpen(false) };
}

// The router marks the current entry so the menu can hold an active state.
export function markCurrentPage(root, path) {
  for (const link of root.querySelectorAll('.home-menu a')) {
    const here = link.getAttribute('href') === path;
    if (here) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}
