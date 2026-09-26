import { cars, montage, site } from '../data/home.js';
import { logo } from './header.js';

const CATEGORIES = ['FORMULA 1', 'FORMULA E', 'GT3'];
const pct = value => `${(value * 100).toFixed(4)}%`;

// Montage geometry lives in data/home.js; the section only republishes it as
// unitless factors so home.css can derive every length from the logo's width.
const montageVars = `--montage-w:${montage.width.toFixed(4)};--montage-top:${montage.top.toFixed(4)}`;

// Shared with the programs section so a car is framed the same way everywhere it
// appears. The renders carry their own alpha, so the crop only trims empty margin
// and lines the tyre contact patches up on one baseline.
export function carStyle(car) {
  return [
    `--car-order:${car.index}`,
    `--crop-top:${car.cropTop.toFixed(4)}`,
    `--crop-band:${(car.cropBottom - car.cropTop).toFixed(4)}`,
    `--car-scale:${car.scale}`,
    `--car-y:${car.y}px`,
  ].join(';');
}

function car(car) {
  const style = `--car-x:${pct(car.x)};--car-w:${pct(montage.carWidth)};` + carStyle(car);
  return `<div class="montage-car" data-car="${car.id}" data-category="${car.category}" style="${style}">
      <img src="${car.src}" alt="" width="2560" height="1440" decoding="async"${car.index === 2 ? ' fetchpriority="high"' : ''}>
    </div>`;
}

export function hero() {
  return `<section class="home-hero" id="top" style="${montageVars}" aria-label="AWTC 赛车品牌">
    <div class="hero-cover">${logo('giant-logo')}</div>
    <div class="racing-reveal" aria-hidden="true">
      <div class="racing-montage">${cars.map(car).join('')}</div>
    </div>
    <p class="hero-readout" aria-hidden="true">${CATEGORIES.map(name => `<span data-program="${name}">${name}</span>`).join('')}</p>
    <div class="hero-caption"><span>${site.season} &nbsp;/&nbsp; ENTRY OPEN</span><span class="reveal-hint"><i aria-hidden="true"></i><span class="desktop-hint">MOVE ACROSS THE MARK</span><span class="touch-hint">DRAG ACROSS THE MARK</span></span></div>
    <a class="scroll-cue" href="#about" aria-label="向下了解 AWTC"><span>SCROLL TO DISCOVER</span><span aria-hidden="true">↓</span></a>
  </section>`;
}
