import type { ExplorationZone, StoryProgress } from "@/src/types";

export const GM_PIN = "1104";

// Formal route anchors. The survey tool can still refine the exact parking exits
// and photo spots after the final on-site rehearsal.
export const zones: ExplorationZone[] = [
  {
    id: "scent-district",
    order: 1,
    title: "Qianjiang · Scent District",
    subtitle: "万象城与钱江新城 · 寻找城市的气味",
    parkingLabel: "杭州万象城 · P3 出口",
    parkingMapPoint: { x: 118, y: 412 },
    center: { latitude: 30.25402, longitude: 120.20992 },
    routeGeo: [
      { latitude: 30.25402, longitude: 120.20992 },
      { latitude: 30.25408, longitude: 120.21042 },
      { latitude: 30.254158, longitude: 120.21097 },
    ],
    svgPath: "M118 412 C155 390 176 356 210 340 L286 320 Q330 300 370 268 L430 230 L495 184 L548 145 L610 112",
    maxLocationAccuracyM: 200,
    accent: "#6f3f25",
    mapKind: "arcade",
    checkpoints: [
      {
        id: "aesop-scent",
        label: "Aesop",
        giftType: "scent",
        location: { latitude: 30.254158, longitude: 120.21097 },
        unlockRadiusM: 150,
        referenceImage: "/references/scent.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "第一种线索无法被看见，却会比脚步停留得更久。请前往气味汇集的地方，找到属于这一岁的香气。",
        unlockCopy:
          "好闻的，是一阵风经过以后，依然让人想起你的味道。今天的第一份礼物，是一瓶由你亲自选择的香水。",
        photoPrompt: "手指地图前进方向，拍下探索开始的画面。",
        mapPoint: { x: 610, y: 112 },
      },
    ],
  },
  {
    id: "motion-district",
    order: 2,
    title: "Caihe · Motion District",
    subtitle: "庆春东路与采荷街区 · 寻找移动的方式",
    parkingLabel: "采荷街区 · 庆春东路停车点",
    parkingMapPoint: { x: 110, y: 420 },
    center: { latitude: 30.26002, longitude: 120.17805 },
    routeGeo: [
      { latitude: 30.26002, longitude: 120.17805 },
      { latitude: 30.26018, longitude: 120.17839 },
      { latitude: 30.26031, longitude: 120.178712 },
    ],
    svgPath: "M110 420 L180 390 L230 342 L320 330 L390 280 L465 250 L520 192 L575 150 L630 116",
    maxLocationAccuracyM: 200,
    accent: "#4c5636",
    mapKind: "garden",
    checkpoints: [
      {
        id: "liv-motion",
        label: "Liv",
        giftType: "motion",
        location: { latitude: 30.26031, longitude: 120.178712 },
        unlockRadiusM: 150,
        referenceImage: "/references/motion.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "探索不只需要目的地，还需要一种喜欢的出发方式。下一件礼物不会被你带走，它会在今后的很多天里，带你去更远的地方。",
        unlockCopy:
          "好用的，是让普通的上下班，也能变成一小段自由的旅行。第二份礼物，是一辆属于你的自行车。",
        photoPrompt: "扶着一辆想象中的自行车，回头向镜头招手。",
        mapPoint: { x: 630, y: 116 },
      },
    ],
  },
  {
    id: "sound-district",
    order: 3,
    title: "Jingwei · Sound District",
    subtitle: "石桥路与经纬创意园 · 寻找时间的声音",
    parkingLabel: "经纬创意园 · 7A 区停车点",
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
    checkpoints: [
      {
        id: "vinyl-sound",
        label: "聆翔文化",
        giftType: "sound",
        location: { latitude: 30.3251, longitude: 120.18866 },
        unlockRadiusM: 160,
        referenceImage: "/references/sound.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "有些回忆不会消失，它们只是藏进了一圈又一圈的纹路里。当针尖落下，时间便会重新开始旋转。",
        unlockCopy:
          "好听的，是唱针落下的那一刻，房间里只剩音乐和我们。第三份礼物，是一张由你亲自选中的爵士黑胶。",
        photoPrompt: "用一张想象中的唱片遮住半张脸。",
        mapPoint: { x: 602, y: 122 },
      },
    ],
  },
  {
    id: "exploration-main",
    order: 4,
    title: "Qianjiang · Grand Atlas",
    subtitle: "来福士、万象城、城市阳台 · 闪光与高空终点",
    parkingLabel: "杭州来福士 · T1 停车区",
    parkingMapPoint: { x: 130, y: 365 },
    center: { latitude: 30.251737, longitude: 120.207682 },
    routeGeo: [
      { latitude: 30.2515, longitude: 120.2073 },
      { latitude: 30.2528, longitude: 120.209 },
      { latitude: 30.254158, longitude: 120.21097 },
      { latitude: 30.249, longitude: 120.2121 },
      { latitude: 30.244199, longitude: 120.212496 },
      { latitude: 30.2478, longitude: 120.21 },
      { latitude: 30.251737, longitude: 120.207682 },
    ],
    svgPath:
      "M130 365 L210 335 L300 270 L390 210 L535 150 L610 160 L670 225 L670 338 L635 395 L555 395 L475 345 L375 330 L300 335 L230 330",
    maxLocationAccuracyM: 200,
    accent: "#274554",
    mapKind: "city",
    checkpoints: [
      {
        id: "dior-sparkle",
        label: "Dior",
        giftType: "sparkle",
        location: { latitude: 30.254158, longitude: 120.21097 },
        unlockRadiusM: 170,
        referenceImage: "/references/sparkle.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "前面的礼物陪你闻见世界、穿过城市、听见时间。接下来这件礼物，不负责带你去任何地方。它只负责在你抬起手的时候，提醒你今天有多好看。",
        unlockCopy:
          "好看的不只是礼物，是你戴上它以后，我移不开的眼睛。第四份礼物，是一件可以戴在身上的闪光。",
        photoPrompt: "面向橱窗伸出空手腕，为闪光留下位置。",
        mapPoint: { x: 535, y: 150 },
      },
      {
        id: "balcony-taste",
        label: "城市阳台",
        giftType: "taste",
        location: { latitude: 30.244199, longitude: 120.212496 },
        unlockRadiusM: 180,
        referenceImage: "/references/taste.svg",
        matchMode: "scene-only",
        passScore: 70,
        clue:
          "你已经找到了城市的气味、速度、声音和光。最后一个坐标不在街道上。请抬起头，去往今晚距离天空更近的地方。",
        unlockCopy:
          "好吃的，是今天所有路程结束以后，和最喜欢的人一起坐下来。第五份礼物，是杭州夜景里的一顿晚餐。",
        photoPrompt: "抬头寻找高处的终点，让天空占据画面上半部。",
        mapPoint: { x: 670, y: 338 },
      },
      {
        id: "hidden-love",
        label: "Love",
        giftType: "love",
        location: { latitude: 30.251737, longitude: 120.207682 },
        unlockRadiusM: 200,
        referenceImage: "/references/love.svg",
        matchMode: "scene-only",
        passScore: 0,
        clue:
          "地图可以找到气味、礼物、餐厅和城市里的坐标。但有一个地方，从来不需要导航。因为无论走到哪里，你都一直在这里。",
        unlockCopy:
          "前面的五份礼物，分别是好闻的、好用的、好听的、好看的和好吃的。但生日里还应该有一份‘好爱的’。在过去、今天和地图上还没有出现的未来里，你一直都被我好好地爱着。",
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
  "探索者正在穿越地图尚未记录的区域……",
  "前方坐标被云雾笼罩，请在载具停止后继续探索。",
  "有些距离适合用脚步丈量，有些距离需要暂时交给风。",
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
