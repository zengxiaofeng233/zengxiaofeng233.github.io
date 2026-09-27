// Track outlines: Formula 1 official media, downloaded for local delivery.
// Source: https://media.formula1.com/image/upload/c_lfill,w_3392/v1740000001/common/f1/2026/track/2026track{track}blackoutline.svg
const standard = '短排 + 35%';
const sprint = '单排 + 冲刺 + 单排 + 35%';

export const calendarGroups = [
  { id: 'ac1', title: 'AC1', rounds: [
    { round: 1, cn: '伊莫拉', en: 'Imola', format: standard, trackMap: '/tracks/imola.svg' },
    { round: 2, cn: '荷兰', en: 'Netherlands', format: standard, trackMap: '/tracks/zandvoort.svg' },
    { round: 3, cn: '英国', en: 'United Kingdom', format: standard, trackMap: '/tracks/silverstone.svg' },
  ] },
  { id: 'ac2', title: 'AC2', rounds: [
    { round: 4, cn: '摩纳哥', en: 'Monaco', format: sprint, trackMap: '/tracks/montecarlo.svg' },
    { round: 5, cn: '日本', en: 'Japan', format: standard, trackMap: '/tracks/suzuka.svg' },
    { round: 6, cn: '沙特阿拉伯', en: 'Saudi Arabia', format: standard, trackMap: '/tracks/jeddah.svg' },
  ] },
  { id: 'ac3', title: 'AC3', rounds: [
    { round: 7, cn: '德克萨斯', en: 'Texas', format: standard, trackMap: '/tracks/austin.svg' },
    { round: 8, cn: '比利时', en: 'Belgium', format: standard, trackMap: '/tracks/spafrancorchamps.svg' },
    { round: 9, cn: '蒙扎', en: 'Monza', format: sprint, trackMap: '/tracks/monza.svg' },
  ] },
  { id: 'ac4', title: 'AC4', rounds: [
    { round: 10, cn: '阿尔伯特', en: 'Albert Park', format: standard, trackMap: '/tracks/melbourne.svg' },
    { round: 11, cn: '阿塞拜疆', en: 'Azerbaijan', format: sprint, trackMap: '/tracks/baku.svg' },
    { round: 12, cn: '阿布扎比', en: 'Abu Dhabi', format: standard, trackMap: '/tracks/yasmarina.svg' },
  ] },
  { id: 'ac5', title: 'AC5', rounds: [
    { round: 13, cn: '巴西', en: 'Brazil', format: standard, trackMap: '/tracks/interlagos.svg' },
    { round: 14, cn: '卡塔尔', en: 'Qatar', format: sprint, trackMap: '/tracks/lusail.svg' },
    { round: 15, cn: '巴林', en: 'Bahrain', format: standard, trackMap: '/tracks/sakhir.svg' },
  ] },
];
