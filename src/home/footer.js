import { navItems } from '../data/nav.js';

export function pitLane() {
  return `<footer class="pit-lane" id="footer">
    <svg class="pit-lines" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M630 -50L-80 1050M970 -50L1680 1050M670 -50L210 1050M930 -50L1390 1050" pathLength="1"/></svg>
    <section class="pit-partner" aria-labelledby="pit-partner-title">
      <h2 id="pit-partner-title">OUR PARTNER <span>合作伙伴</span></h2>
      <div class="pit-partner-marks" role="group" aria-label="赞助商品牌标识">
        <a href="https://space.bilibili.com/417986370?spm_id_from=333.337.search-card.all.click"><img src="/sponsor-logos/sponsor-mark.png" alt="PLAN C · C计划" width="979" height="531" decoding="async"></a>
        <a href="https://store.steampowered.com/app/3814510/_/"><img src="/sponsor-logos/hakusen.png" alt="白线 HAKUSEN" width="889" height="414" decoding="async"></a>
      </div>
    </section>
    <div class="pit-footer"><nav aria-label="页脚导航">${navItems.map(item=>`<a href="${item.href}">${item.label}</a>`).join('')}</nav><div class="pit-social" role="group" aria-label="官方社交媒体">
        <a href="https://space.bilibili.com/3546832766503662?spm_id_from=333.337.0.0" target="_blank" rel="noopener noreferrer" aria-label="AWTC 官方哔哩哔哩（新标签页打开）" title="哔哩哔哩"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/></svg></a>
        <a href="https://v.douyin.com/03RREMgvl9Y/" target="_blank" rel="noopener noreferrer" aria-label="AWTC 官方抖音（新标签页打开）" title="抖音"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>
        <a class="pit-social-qq" target="_blank" rel="noopener noreferrer" href="https://qm.qq.com/cgi-bin/qm/qr?k=6wjK0APitLw16fivFSyxfzm2zFUsVqw0&amp;jump_from=webapi&amp;authKey=vUK+M+yI4FS6mImSL6XTDbcGB5tWQe1+CKFNfyFqLN376bax9jzLgApa0Q5oL5lw" aria-label="加入 AWTC锦标赛 QQ群（新标签页打开）"><img src="https://pub.idqqimg.com/wpa/images/group.png" alt="AWTC锦标赛" title="AWTC锦标赛"></a>
      </div>
      <button class="pit-top" type="button" aria-label="返回顶部"><svg viewBox="0 0 20 40" aria-hidden="true"><path d="M10 39V4M4 10L10 4L16 10"/></svg></button></div>
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
