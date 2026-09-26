import { site } from '../data/home.js';

export function logo(className = '') {
  return `<span class="home-logo ${className}"><img src="${site.logo}" alt="AWTC" width="4096" height="1608" decoding="async"></span>`;
}

export function header() {
  return `<header class="home-header">
    <a class="home-brand" href="#top" aria-label="AWTC 主页">${logo()}</a>
    <div class="header-actions"><a class="entry-link" href="${site.entryUrl}">SEASON 6 <span aria-hidden="true">↗</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="home-menu"><span>MENU</span><span class="menu-icon" aria-hidden="true"></span></button>
    </div>
    <nav class="home-menu" id="home-menu" aria-label="主页导航" hidden>
      <a href="#about"><span>01</span> ABOUT AWTC</a>
      <a href="#programs"><span>02</span> RACING PROGRAMS</a>
      <a href="#season"><span>03</span> SEASON 6</a>
    </nav>
  </header>`;
}

export function initHeader(root) {
  const button = root.querySelector('.menu-toggle');
  const menu = root.querySelector('.home-menu');
  const close = () => { menu.hidden = true; button.setAttribute('aria-expanded', 'false'); };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('click', event => { if (!event.target.closest('.home-header')) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { close(); button.focus(); }
  });
}
