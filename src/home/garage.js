import { cars } from '../data/cars.js';
import { carImageStyle } from './hero.js';

export function racingGarage() {
  return `<section class="garage-chapter" id="garage" aria-labelledby="garage-title">
    <div class="garage-viewport">
      <div class="garage-heading"><h2 id="garage-title">RACING GARAGE</h2><span class="garage-counter" aria-hidden="true">01 / 05</span></div>
      <div class="garage-speed" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="garage-rail">${cars.map((car,index) => `<figure class="garage-car"><div class="garage-vehicle" style="${carImageStyle(car)}"><img src="${car.src}" alt="AWTC ${car.label} 赛车" loading="lazy" decoding="async" width="2560" height="1440"></div><figcaption><span>${String(index + 1).padStart(2,'0')}</span><span aria-hidden="true">/</span></figcaption></figure>`).join('')}</div>
      <div class="garage-floor" aria-hidden="true"></div>
    </div>
  </section>`;
}
