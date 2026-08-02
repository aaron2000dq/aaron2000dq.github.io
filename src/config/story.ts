import type { ExplorationZone, StoryProgress } from "@/src/types";

export const GM_PIN = "1104";

// Formal runtime coordinates are WGS-84, matching browser Geolocation. The
// original GCJ-02 POIs were converted only during data preparation and checked
// against nearby OSM road/building geometry; they are never mixed at runtime.
export const zones: ExplorationZone[] = [
  {
    id: "motion-district",
    order: 1,
    title: "Caihe · Motion District",
    subtitle: "庆春东路与采荷街区 · 寻找移动的方式",
    mysteryTitle: "XXVIII · THE FIRST PASSAGE",
    mysterySubtitle: "成为巫师的第一步 · 正在寻找新的方向",
    parkingLabel: "采荷小区紫藕邨 1 幢附近 · 双菱路 60 号",
    // The formal page is registered to the real scene shown during the field
    // test: 紫藕邨 is east of the canal; the bicycle shop is west of the canal
    // on the south side of 庆春东路. These page anchors deliberately preserve
    // that relationship instead of mirroring it for visual composition.
    parkingMapPoint: { x: 558.9, y: 255 },
    center: { latitude: 30.2598, longitude: 120.19218 },
    coordinateSystem: "wgs84",
    routeGeo: [
      { latitude: 30.2597229, longitude: 120.1930934 },
      { latitude: 30.259855, longitude: 120.19306 },
      { latitude: 30.259855, longitude: 120.19152 },
      { latitude: 30.2597418, longitude: 120.1912823 },
    ],
    mapRoutePoints: [
      { x: 558.9, y: 255 },
      { x: 553.6, y: 230.6 },
      { x: 307.2, y: 230.6 },
      { x: 269.2, y: 251.5 },
    ],
    svgPath: "M558.9 255 L553.6 230.6 L307.2 230.6 L269.2 251.5",
    maxLocationAccuracyM: 200,
    accent: "#4c5636",
    mapKind: "garden",
    mapOrientation: "north-up",
    mapBounds: {
      north: 30.2611,
      south: 30.2584,
      west: 120.1896,
      east: 120.1946,
    },
    illustratedMapAsset: "/assets/maps/caihe-motion-v3.jpg",
    checkpoints: [
      {
        id: "liv-motion",
        label: "Liv",
        mysteryTitle: "第一枚未知坐标",
        mysteryLabel: "答案藏在下一段路",
        storyBeat: "找到你要前进的方式。",
        giftType: "motion",
        location: { latitude: 30.2597418, longitude: 120.1912823 },
        unlockRadiusM: 30,
        referenceImage: "/references/motion-official-v1.jpg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "有些礼物会被你带走，有些却会反过来带着你。沿着这一页的脚印，它的咒语是让你的出发更加轻盈。",
        unlockCopy:
          "从这一页开始，二十九岁的路不必只靠双脚。第一个出现在新一岁的魔法，是让通勤也变成自由旅行的动力。",
        photoPrompt: "复刻学长的显影照片，留下此刻的你。",
        mapPoint: { x: 269.2, y: 251.5 },
      },
    ],
  },
  {
    id: "sound-district",
    order: 2,
    title: "Jingwei · Sound District",
    subtitle: "石桥路与经纬创意园 · 寻找时间的声音",
    mysteryTitle: "XXVIII · THE SECOND ECHO",
    mysterySubtitle: "成为巫师的第二步 · 被时间保存的一小段",
    parkingLabel: "经纬国际创意产业园停车场 · 石桥路 279 号",
    parkingMapPoint: { x: 307, y: 320.5 },
    center: { latitude: 30.32729, longitude: 120.18376 },
    coordinateSystem: "wgs84",
    routeGeo: [
      { latitude: 30.3270953, longitude: 120.1834653 },
      { latitude: 30.3272858, longitude: 120.1837661 },
      { latitude: 30.3274763, longitude: 120.1840469 },
    ],
    mapRoutePoints: [
      { x: 307, y: 320.5 },
      { x: 403.2, y: 250.1 },
      { x: 493.1, y: 179.6 },
    ],
    svgPath: "M307 320.5 L403.2 250.1 L493.1 179.6",
    maxLocationAccuracyM: 200,
    accent: "#3f354a",
    mapKind: "vinyl",
    mapOrientation: "north-up",
    mapBounds: {
      north: 30.327962,
      south: 30.32661,
      west: 120.182506,
      east: 120.185006,
    },
    illustratedMapAsset: "/assets/maps/jingwei-sound-v3.jpg",
    checkpoints: [
      {
        id: "vinyl-sound",
        label: "聆翔文化",
        mysteryTitle: "第二枚未知坐标",
        mysteryLabel: "答案绕着时间旋转",
        storyBeat: "记忆的回声藏起故事。",
        giftType: "sound",
        location: { latitude: 30.3274763, longitude: 120.1840469 },
        unlockRadiusM: 30,
        referenceImage: "/references/sound.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "有些时刻没有消失，只是藏进一圈又一圈的纹路。沿墨迹找到它，它的咒语是保留下记忆在某一刻的声音。",
        unlockCopy:
          "二十八岁的回声，会在二十九岁的房间里继续旋转。第二个出现在新一岁的魔法，是唱针落下时我在你的身边。",
        photoPrompt: "复刻学长的显影照片，留下此刻的你。",
        mapPoint: { x: 493.1, y: 179.6 },
      },
    ],
  },
  {
    id: "exploration-main",
    order: 3,
    title: "Qianjiang · Grand Atlas",
    subtitle: "来福士、万象城、城市阳台 · 三个魔法连续显形",
    mysteryTitle: "XXVIII · THE GRAND ATLAS",
    mysterySubtitle: "入学前的最后一程 · 还藏着三枚坐标",
    parkingLabel: "杭州来福士中心 · T1 停车区",
    parkingMapPoint: { x: 172.4, y: 134.8 },
    center: { latitude: 30.2541536, longitude: 120.2031277 },
    coordinateSystem: "wgs84",
    routeGeo: [
      { latitude: 30.2539161, longitude: 120.2027447 },
      { latitude: 30.2546214, longitude: 120.2063537 },
      { latitude: 30.2552323, longitude: 120.2099383 },
      { latitude: 30.253989, longitude: 120.2110951 },
      // City Balcony POI center. Replace with the exact reference-photo
      // standing point after the final night-time survey.
      { latitude: 30.2442573, longitude: 120.2122716 },
      { latitude: 30.2502204, longitude: 120.2054519 },
      { latitude: 30.2541536, longitude: 120.2031277 },
    ],
    mapRoutePoints: [
      { x: 172.4, y: 134.8 },
      { x: 330.2, y: 114.1 },
      { x: 486.9, y: 96.1 },
      { x: 537.5, y: 132.7 },
      { x: 588.9, y: 418.9 },
      { x: 290.8, y: 243.5 },
      { x: 189.2, y: 127.8 },
    ],
    svgPath:
      "M172.4 134.8 L330.2 114.1 L486.9 96.1 L537.5 132.7 L588.9 418.9 L290.8 243.5 L189.2 127.8",
    maxLocationAccuracyM: 200,
    accent: "#274554",
    mapKind: "city",
    mapOrientation: "north-up",
    mapBounds: {
      north: 30.2585,
      south: 30.2415,
      west: 120.1988,
      east: 120.2171,
    },
    illustratedMapAsset: "/assets/maps/qianjiang-grand-north-v4.png",
    checkpoints: [
      {
        id: "aesop-scent",
        label: "Aesop",
        mysteryTitle: "第三枚未知坐标",
        mysteryLabel: "答案尚在风里",
        storyBeat: "留意风吹来的方向。",
        giftType: "scent",
        location: { latitude: 30.2552323, longitude: 120.2099383 },
        unlockRadiusM: 30,
        referenceImage: "/references/scent.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "它有神奇的魔法，看不见也摸不着；顺着风吹来的方向，它的咒语是让路过的人都快乐。",
        unlockCopy:
          "二十八岁的最后一阵风，被装进你亲自挑选的香气里。第三个出现在二十九岁的魔法，是低头时就能闻到爱的味道。",
        photoPrompt: "复刻学长的显影照片，留下此刻的你。",
        mapPoint: { x: 486.9, y: 96.1 },
      },
      {
        id: "dior-sparkle",
        label: "Dior",
        mysteryTitle: "第四枚未知坐标",
        mysteryLabel: "答案正在夜色里发光",
        storyBeat: "收下一束只属于你的光。",
        giftType: "sparkle",
        location: { latitude: 30.253989, longitude: 120.2110951 },
        unlockRadiusM: 30,
        referenceImage: "/references/sparkle.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "这一页不留给世界，你只需要留给自己；它的咒语是在你抬起手的时候，留下一点属于你的光芒。",
        unlockCopy:
          "这是入学前最后一夜里，专门留给你的光。第四个魔法，是把自己装扮好看的闪亮时刻。",
        photoPrompt: "复刻学长的显影照片，留下此刻的你。",
        mapPoint: { x: 537.5, y: 132.7 },
      },
      {
        id: "balcony-taste",
        label: "城市阳台",
        mysteryTitle: "第五枚未知坐标",
        mysteryLabel: "答案比城市更接近天空",
        storyBeat: "新世界的大门已为你打开，天才巫师的惊喜坐标均已解锁。",
        giftType: "taste",
        location: { latitude: 30.2442573, longitude: 120.2122716 },
        unlockRadiusM: 30,
        referenceImage: "/references/taste.svg",
        matchMode: "scene-only",
        passScore: 70,
        clue:
          "地面上的四页已经写完。最后一枚坐标不藏在脚边，请抬起头，去往今晚比城市更接近天空的地方。",
        unlockCopy:
          "二十九岁的无限可能顺利开启，请前往探索属于你的精彩一岁。第五个魔法，是在麻瓜世界的背后总有人等着你一起分享今天的晚餐。",
        photoPrompt: "复刻学长的显影照片，留下此刻的你。",
        mapPoint: { x: 588.9, y: 418.9 },
      },
      {
        id: "hidden-love",
        label: "Love",
        mysteryTitle: "地图之外的最后一页",
        mysteryLabel: "它从来不需要坐标",
        storyBeat: "读完这封信，二十八岁的故事合上，二十九岁的第一章正式开始。",
        giftType: "love",
        location: { latitude: 30.2541536, longitude: 120.2031277 },
        unlockRadiusM: 30,
        referenceImage: "/references/love.svg",
        matchMode: "scene-only",
        passScore: 0,
        clue:
          "地图找到了五枚坐标，却还有一个地方从来不需要导航。无论走到哪里，那里一直都在你的身边。",
        unlockCopy:
          "前面的五个魔法，会陪你走进二十九岁；最后这一份不用拿在手里，读完这封信，二十八岁的故事合上，过去的地图已经无法抵达。但在今天和地图尚未画出的未来里，你都会被我好好地爱着。那么，准备好入学面对新的一切了吗，拥有魔法的天才饼饼？",
        photoPrompt: "不需要复刻。请打开最后一封信。",
        mapPoint: { x: 189.2, y: 127.8 },
      },
    ],
  },
];

export const initialProgress: StoryProgress = {
  activeZoneId: zones[0].id,
  activeCheckpointId: zones[0].checkpoints[0].id,
  completedCheckpointIds: [],
  photoAttempts: {},
  capturedPhotoIds: [],
  phase: "intro",
  zoneStarted: false,
  arrivedCheckpointIds: [],
};

export const fogMessages = [
  "入学第一枚印记已经收好。前方还有一段回声，等待被时间重新唤醒。",
  "两枚入学印记已经收好。最后三枚坐标，将在同一片夜色里连续显形。",
];

export function findZone(id: string) {
  return zones.find((zone) => zone.id === id) ?? zones[0];
}

export function findCheckpoint(id: string) {
  for (const zone of zones) {
    const checkpoint = zone.checkpoints.find((item) => item.id === id);
    if (checkpoint) return { checkpoint, zone };
  }
  return { checkpoint: zones[0].checkpoints[0], zone: zones[0] };
}
