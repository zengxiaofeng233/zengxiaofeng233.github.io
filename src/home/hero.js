import { cars } from '../data/cars.js';
import { site } from '../data/home.js';

export function carStyle(car) {
  return [`--crop-top:${car.cropTop.toFixed(4)}`, `--crop-band:${car.cropBand.toFixed(4)}`].join(';');
}

export function carImageStyle(car) {
  return `--aspect:${car.aspect};--img-w:${car.imageW};--img-x:${car.imageX};--img-y:${car.imageY}`;
}

function stripCar(car) {
  const style = `--x:${car.x};--w:${car.width};--baseline:${car.baseline};--z:${car.z};${carImageStyle(car)}`;
  return `<div class="strip-car" data-car="${car.id}" style="${style}"><img src="${car.src}" alt="" width="2560" height="1440" decoding="async"${car.index === 2 ? ' fetchpriority="high"' : ''}></div>`;
}

export function hero() {
  const strip = `<div class="racing-strip">${cars.map(stripCar).join('')}</div>`;
  return `<section class="hero-chapter" id="top" aria-label="AWTC">
    <div class="home-hero">
      <div class="hero-ambient" aria-hidden="true"></div>
      <div class="hero-zone">
        <div class="hidden-cars-layer" aria-hidden="true">${strip}</div>
        <div class="giant-logo home-logo" role="img" aria-label="AWTC">${['a','w','t','c'].map(letter => `<span class="hero-letter hero-letter-${letter}"><img src="${site.logo}" alt="" width="4096" height="1608" decoding="async"></span>`).join('')}</div>
        <div class="car-lens" aria-hidden="true"><div class="lens-stage">${strip}</div></div>
      </div>
      <div class="next-race-slot" hidden></div>
      <a class="scroll-cue" href="#garage" aria-label="探索赛车档案"><svg viewBox="0 0 20 40" aria-hidden="true"><path d="M10 1V35M4 29L10 35L16 29"/></svg></a>
    </div>
  </section>`;
}
