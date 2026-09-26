import { cars } from './cars.js';

// Re-exported so loading.js keeps its existing import shape — the loader treats
// cars[2] as the essential render, and that contract lives in data/cars.js.
export { cars };

export const site = {
  logo: '/awtc.png',
  entryUrl: '/register',
  season: 'SEASON 6',
  about: '从方程式到 GT，AWTC 将对赛车的热爱带到每一次出发。这里记录我们的赛车项目，也连接下一段赛道旅程。',
};

// The giant wordmark is a graphic, not a mask: the reveal is clipped to the
// brand zone around it (see .hero-zone in home.css), never to the letterforms.
// `source` is the ink bounding box inside the original PNG, which is what lets
// CSS crop the exported margin away (see .home-logo in home.css).
export const logoBox = {
  width: 3914, height: 1136,
  source: { width: 4096, height: 1608, x: 60, y: 402 },
};

export const programs = [
  { number: '01', name: 'FORMULA 1', detail: '方程式赛车', car: 'pink-formula' },
  { number: '02', name: 'FORMULA E', detail: '电动方程式', car: 'blue-formula' },
  { number: '03', name: 'GRAND TOURING', detail: 'GT3 / GT 赛车', car: 'yellow-gt' },
];
