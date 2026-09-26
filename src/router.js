import { currentPath } from './data/nav.js';

// A History-API router, deliberately small.
//
// GitHub Pages cannot rewrite to index.html, so a deep link like /calendar is
// served public/404.html instead, which bounces back to / with the path in ?p=.
// restoreDeepLink() undoes that hop before the first render, so the address bar
// and the back button behave as if the page had been served directly.
export function restoreDeepLink() {
  const target = new URLSearchParams(location.search).get('p');
  if (target) history.replaceState(null, '', target);
}

export function createRouter(render) {
  function go(path) {
    history.pushState(null, '', path);
    render(path);
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || (link.target && link.target !== '_self')) return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;

    if (url.pathname === location.pathname) {
      // A link back to the page you are on — the brand mark, usually. In-page
      // anchors keep their native behaviour; a bare same-path link means "top".
      if (!url.hash) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    event.preventDefault();
    go(url.pathname);
  });

  window.addEventListener('popstate', () => {
    render(currentPath());
    window.scrollTo(0, 0);
  });

  return { start: () => render(currentPath()) };
}
