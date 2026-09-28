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
// Keep the original overlapping atlas and edge clearance for the fixed 1.08
// enlargement. The scanner moves over it without moving any vehicle.
const WIDTH = 0.34;
const STEP = 0.145;
const FIRST = 0.21;

// 车辆档案编辑区。空字符串表示尚未确认，请勿填入推测的正式数据。
// drivers: [{ name: '' }]；raceHistory: [{ year: '', nameZh: '', nameEn: '' }]。
// has3D 必须同时有 model3d 路径才会显示按钮。索引可单独编辑。
// 专属背景为生成的氛围图；backgroundSrc 留空时自动使用浅底。
const ARCHIVES = {
  'yellow-gt': { displayName: 'Porsche 911 GT3 R (992) LinQinyin', number: '23', className: 'GT3', archiveIndex: '01', archiveTotal: '05', has3D: false, has2D: true, backgroundType: 'none', backgroundSrc: '', raceHistory: [{nameZh: 'N/A'}], drivers: [{ name: '林沁音 LinQinyin' }] },
  'pink-formula': { displayName: 'Fantasy League Team AWTC', number: 'N/A', className: 'Formula', archiveIndex: '02', archiveTotal: '05', has3D: false, has2D: true, backgroundType: 'none', backgroundSrc: '', raceHistory: [{ year: '2026', nameZh: 'FL联赛', nameEn: 'Fantasy League 2026' }], drivers: [{ name: 'MokoRock' }, { name: 'DINIH' }, { name: 'TKT' }, { name: 'Jay_Kimi' }, { name: 'Aya' }] },
  'cyan-gt': {
    displayName: 'VERNE RACING AWTC', number: '11', className: 'GT3', archiveIndex: '03', archiveTotal: '05',
    has3D: true, has2D: true, backgroundType: 'daytona', backgroundSrc: '/backgrounds/daytona.png',
    raceHistory: [{ year: '2026', nameZh: 'FL 戴通纳24小时特别赛', nameEn: 'Fantasy League DAYTONA 24H SPECIAL EVENT' }], drivers: [{ name: 'KidoTsubasa' }, { name: 'Shuki' }, { name: 'MokoRock' }, { name: 'TKT' }, { name: 'Mikeond' }, { name: 'Tanhoiza' }],
  },
  'red-gt': { displayName: 'ERA AWTC White Line', number: '199', className: 'GT3', archiveIndex: '04', archiveTotal: '05', has3D: true, has2D: true, backgroundType: 'nurburgring', backgroundSrc: '/backgrounds/nurburgring.png', raceHistory: [{ year: '2026', nameZh: '嗨跑赛车 24 小时虚拟耐力赛（CHN24）', nameEn: 'Hi-Pole Racing 24-Hour Virtual Endurance Race (CHN24)' }], drivers: [{ name: 'KidoTsubasa' }, { name: 'Shuki' }] },
  'blue-formula': { displayName: 'FormulaE AWTC', number: '91', className: 'FormulaE', archiveIndex: '05', archiveTotal: '05', has3D: false, has2D: true, backgroundType: 'none', backgroundSrc: '', raceHistory: [{ year: '2026', nameZh: 'AWTC电动方程式锦标赛', nameEn: 'AWTC Formula E Championship' }], drivers: [{name:'N/a'}] },
};

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
    model3d: '/models/cyan-gt.glb', model3dMobile: '/models/cyan-gt-mobile.glb',
    box: { x: 102, y: 430, w: 2379, h: 639 },
    baseline: 0.620, lens: { w: 0.374, h: 0.375 },
  },
  {
    id: 'red-gt', category: 'GT3', label: 'RED GT',
    model3d: '/models/red-gt.glb', model3dMobile: '/models/red-gt-mobile.glb',
    viewer: { rotationY: 0 },
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
    model3d: null,
    model3dMobile: null,
    ...spec,
    ...ARCHIVES[spec.id],
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
