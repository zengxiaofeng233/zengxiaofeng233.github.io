import { logo } from './header.js';
import { navItems } from '../data/nav.js';

export function pitLane() {
  return `<footer class="pit-lane" id="footer">
    <svg class="pit-lines" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M630 -50L-80 1050M970 -50L1680 1050M670 -50L210 1050M930 -50L1390 1050"/></svg>
    <a class="pit-brand" href="/" aria-label="AWTC 返回顶部">${logo()}</a>
    <div class="pit-footer"><nav aria-label="页脚导航">${navItems.map(item=>`<a href="${item.href}">${item.label}</a>`).join('')}</nav><a class="pit-top" href="#top" aria-label="返回顶部"><svg viewBox="0 0 20 40" aria-hidden="true"><path d="M10 39V4M4 10L10 4L16 10"/></svg></a></div>
  </footer>`;
}
