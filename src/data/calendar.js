// Track outlines: Formula 1 official media, downloaded for local delivery.
// Source: https://media.formula1.com/image/upload/c_lfill,w_3392/v1740000001/common/f1/2026/track/2026track{track}blackoutline.svg
// 维护说明：每个分组代表一个 STAGE；rounds 中每条记录代表一个 ROUND。
// ROUNDS / STAGES / SPRINTS 由页面自动统计，无需重复填写总数。
// round：轮次；cn / en：中英文赛道名；trackMap：public 下赛道图的路径。
// hasSprint：是否有冲刺赛；shortQualifying：true 为短排，false 为单排。
// racePercent：正赛长度百分比。冲刺站保留“排位 + 冲刺 + 排位 + 正赛”的顺序。
// date：仅填写月日范围（MM.DD～MM.DD）；休赛周不添加记录。
// 本季以 2026 年 R7 = 10.02～10.03 为基准，每周五六比赛，AC 之间休赛一周。

export const calendarGroups = [
  { id: 'ac1', title: 'AC1', rounds: [
    { round: 1, cn: '伊莫拉', en: 'Imola', hasSprint: false, shortQualifying: true, racePercent: 35, date: '08.07～08.08', trackMap: '/tracks/imola.svg' },
    { round: 2, cn: '荷兰', en: 'Netherlands', hasSprint: false, shortQualifying: true, racePercent: 35, date: '08.14～08.15', trackMap: '/tracks/zandvoort.svg' },
    { round: 3, cn: '英国', en: 'United Kingdom', hasSprint: false, shortQualifying: true, racePercent: 35, date: '08.21～08.22', trackMap: '/tracks/silverstone.svg' },
  ] },
  { id: 'ac2', title: 'AC2', rounds: [
    { round: 4, cn: '摩纳哥', en: 'Monaco', hasSprint: true, shortQualifying: false, racePercent: 35, date: '09.04～09.05', trackMap: '/tracks/montecarlo.svg' },
    { round: 5, cn: '日本', en: 'Japan', hasSprint: false, shortQualifying: true, racePercent: 35, date: '09.11～09.12', trackMap: '/tracks/suzuka.svg' },
    { round: 6, cn: '沙特阿拉伯', en: 'Saudi Arabia', hasSprint: false, shortQualifying: true, racePercent: 35, date: '09.18～09.19', trackMap: '/tracks/jeddah.svg' },
  ] },
  { id: 'ac3', title: 'AC3', rounds: [
    { round: 7, cn: '德克萨斯', en: 'Texas', hasSprint: false, shortQualifying: true, racePercent: 35, date: '10.02～10.03', trackMap: '/tracks/austin.svg' },
    { round: 8, cn: '比利时', en: 'Belgium', hasSprint: false, shortQualifying: true, racePercent: 35, date: '10.09～10.10', trackMap: '/tracks/spafrancorchamps.svg' },
    { round: 9, cn: '蒙扎', en: 'Monza', hasSprint: true, shortQualifying: false, racePercent: 35, date: '10.16～10.17', trackMap: '/tracks/monza.svg' },
  ] },
  { id: 'ac4', title: 'AC4', rounds: [
    { round: 10, cn: '阿尔伯特', en: 'Albert Park', hasSprint: false, shortQualifying: true, racePercent: 35, date: '10.30～10.31', trackMap: '/tracks/melbourne.svg' },
    { round: 11, cn: '阿塞拜疆', en: 'Azerbaijan', hasSprint: true, shortQualifying: false, racePercent: 35, date: '11.06～11.07', trackMap: '/tracks/baku.svg' },
    { round: 12, cn: '阿布扎比', en: 'Abu Dhabi', hasSprint: false, shortQualifying: true, racePercent: 35, date: '11.13～11.14', trackMap: '/tracks/yasmarina.svg' },
  ] },
  { id: 'ac5', title: 'AC5', rounds: [
    { round: 13, cn: '巴西', en: 'Brazil', hasSprint: false, shortQualifying: true, racePercent: 35, date: '11.27～11.28', trackMap: '/tracks/interlagos.svg' },
    { round: 14, cn: '卡塔尔', en: 'Qatar', hasSprint: true, shortQualifying: false, racePercent: 35, date: '12.04～12.05', trackMap: '/tracks/lusail.svg' },
    { round: 15, cn: '巴林', en: 'Bahrain', hasSprint: false, shortQualifying: true, racePercent: 35, date: '12.11～12.12', trackMap: '/tracks/sakhir.svg' },
  ] },
];
