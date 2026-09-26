import { silhouettes } from '../data/silhouettes.js';
import { cars } from '../data/home.js';
import { logo } from './header.js';

export function hero() {
  return `<section class="home-hero" id="top" aria-label="AWTC 赛车品牌">
    <div class="hero-cover">${logo('giant-logo')}</div>
    <div class="racing-reveal" aria-hidden="true">
      <div class="montage-label"><span>AWTC / RACING ARCHIVE</span><span>F1 · FE · GT3</span></div>
      <div class="racing-montage">${cars.map((car, index) => `<div class="montage-car" data-car="${car.id}" style="--car-x:${car.x}%;--car-width:${car.width}%;--car-scale:${car.scale};--car-y:${car.y}px;--car-position:${car.objectPosition};--car-order:${index};--silhouette:${silhouettes[car.id]}"><img src="${car.src}" alt="" decoding="async" width="2560" height="1440" ${index === 2 ? 'fetchpriority="high"' : ''}></div>`).join('')}</div>
      <span class="reveal-category">GT3</span>
    </div>
    <div class="hero-caption"><span>FORMULA 1 &nbsp; / &nbsp; FORMULA E &nbsp; / &nbsp; GT3</span><span class="reveal-hint"><i aria-hidden="true"></i><span class="desktop-hint">MOVE TO EXPLORE</span><span class="touch-hint">TOUCH TO EXPLORE</span></span></div>
    <a class="scroll-cue" href="#about" aria-label="向下了解 AWTC"><span>SCROLL TO DISCOVER</span><span aria-hidden="true">↓</span></a>
  </section>`;
}
