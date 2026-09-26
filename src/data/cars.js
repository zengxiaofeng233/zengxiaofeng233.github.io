// The five liveries and their places on the hidden racing strip.
//
// The strip is a fixed atlas that lives under the AWTC surface. It never moves:
// the cursor is a magnifier that travels over it, so the cars are only ever seen
// through the lens (see src/home/reveal.js). Nothing here is driven by the
// pointer.
//
// Every render is a 2560x1440 studio shot whose car floats in a transparent
// field, so the alpha channel is the only reliable description of where the car
// actually is. `box` is that bounding box, measured from the file itself; the
// placement below is derived from it rather than hand-tuned per car.
//
// Order is load-bearing: index 2 is the car the loader treats as essential
// (see loading.js and the <link rel=preload> in index.html).

export const SOURCE = { width: 2560, height: 1440 };

// Strip geometry, as fractions of the brand zone.
//
// A close, layered poster composition: larger silhouettes overlap instead of
// shrinking into five separate slots. Edge clearance includes the fixed 1.08
// lens enlargement, so the first nose and last tail stay inside the zone.
const WIDTH = 0.34;
const STEP = 0.145;
const FIRST = 0.21;

const SPEC = [
  {
    id: 'yellow-gt', category: 'GT3', label: 'YELLOW / WHITE GT',
    box: { x: 152, y: 431, w: 2280, h: 637 },
    baseline: 0.620, lens: { w: 0.374, h: 0.375 },
  },
  {
    id: 'pink-formula', category: 'FORMULA 1', label: 'PINK / WHITE FORMULA',
    box: { x: 9, y: 549, w: 2470, h: 524 },
    baseline: 0.620, lens: { w: 0.423, h: 0.355 },
  },
  {
    id: 'cyan-gt', category: 'GT3', label: 'CYAN GT',
    box: { x: 102, y: 430, w: 2379, h: 639 },
    baseline: 0.620, lens: { w: 0.374, h: 0.375 },
  },
  {
    id: 'red-gt', category: 'GT3', label: 'RED GT',
    // Tallest of the five — the rear wing reaches well above the roofline.
    box: { x: 81, y: 307, w: 2271, h: 768 },
    baseline: 0.620, lens: { w: 0.374, h: 0.375 },
  },
  {
    id: 'blue-formula', category: 'FORMULA E', label: 'BLUE / GOLD FORMULA',
    box: { x: 44, y: 482, w: 2288, h: 579 },
    baseline: 0.620, lens: { w: 0.423, h: 0.355 },
  },
];

// The programs section further down the page keeps its own uniform band so all
// three rows share one image height. It has nothing to do with the strip.
const PROGRAM_BAND = 0.72;
const PROGRAM_PAD = 0.035;

export const cars = SPEC.map((spec, index) => {
  const { box } = spec;
  const ground = (box.y + box.h) / SOURCE.height;
  const cropBottom = ground + PROGRAM_PAD;

  return {
    ...spec,
    src: `/cars/${spec.id}.png`,
    index,
    x: FIRST + index * STEP,
    width: WIDTH,
    // Later cars sit over earlier ones, so every nose laps the tail ahead of it.
    z: index + 1,
    // The render is placed so its own alpha box fills the car's slot exactly:
    // width/left against the slot's width, top against its height.
    aspect: box.w / box.h,
    imageW: SOURCE.width / box.w,
    imageX: -box.x / box.w,
    imageY: -box.y / box.h,
    // Kept for the programs rows, which anchor their crop on the contact patch.
    cropTop: cropBottom - PROGRAM_BAND,
    cropBand: PROGRAM_BAND,
  };
});
