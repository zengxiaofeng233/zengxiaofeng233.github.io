import { logo } from './header.js';
import { navItems } from '../data/nav.js';

export function pitLane() {
  return `<footer class="pit-lane" id="footer">
    <svg class="pit-lines" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M630 -50L-80 1050M970 -50L1680 1050M670 -50L210 1050M930 -50L1390 1050" pathLength="1"/></svg>
    <a class="pit-brand" href="/" aria-label="AWTC 返回顶部">${logo()}</a>
    <div class="pit-footer"><nav aria-label="页脚导航">${navItems.map(item=>`<a href="${item.href}">${item.label}</a>`).join('')}</nav><button class="pit-top" type="button" aria-label="返回顶部"><svg viewBox="0 0 20 40" aria-hidden="true"><path d="M10 39V4M4 10L10 4L16 10"/></svg></button></div>
  </footer>`;
}

// The return-to-top control is a button, not an <a href="#top">.
//
// There is no #top on the sub-pages — the anchor belongs to the hero, which
// only the homepage renders — so the link either did nothing or rewrote the
// hash to a target that was not there. Scrolling is also an action rather than
// a destination, so it should not push a history entry. A button can only do
// the one thing, and it does it on every route.
export function initFooter(root) {
  const button = root.querySelector('.pit-top');
  if (!button) return null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' });
  });
  return { button };
}
