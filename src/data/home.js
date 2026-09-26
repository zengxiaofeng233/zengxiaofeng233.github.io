export const site = {
  logo: '/awtc.png',
  entryUrl: '/register',
  season: 'SEASON 6',
  about: '从方程式到 GT，AWTC 将对赛车的热爱带到每一次出发。这里记录我们的赛车项目，也连接下一段赛道旅程。',
};

// The giant wordmark is the reveal aperture, not just a graphic: the racing layer
// is masked by this PNG's alpha, so cars can only ever surface inside the letters.
// `source` is the ink bounding box inside the original file, which is what lets
// CSS crop the exported margin away (see .home-logo in home.css).
export const logoBox = {
  width: 3914, height: 1136,
  source: { width: 4096, height: 1608, x: 60, y: 402 },
};

// The five cars form one continuous strip parked behind the wordmark. Widths and
// step are fractions of the giant logo's width, so the montage tracks the logo at
// every breakpoint. The strip is wider than the logo on purpose — the mask hides
// the overhang, so you only ever meet the cars that fall under the letters.
const CAR_WIDTH = 0.315;   // one car cell, as a fraction of the logo width
const OVERLAP = 0.18;      // neighbouring cars share this much of a cell
const STEP = CAR_WIDTH * (1 - OVERLAP);
const CAR_COUNT = 5;
export const montage = {
  width: STEP * (CAR_COUNT - 1) + CAR_WIDTH, // strip width, fraction of logo width
  carWidth: CAR_WIDTH / (STEP * (CAR_COUNT - 1) + CAR_WIDTH),
  step: STEP / (STEP * (CAR_COUNT - 1) + CAR_WIDTH),
  // Vertical placement: the strip sits so the cars straddle the logo's centre.
  top: -0.27,
  height: 0.72,            // visible band, as a fraction of a cell's 16:9 image
};

// Source renders are 2560x1440 studio shots on a seamless light backdrop. The
// files stay untouched; each car is cropped in CSS to the band that holds the
// body plus a sliver of ground shadow, and the crop is anchored on the tyre
// contact patch so all five ground lines land on the same line.
const CARS = [
  { id: 'yellow-gt', category: 'GT3', label: 'YELLOW / WHITE GT', ground: 0.742 },
  { id: 'pink-formula', category: 'FORMULA 1', label: 'PINK / WHITE FORMULA', ground: 0.750 },
  { id: 'cyan-gt', category: 'GT3', label: 'CYAN GT', ground: 0.742 },
  { id: 'red-gt', category: 'GT3', label: 'RED GT', ground: 0.747 },
  { id: 'blue-formula', category: 'FORMULA E', label: 'BLUE / GOLD FORMULA', ground: 0.742 },
];

const GROUND_PAD = 0.035;  // shadow kept below the contact patch
const BAND = 0.72;         // must track montage.height

export const cars = CARS.map((car, index) => ({
  ...car,
  src: `/cars/${car.id}.png`,
  index,
  x: index * montage.step,
  y: 0,
  scale: 1,
  cropBottom: car.ground + GROUND_PAD,
  cropTop: car.ground + GROUND_PAD - BAND,
  // Category is decided from the cursor's own position, compared against these
  // in-cell anchor points. Only the cursor counts — never the reveal window.
  hotspotX: 0.5,
  hotspotY: 0.55,
}));

export const programs = [
  { number: '01', name: 'FORMULA 1', detail: '方程式赛车', car: 'pink-formula' },
  { number: '02', name: 'FORMULA E', detail: '电动方程式', car: 'blue-formula' },
  { number: '03', name: 'GRAND TOURING', detail: 'GT3 / GT 赛车', car: 'yellow-gt' },
];
