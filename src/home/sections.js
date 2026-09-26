import { cars, programs, site } from '../data/home.js';
import { logo } from './header.js';

export function sections() {
  return `<section class="about-section home-section" id="about" aria-labelledby="about-title">
    <div class="section-meta"><span>01 / ABOUT AWTC</span><span>THE PURSUIT CONTINUES.</span></div>
    <div class="about-layout"><h1 id="about-title">DRIVEN<br>BY <em>PASSION.</em></h1>
      <div class="about-copy"><span class="slash-mark" aria-hidden="true">///</span><p>${site.about}</p><a class="text-link" href="#programs">探索赛车项目 <span aria-hidden="true">↘</span></a></div>
    </div>
  </section>
  <section class="programs-section home-section" id="programs" aria-labelledby="programs-title">
    <div class="section-meta"><span>02 / RACING PROGRAMS</span><span>ONE SPIRIT. DIFFERENT MACHINES.</span></div>
    <h2 id="programs-title" class="section-heading">OUR RACING<br>PROGRAMS<span class="heading-dot">.</span></h2>
    <div class="program-list">${programs.map(program => {
      const car = cars.find(item => item.id === program.car);
      return `<article class="program-row"><span class="program-number">${program.number}</span><div class="program-name"><h3>${program.name}</h3><p>${program.detail}</p></div><div class="program-image"><img src="${car.src}" alt="AWTC ${program.name} 赛车涂装" loading="lazy" decoding="async" width="2560" height="1440"></div><span class="program-slash" aria-hidden="true">/</span></article>`;
    }).join('')}</div>
  </section>
  <section class="season-section home-section" id="season" aria-labelledby="season-title">
    <div class="section-meta"><span>03 / THE NEXT CHAPTER</span><span>AWTC</span></div>
    <div class="season-layout"><div><p class="season-overline">THE NEXT GRID IS YOURS.</p><h2 id="season-title">SEASON <em>6</em></h2></div><a class="season-entry" href="${site.entryUrl}"><span>REGISTER NOW<small>前往独立报名页</small></span><span class="entry-arrow" aria-hidden="true">↗</span></a></div>
  </section>
  <footer class="home-footer"><a href="#top" aria-label="返回顶部">${logo()}</a><span>AWTC / MOTORSPORT</span><a href="#top">BACK TO TOP ↑</a></footer>`;
}
