// Source: AWTC S6 终端.xlsx / 车队名单, O3:AC34 and AE3:AG42.
// Maintain names, colors, levels and leader flags here; the page reads this file only.
// No fill in the workbook is displayed as white (HJW and all level badges).
// User correction: Jioangu belongs only to Nova Atletico, 学院组.
export const driverLevels = {
  "LV4": {
    "color": "#FFFFFF"
  },
  "LV3": {
    "color": "#FFFFFF"
  },
  "LV2": {
    "color": "#FFFFFF"
  },
  "LV1": {
    "color": "#FFFFFF"
  },
  "学院组": {
    "color": "#FFFFFF"
  }
};

export const teams = [
  {
    "id": "ssif",
    "name": "Scuderia Symboli Illusion Ferrari",
    "shortName": "SSIF",
    "color": "#FF0000",
    "drivers": [
      {
        "cn": "鲁道夫象征",
        "en": "Symboli Rudolf",
        "level": "LV1",
        "leader": true
      },
      {
        "cn": "好歌剧",
        "en": "T.M.Opera",
        "level": "LV3"
      },
      {
        "cn": "流川枫",
        "en": "Rukawa Kaede",
        "level": "LV3"
      },
      {
        "cn": "中野梓",
        "en": "Nakano Azusa",
        "level": "LV3"
      },
      {
        "cn": "格拉汉姆艾卡",
        "en": "Graham Aker",
        "level": "LV1"
      },
      {
        "cn": "小栗帽",
        "en": "Oguri Cap",
        "level": "LV1"
      },
      {
        "cn": "卡戎",
        "en": "Charon",
        "level": "LV2"
      }
    ]
  },
  {
    "id": "irt",
    "name": "Isekai Racing Team",
    "shortName": "IRT",
    "color": "#002060",
    "drivers": [
      {
        "cn": "两仪式",
        "en": "Ryougi Shiki",
        "level": "LV4",
        "leader": true
      },
      {
        "cn": "常磐華乃",
        "en": "Tokiwa kano",
        "level": "LV4"
      },
      {
        "cn": "艾克利西亚",
        "en": "Ecclesia",
        "level": "LV3"
      },
      {
        "cn": "羽鸟智世",
        "en": "Hatori Chise",
        "level": "LV3"
      },
      {
        "cn": "西琳",
        "en": "Sirin",
        "level": "LV2"
      },
      {
        "cn": "柊舞缇娜",
        "en": "Hiiragi Utena",
        "level": "LV1"
      }
    ]
  },
  {
    "id": "ykmw",
    "name": "Yuki Min Majo Williams",
    "shortName": "YKMW",
    "color": "#1450B8",
    "drivers": [
      {
        "cn": "樱羽艾玛",
        "en": "Sakuraba Ema",
        "level": "LV3",
        "leader": true
      },
      {
        "cn": "罗恩",
        "en": "Roon",
        "level": "LV3"
      },
      {
        "cn": "C.C.",
        "en": "C.C.",
        "level": "LV2"
      },
      {
        "cn": "轻井泽惠",
        "en": "Karuizawa Kei",
        "level": "LV1"
      },
      {
        "cn": "弦卷心",
        "en": "Tsurumaki Kokoro",
        "level": "LV1"
      },
      {
        "cn": "大鸣大放",
        "en": "Duramente",
        "level": "LV1"
      },
      {
        "cn": "贝阿朵莉切",
        "en": "Beatrice",
        "level": "LV1"
      },
      {
        "cn": "真弓快车",
        "en": "Aston Machan",
        "level": "LV3"
      },
      {
        "cn": "米奥莉奈",
        "en": "Miorine",
        "level": "学院组"
      },
      {
        "cn": "斯莱塔·墨丘利",
        "en": "Suletta Mercury",
        "level": "学院组"
      }
    ]
  },
  {
    "id": "hjw",
    "name": "Ha Ji World",
    "shortName": "HJW",
    "color": "#FFFFFF",
    "drivers": [
      {
        "cn": "妮妮姆",
        "en": "Ninym",
        "level": "LV4",
        "leader": true
      },
      {
        "cn": "赛琳娜弗洛拉",
        "en": "Selena Flora",
        "level": "LV4"
      },
      {
        "cn": "二阶堂希罗",
        "en": "Nikaidou Hiro",
        "level": "LV3"
      },
      {
        "cn": "飞鸟马时",
        "en": "Asuma Toki",
        "level": "LV3"
      },
      {
        "cn": "朽木露琪亚",
        "en": "Kuchiki Rukia",
        "level": "LV2"
      },
      {
        "cn": "苍崎青子",
        "en": "Aozaki Aoko",
        "level": "LV2"
      },
      {
        "cn": "爱弥斯",
        "en": "Aemeath",
        "level": "LV1"
      },
      {
        "cn": "心",
        "en": "Hsin",
        "level": "LV1"
      },
      {
        "cn": "伊地知虹夏",
        "en": "Ijichi Nijika",
        "level": "LV1"
      }
    ]
  },
  {
    "id": "cpl",
    "name": "Capella Mercedes",
    "shortName": "CPL",
    "color": "#98D7B6",
    "drivers": [
      {
        "cn": "目白阿尔丹",
        "en": "Mejiro Ardan",
        "level": "LV3",
        "leader": true
      },
      {
        "cn": "长离",
        "en": "Changli",
        "level": "LV1"
      },
      {
        "cn": "纯田真奈",
        "en": "Sumita Mana",
        "level": "LV1"
      },
      {
        "cn": "黑崎小雪",
        "en": "KurosakiKoyuki",
        "level": "LV2"
      }
    ]
  },
  {
    "id": "srt",
    "name": "Scuderia Roselia Tag Heuer",
    "shortName": "SRT",
    "color": "#FFBA84",
    "drivers": [
      {
        "cn": "凑友希那",
        "en": "Minato Yukina",
        "level": "LV3",
        "leader": true
      },
      {
        "cn": "黑虎阿福",
        "en": "HAK FOO",
        "level": "LV3"
      },
      {
        "cn": "瓦龙",
        "en": "Valmont",
        "level": "LV4"
      },
      {
        "cn": "千咲",
        "en": "Chisa",
        "level": "LV3"
      },
      {
        "cn": "雷电芽衣",
        "en": "Raiden Mei",
        "level": "LV2"
      },
      {
        "cn": "飞鸟凑",
        "en": "Asuka Minato",
        "level": "LV2"
      },
      {
        "cn": "三七",
        "en": "37",
        "level": "LV2"
      },
      {
        "cn": "炽火叶",
        "en": "Kanae Okihi",
        "level": "学院组"
      },
      {
        "cn": "富士奇迹",
        "en": "Fuji Kiseki",
        "level": "学院组"
      }
    ]
  },
  {
    "id": "na",
    "name": "Nova Atletico",
    "shortName": "NA",
    "color": "#FFC000",
    "drivers": [
      {
        "cn": "目白善信",
        "en": "Mejiro Palmer",
        "level": "LV4",
        "leader": true
      },
      {
        "cn": "空门苍",
        "en": "Sorakado Ao",
        "level": "LV4"
      },
      {
        "cn": "恋",
        "en": "Ren",
        "level": "LV2"
      },
      {
        "cn": "远旅",
        "en": "Voyager",
        "level": "LV2"
      },
      {
        "cn": "伊蕾娜",
        "en": "Elaina",
        "level": "LV2"
      },
      {
        "cn": "目白多伯",
        "en": "Mejiro Dober",
        "level": "LV2"
      },
      {
        "cn": "平泽唯",
        "en": "Hirasawa Yui",
        "level": "LV2"
      },
      {
        "cn": "青竹回忆",
        "en": "BemboMemory",
        "level": "学院组"
      },
      {
        "cn": "宵崎奏",
        "en": "Yosaki Kanade",
        "level": "学院组"
      },
      {
        "cn": "凪诚士郎",
        "en": "Nagi Seishiro",
        "level": "LV2"
      },
      {
        "cn": "千早爱音",
        "en": "Chihaya Anon",
        "level": "LV1"
      },
      {
        "cn": "才羽桃井",
        "en": "Saiba Momoi",
        "level": "学院组"
      },
      {
        "cn": "雪之下雪乃",
        "en": "Yukinasita Yukino",
        "level": "LV1"
      },
      {
        "cn": "超级小海湾",
        "en": "Super Creek",
        "level": "学院组"
      },
      {
        "cn": "汐凪",
        "en": "Jioangu",
        "level": "学院组"
      }
    ]
  },
  {
    "id": "pes",
    "name": "Prime Esports",
    "shortName": "PES",
    "color": "#000000",
    "drivers": [
      {
        "cn": "擎天柱",
        "en": "Optimus Prime",
        "level": "LV2",
        "leader": true
      },
      {
        "cn": "山田凉",
        "en": "Yamada Ryo",
        "level": "LV4"
      },
      {
        "cn": "声波",
        "en": "Soundwave",
        "level": "LV2"
      },
      {
        "cn": "醒目飞鹰",
        "en": "Smart Falcon",
        "level": "LV1"
      },
      {
        "cn": "楪祈",
        "en": "Yuzuriha Inori",
        "level": "LV1"
      },
      {
        "cn": "后藤一里",
        "en": "Goto Hitori",
        "level": "LV1"
      },
      {
        "cn": "鸽门儿",
        "en": "GeMer",
        "level": "LV1"
      },
      {
        "cn": "三角初华",
        "en": "MisumiUika",
        "level": "LV2"
      },
      {
        "cn": "横炮",
        "en": "SideSwipe",
        "level": "学院组"
      },
      {
        "cn": "河源木桃香",
        "en": "Momoka",
        "level": "学院组"
      },
      {
        "cn": "酒寄彩叶",
        "en": "Sakayori Iroha",
        "level": "学院组"
      }
    ]
  }
];

export const freeDrivers = [
  {
    "cn": "西木野真姬",
    "en": "Maki Nishikino",
    "level": "LV3"
  },
  {
    "cn": "该隐",
    "en": "Cain",
    "level": "学院组"
  },
  {
    "cn": "幻海",
    "en": "Genkai",
    "level": "学院组"
  },
  {
    "cn": "八奈见杏菜",
    "en": "Yanami Anna",
    "level": "学院组"
  },
  {
    "cn": "九月",
    "en": "Sepetmber",
    "level": "学院组"
  },
  {
    "cn": "桐人",
    "en": "Kirto",
    "level": "学院组"
  },
  {
    "cn": "TKT",
    "en": "TKT",
    "level": "学院组"
  },
  {
    "cn": "斯派克",
    "en": "Spike",
    "level": "LV2"
  },
  {
    "cn": "诺瓦",
    "en": "Noir",
    "level": "学院组"
  },
  {
    "cn": "阿拉蕾",
    "en": "NakamachiArale",
    "level": "学院组"
  },
  {
    "cn": "默尔索",
    "en": "Mersault",
    "level": "学院组"
  },
  {
    "cn": "哆啦A梦",
    "en": "Doraemon",
    "level": "学院组"
  },
  {
    "cn": "浅仓透",
    "en": "Asakura Tooru",
    "level": "学院组"
  },
  {
    "cn": "企业",
    "en": "Enterprise",
    "level": "学院组"
  },
  {
    "cn": "黑羽快斗",
    "en": "Kuroba Kaito",
    "level": "学院组"
  },
  {
    "cn": "能天使",
    "en": "Exusiai",
    "level": "学院组"
  },
  {
    "cn": "阿尔泰尔",
    "en": "Altair",
    "level": "学院组"
  },
  {
    "cn": "青云天空",
    "en": "Seiun Sky",
    "level": "学院组"
  },
  {
    "cn": "诗音",
    "en": "Shion",
    "level": "学院组"
  },
  {
    "cn": "藤都子",
    "en": "Fuji Miyako",
    "level": "学院组"
  },
  {
    "cn": "希儿·芙乐艾",
    "en": "Seele Vollerei",
    "level": "学院组"
  },
  {
    "cn": "符玄",
    "en": "Fuxuan",
    "level": "学院组"
  },
  {
    "cn": "黍",
    "en": "Shu",
    "level": "学院组"
  },
  {
    "cn": "五更琉璃",
    "en": "Gokou Ruri",
    "level": "学院组"
  },
  {
    "cn": "唐三",
    "en": "Tang san",
    "level": "学院组"
  },
  {
    "cn": "惣流明日香兰格雷",
    "en": "Asuka Langley Soryu",
    "level": "学院组"
  },
  {
    "cn": "玫瑰帝国",
    "en": "Rose Kingdom",
    "level": "学院组"
  },
  {
    "cn": "蕾缪安",
    "en": "Lemuen",
    "level": "学院组"
  },
  {
    "cn": "阿尔托莉雅潘德拉贡",
    "en": "Altria Pendragon",
    "level": "学院组"
  },
  {
    "cn": "无量塔姬子",
    "en": "Murata Himeko",
    "level": "学院组"
  },
  {
    "cn": "缇缇",
    "en": "Titi",
    "level": "学院组"
  },
  {
    "cn": "绪山真寻",
    "en": "OyamaMahiro",
    "level": "学院组"
  },
  {
    "cn": "芙莉莲",
    "en": "Frieren",
    "level": "学院组"
  },
  {
    "cn": "大和赤骥",
    "en": "DaiwaScarlet",
    "level": "学院组"
  },
  {
    "cn": "普瑞赛斯",
    "en": "Priestess",
    "level": "学院组"
  },
  {
    "cn": "施巧灵",
    "en": "Shiqiaoling",
    "level": "学院组"
  },
  {
    "cn": "冬时",
    "en": "Kseniya Markovna Nelyudova",
    "level": "学院组"
  },
  {
    "cn": "小光",
    "en": "Hikari",
    "level": "学院组"
  }
];
