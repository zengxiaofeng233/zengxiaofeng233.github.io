export const site = {
  logo: '/awtc.png',
  entryUrl: '/register',
  season: 'SEASON 6',
  about: '从方程式到 GT，AWTC 将对赛车的热爱带到每一次出发。这里记录我们的赛车项目，也连接下一段赛道旅程。',
};

// Source files remain untouched. The offsets align the tyres in the studio renders.
export const cars = [
  { id: 'yellow-gt', src: '/cars/yellow-gt.png', category: 'GT3', label: 'YELLOW / WHITE GT', x: 0, width: 26, scale: 1, y: 0, objectPosition: '50% 74%' },
  { id: 'pink-formula', src: '/cars/pink-formula.png', category: 'F1', label: 'PINK / WHITE FORMULA', x: 19, width: 28, scale: 1, y: 0, objectPosition: '50% 74%' },
  { id: 'cyan-gt', src: '/cars/cyan-gt.png', category: 'GT3', label: 'CYAN GT', x: 39, width: 26, scale: 1, y: 0, objectPosition: '50% 74%' },
  { id: 'red-gt', src: '/cars/red-gt.png', category: 'GT3', label: 'RED GT', x: 57, width: 26, scale: 1, y: 0, objectPosition: '50% 74%' },
  { id: 'blue-formula', src: '/cars/blue-formula.png', category: 'FORMULA E', label: 'BLUE / GOLD FORMULA', x: 75, width: 28, scale: 1, y: 0, objectPosition: '50% 74%' },
];

export const programs = [
  { number: '01', name: 'FORMULA 1', detail: '方程式赛车', car: 'pink-formula' },
  { number: '02', name: 'FORMULA E', detail: '电动方程式', car: 'blue-formula' },
  { number: '03', name: 'GRAND TOURING', detail: 'GT3 / GT 赛车', car: 'yellow-gt' },
];
