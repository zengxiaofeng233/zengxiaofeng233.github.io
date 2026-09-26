// The five liveries, and everything the hero needs to frame them.
//
// Every render is a 2560x1440 studio shot whose car floats in a transparent
// field, so the alpha channel is the only reliable description of where the car
// actually is. `box` is that bounding box, measured from the file itself; the
// window size, scale and offsets below are all *derived* from it rather than
// hand-tuned per car, so re-exporting an asset only means re-measuring one line.
//
// Order is load-bearing: index 2 is the car the loader treats as essential
// (see loading.js and the <link rel=preload> in index.html).

export const SOURCE = { width: 2560, height: 1440 };

const SPEC = [
  {
    id: 'yellow-gt', category: 'GT3', label: 'YELLOW / WHITE GT',
    box: { x: 152, y: 431, w: 2280, h: 637 },
    revealWidth: 516, revealHeight: 186, fit: 0.88, baseline: 26, hotspotX: 0.12,
  },
  {
    id: 'pink-formula', category: 'FORMULA 1', label: 'PINK / WHITE FORMULA',
    box: { x: 9, y: 549, w: 2470, h: 524 },
    // Open-wheelers are far longer and lower than a GT, so the window is wider
    // and shallower; a shared 516x186 would letterbox the car into a sliver.
    revealWidth: 620, revealHeight: 176, fit: 0.90, baseline: 24, hotspotX: 0.32,
  },
  {
    id: 'cyan-gt', category: 'GT3', label: 'CYAN GT',
    box: { x: 102, y: 430, w: 2379, h: 639 },
    revealWidth: 516, revealHeight: 186, fit: 0.88, baseline: 26, hotspotX: 0.50,
  },
  {
    id: 'red-gt', category: 'GT3', label: 'RED GT',
    // Tallest of the five — the rear wing reaches well above the roofline, so
    // its band gets a little less headroom.
    box: { x: 81, y: 307, w: 2271, h: 768 },
    revealWidth: 516, revealHeight: 186, fit: 0.88, baseline: 22, hotspotX: 0.69,
  },
  {
    id: 'blue-formula', category: 'FORMULA E', label: 'BLUE / GOLD FORMULA',
    box: { x: 44, y: 482, w: 2288, h: 579 },
    revealWidth: 620, revealHeight: 176, fit: 0.90, baseline: 22, hotspotX: 0.87,
  },
];

// The programs section keeps the older, uniform band so all three rows share one
// image height. It has nothing to do with the hero stage.
const PROGRAM_BAND = 0.72;
const PROGRAM_PAD = 0.035;

// Solve for the scale that lands the car's body across `fit` of the window, then
// express the image's top-left corner as a fraction of the window box. Fractions
// keep the stage responsive for free: the window is sized in CSS, so nothing here
// needs re-deriving when the viewport changes.
function frame(spec) {
  const { box, revealWidth, revealHeight, fit, baseline } = spec;
  const scale = (revealWidth * fit) / box.w;
  const ground = (box.y + box.h) / SOURCE.height;
  const cropBottom = ground + PROGRAM_PAD;

  return {
    scale,
    // Where the source image sits inside the window, as fractions of the window.
    imageW: (SOURCE.width * scale) / revealWidth,
    imageX: (revealWidth / 2 - (box.x + box.w / 2) * scale) / revealWidth,
    imageY: (revealHeight - baseline - (box.y + box.h) * scale) / revealHeight,
    // Kept for the programs rows, which anchor their crop on the contact patch.
    ground,
    cropTop: cropBottom - PROGRAM_BAND,
    cropBand: PROGRAM_BAND,
    bodyHeight: box.h * scale,
  };
}

export const cars = SPEC.map((spec, index) => ({
  ...spec,
  src: `/cars/${spec.id}.png`,
  index,
  hotspotY: 0.5,
  ...frame(spec),
}));

export const carById = id => cars.find(car => car.id === id);

// Category -> ambient group. The hero paints one group brighter at a time, so
// this is the single place the three racing programmes are spelled out.
export const CATEGORY_GROUP = {
  'FORMULA 1': 'f1',
  'FORMULA E': 'fe',
  'GT3': 'gt3',
};

// The readout under the mark, in the order it reads on the page.
export const CATEGORIES = ['FORMULA 1', 'FORMULA E', 'GT3'];
