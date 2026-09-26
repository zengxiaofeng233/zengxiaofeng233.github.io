import { cars, CATEGORIES } from '../data/cars.js';
import { logo } from './header.js';

// The framing vars the programs section shares, so a car is cropped the same way
// wherever it appears on the page.
export function carStyle(car) {
  return [`--crop-top:${car.cropTop.toFixed(4)}`, `--crop-band:${car.cropBand.toFixed(4)}`].join(';');
}

// One window per car, each already sized to its own proportions. Only the window
// the cursor is nearest to is faded in (see reveal.js); nothing resizes at
// runtime, so switching cars never touches layout.
function carWindow(car) {
  const style = [
    `--revealW:${car.revealWidth}`, `--revealH:${car.revealHeight}`,
    `--img-w:${car.imageW.toFixed(5)}`, `--img-x:${car.imageX.toFixed(5)}`, `--img-y:${car.imageY.toFixed(5)}`,
  ].join(';');
  return `<div class="car-window" data-car="${car.id}" style="${style}">
      <img src="${car.src}" alt="" width="2560" height="1440" decoding="async"${car.index === 2 ? ' fetchpriority="high"' : ''}>
    </div>`;
}

// Z-order, back to front: paper, ambient, the brand zone (mark + car stage),
// then the readout. The header sits above all of it, outside this element.
export function hero() {
  return `<section class="home-hero" id="top" aria-label="AWTC 赛车品牌">
    <div class="hero-ambient" aria-hidden="true"></div>
    <div class="hero-zone">
      ${logo('giant-logo')}
      <div class="car-reveal" aria-hidden="true"><div class="car-stage">${cars.map(carWindow).join('')}</div></div>
    </div>
    <p class="hero-readout" aria-hidden="true">${CATEGORIES.map(name => `<span data-program="${name}">${name}</span>`).join('')}</p>
    <a class="scroll-cue" href="#about" aria-label="向下了解 AWTC"><span>SCROLL TO DISCOVER</span><span aria-hidden="true">↓</span></a>
  </section>`;
}
