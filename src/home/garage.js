import { cars } from '../data/cars.js';
import { carImageStyle } from './hero.js';

export function racingGarage() {
  return `<section class="garage-chapter" aria-labelledby="garage-title" aria-hidden="true" inert>
    <div class="garage-viewport">
      <div class="garage-heading"><h2 id="garage-title">RACING GARAGE</h2><span class="garage-counter" aria-live="polite" aria-atomic="true">01 / 05</span></div>
      <div class="garage-speed" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="garage-rail">${cars.map((car,index) => `<figure class="garage-car${index === 0 ? ' is-current' : ''}"><div class="garage-vehicle" tabindex="${index === 0 ? '0' : '-1'}" role="button" aria-label="${car.displayName || '车辆档案'}，左右方向键切换赛车，点击查看档案" style="${carImageStyle(car)}"><img src="${car.src}" alt="AWTC ${car.label} 赛车" loading="lazy" decoding="async" width="2560" height="1440" draggable="false"></div><figcaption><span>${String(index + 1).padStart(2,'0')}</span><span aria-hidden="true">/</span></figcaption></figure>`).join('')}</div>
      <span class="garage-cursor" aria-hidden="true">SCROLL <span>← →</span></span>
      <div class="garage-interaction-zone" aria-hidden="true"></div>
      <div class="garage-floor" aria-hidden="true"></div>
    </div>
  </section>`;
}
