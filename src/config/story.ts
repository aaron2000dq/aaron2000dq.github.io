import type { ExplorationZone, StoryProgress } from "@/src/types";

export const GM_PIN = "1104";

// Formal route anchors. The survey tool can still refine the exact parking exits
// and photo spots after the final on-site rehearsal.
export const zones: ExplorationZone[] = [
  {
    id: "motion-district",
    order: 1,
    title: "Caihe · Motion District",
    subtitle: "庆春东路与采荷街区 · 寻找移动的方式",
    mysteryTitle: "XXVIII · THE FIRST PASSAGE",
    mysterySubtitle: "成为巫师的第一步 · 正在寻找新的方向",
    parkingLabel: "庆春发展大厦停车场 · 庆春东路 66 号",
    parkingMapPoint: { x: 110, y: 420 },
    center: { latitude: 30.25746, longitude: 120.19576 },
    routeGeo: [
      // The parking coordinate is an approximate route anchor. Capture the
      // exact pedestrian exit during the final survey before locking the build.
      { latitude: 30.25755, longitude: 120.19562 },
      { latitude: 30.25745, longitude: 120.19574 },
      { latitude: 30.257345, longitude: 120.195869 },
    ],
    svgPath: "M110 420 L180 390 L230 342 L320 330 L390 280 L465 250 L520 192 L575 150 L630 116",
    maxLocationAccuracyM: 200,
    accent: "#4c5636",
    mapKind: "garden",
    illustratedMapAsset: "/assets/maps/caihe-motion-v2.jpg",
    checkpoints: [
      {
        id: "liv-motion",
        label: "Liv",
        mysteryTitle: "第一枚未知坐标",
        mysteryLabel: "答案藏在下一段路",
        storyBeat: "找到你要前进的方式。",
        giftType: "motion",
        location: { latitude: 30.257345, longitude: 120.195869 },
        unlockRadiusM: 30,
        referenceImage: "/references/motion.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "有些礼物会被你带走，有些却会反过来带着你。沿着这一页的脚印，它的咒语是让你的出发更加轻盈。",
        unlockCopy:
          "从这一页开始，二十九岁的路不必只靠双脚。第一个出现在新一岁的魔法，是让通勤也变成自由旅行的动力。",
        photoPrompt: "复刻学长的显影照片，留下此刻的你。",
        mapPoint: { x: 630, y: 116 },
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
    parkingMapPoint: { x: 108, y: 420 },
    center: { latitude: 30.32472, longitude: 120.18808 },
    routeGeo: [
      { latitude: 30.32472, longitude: 120.18808 },
      { latitude: 30.32491, longitude: 120.18838 },
      { latitude: 30.3251, longitude: 120.18866 },
    ],
    svgPath: "M108 420 L170 385 L230 370 L300 330 L382 300 L455 250 L515 210 L560 165 L602 122",
    maxLocationAccuracyM: 200,
    accent: "#3f354a",
    mapKind: "vinyl",
    illustratedMapAsset: "/assets/maps/jingwei-sound-v2.jpg",
    checkpoints: [
      {
        id: "vinyl-sound",
        label: "聆翔文化",
        mysteryTitle: "第二枚未知坐标",
        mysteryLabel: "答案绕着时间旋转",
        storyBeat: "记忆的回声藏起故事。",
        giftType: "sound",
        location: { latitude: 30.3251, longitude: 120.18866 },
        unlockRadiusM: 30,
        referenceImage: "/references/sound.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "有些时刻没有消失，只是藏进一圈又一圈的纹路。沿墨迹找到它，它的咒语是保留下记忆在某一刻的声音。",
        unlockCopy:
          "二十八岁的回声，会在二十九岁的房间里继续旋转。第二个出现在新一岁的魔法，是唱针落下时我在你的身边。",
        photoPrompt: "复刻学长的显影照片，留下此刻的你。",
        mapPoint: { x: 602, y: 122 },
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
    parkingMapPoint: { x: 130, y: 365 },
    center: { latitude: 30.251737, longitude: 120.207682 },
    routeGeo: [
      { latitude: 30.2515, longitude: 120.2073 },
      { latitude: 30.2522, longitude: 120.2109 },
      { latitude: 30.252806, longitude: 120.214476 },
      { latitude: 30.251561, longitude: 120.21563 },
      // City Balcony POI center. Replace with the exact reference-photo
      // standing point after the final night-time survey.
      { latitude: 30.241827, longitude: 120.216803 },
      { latitude: 30.2478, longitude: 120.21 },
      { latitude: 30.251737, longitude: 120.207682 },
    ],
    svgPath:
      "M130 365 L210 335 L300 270 L390 210 L505 135 L550 160 L610 190 L670 338 L635 395 L555 395 L475 345 L375 330 L300 335 L230 330",
    maxLocationAccuracyM: 200,
    accent: "#274554",
    mapKind: "city",
    illustratedMapAsset: "/assets/maps/qianjiang-grand-v2.jpg",
    checkpoints: [
      {
        id: "aesop-scent",
        label: "Aesop",
        mysteryTitle: "第三枚未知坐标",
        mysteryLabel: "答案尚在风里",
        storyBeat: "留意风吹来的方向。",
        giftType: "scent",
        location: { latitude: 30.252806, longitude: 120.214476 },
        unlockRadiusM: 30,
        referenceImage: "/references/scent.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "它有神奇的魔法，看不见也摸不着；顺着风吹来的方向，它的咒语是让路过的人都快乐。",
        unlockCopy:
          "二十八岁的最后一阵风，被装进你亲自挑选的香气里。第三个出现在二十九岁的魔法，是低头时就能闻到爱的味道。",
        photoPrompt: "复刻学长的显影照片，留下此刻的你。",
        mapPoint: { x: 505, y: 135 },
      },
      {
        id: "dior-sparkle",
        label: "Dior",
        mysteryTitle: "第四枚未知坐标",
        mysteryLabel: "答案正在夜色里发光",
        storyBeat: "收下一束只属于你的光。",
        giftType: "sparkle",
        location: { latitude: 30.251561, longitude: 120.21563 },
        unlockRadiusM: 30,
        referenceImage: "/references/sparkle.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "这一页不留给世界，你只需要留给自己；它的咒语是在你抬起手的时候，留下一点属于你的光芒。",
        unlockCopy:
          "这是入学前最后一夜里，专门留给你的光。第四个魔法，是把自己装扮好看的闪亮时刻。",
        photoPrompt: "复刻学长的显影照片，留下此刻的你。",
        mapPoint: { x: 550, y: 160 },
      },
      {
        id: "balcony-taste",
        label: "城市阳台",
        mysteryTitle: "第五枚未知坐标",
        mysteryLabel: "答案比城市更接近天空",
        storyBeat: "新世界的大门已为你打开，天才巫师的惊喜坐标均已解锁。",
        giftType: "taste",
        location: { latitude: 30.241827, longitude: 120.216803 },
        unlockRadiusM: 30,
        referenceImage: "/references/taste.svg",
        matchMode: "scene-only",
        passScore: 70,
        clue:
          "地面上的四页已经写完。最后一枚坐标不藏在脚边，请抬起头，去往今晚比城市更接近天空的地方。",
        unlockCopy:
          "二十九岁的无限可能顺利开启，请前往探索属于你的精彩一岁。第五个魔法，是在麻瓜世界的背后总有人等着你一起分享今天的晚餐。",
        photoPrompt: "复刻学长的显影照片，留下此刻的你。",
        mapPoint: { x: 670, y: 338 },
      },
      {
        id: "hidden-love",
        label: "Love",
        mysteryTitle: "地图之外的最后一页",
        mysteryLabel: "它从来不需要坐标",
        storyBeat: "读完这封信，二十八岁的故事合上，二十九岁的第一章正式开始。",
        giftType: "love",
        location: { latitude: 30.251737, longitude: 120.207682 },
        unlockRadiusM: 30,
        referenceImage: "/references/love.svg",
        matchMode: "scene-only",
        passScore: 0,
        clue:
          "地图找到了五枚坐标，却还有一个地方从来不需要导航。无论走到哪里，那里一直都在你的身边。",
        unlockCopy:
          "前面的五个魔法，会陪你走进二十九岁；最后这一份不用拿在手里，读完这封信，二十八岁的故事合上，过去的地图已经无法抵达。但在今天和地图尚未画出的未来里，你都会被我好好地爱着。那么，准备好入学面对新的一切了吗，拥有魔法的天才饼饼？",
        photoPrompt: "不需要复刻。请打开最后一封信。",
        mapPoint: { x: 230, y: 330 },
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
