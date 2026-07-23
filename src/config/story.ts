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
    mysteryTitle: "XXVIII · THE FIRST TRACE",
    mysterySubtitle: "二十八岁的最后一页 · 第一枚坐标仍在雾中",
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
        mysteryTitle: "第一枚未知坐标",
        mysteryLabel: "答案尚在风里",
        storyBeat: "把二十八岁的最后一阵风，收进二十九岁的第一件行李。",
        giftType: "scent",
        location: { latitude: 30.254158, longitude: 120.21097 },
        unlockRadiusM: 150,
        referenceImage: "/references/scent.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "它看不见，也握不住，却能让一段记忆忽然回来。沿着墨迹前进，二十八岁的最后一阵风正在终点等你。",
        unlockCopy:
          "二十八岁的最后一阵风，被装进你亲自挑选的香气里。第一件带去二十九岁的行李，是一瓶属于你的香水。",
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
    mysteryTitle: "XXVIII · THE SECOND PASSAGE",
    mysterySubtitle: "旧一岁的脚步 · 正在寻找新的方向",
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
        mysteryTitle: "第二枚未知坐标",
        mysteryLabel: "答案藏在下一段路",
        storyBeat: "让二十八岁走过的路，变成二十九岁出发的方向。",
        giftType: "motion",
        location: { latitude: 30.26031, longitude: 120.178712 },
        unlockRadiusM: 150,
        referenceImage: "/references/motion.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "有些礼物会被你带走，有些却会反过来带着你。沿着这一页的脚印，去找到二十九岁更轻盈的出发方式。",
        unlockCopy:
          "从这一页开始，二十九岁的路不必只靠双脚。第二件行李是一辆属于你的自行车，让普通的通勤也变成一小段自由旅行。",
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
    mysteryTitle: "XXVIII · THE THIRD ECHO",
    mysterySubtitle: "被时间保存的一小段 · 正等待再次发生",
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
        mysteryTitle: "第三枚未知坐标",
        mysteryLabel: "答案绕着时间旋转",
        storyBeat: "让二十八岁的回声，在二十九岁的房间里重新响起。",
        giftType: "sound",
        location: { latitude: 30.3251, longitude: 120.18866 },
        unlockRadiusM: 160,
        referenceImage: "/references/sound.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "有些时刻没有消失，只是藏进一圈又一圈的纹路。沿墨迹找到它，让二十八岁的某段回声重新发生。",
        unlockCopy:
          "二十八岁的回声，会在二十九岁的房间里继续旋转。第三件行李是一张由你亲自选中的爵士黑胶，等唱针落下，只剩音乐和我们。",
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
    mysteryTitle: "XXVIII · THE NIGHT ATLAS",
    mysterySubtitle: "旧一岁的最后一夜 · 还藏着两枚坐标",
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
        mysteryTitle: "第四枚未知坐标",
        mysteryLabel: "答案正在夜色里发光",
        storyBeat: "收下一束只属于你的光，照亮二十九岁的第一章。",
        giftType: "sparkle",
        location: { latitude: 30.254158, longitude: 120.21097 },
        unlockRadiusM: 170,
        referenceImage: "/references/sparkle.svg",
        matchMode: "pose-scene",
        passScore: 72,
        clue:
          "前三页已经被收进行囊。第四页不负责带你去任何地方，它只在你抬起手的时候，留下一点只属于你的光。",
        unlockCopy:
          "这是二十八岁最后一夜里，专门留给你的光。第四件行李是一件戴在身上的闪耀，陪你照亮二十九岁的第一章。",
        photoPrompt: "面向橱窗伸出空手腕，为闪光留下位置。",
        mapPoint: { x: 535, y: 150 },
      },
      {
        id: "balcony-taste",
        label: "城市阳台",
        mysteryTitle: "第五枚未知坐标",
        mysteryLabel: "答案比城市更接近天空",
        storyBeat: "在杭州的夜色里，好好告别二十八岁，再一起迎接下一岁。",
        giftType: "taste",
        location: { latitude: 30.244199, longitude: 120.212496 },
        unlockRadiusM: 180,
        referenceImage: "/references/taste.svg",
        matchMode: "scene-only",
        passScore: 70,
        clue:
          "地面上的四页已经写完。最后一枚坐标不藏在脚边，请抬起头，去往今晚比城市更接近天空的地方。",
        unlockCopy:
          "在杭州夜景前，我们把二十八岁好好收藏，再坐下来迎接二十九岁。第五件行李，是和最喜欢的人共享的一顿晚餐与生日蛋糕。",
        photoPrompt: "抬头寻找高处的终点，让天空占据画面上半部。",
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
        unlockRadiusM: 200,
        referenceImage: "/references/love.svg",
        matchMode: "scene-only",
        passScore: 0,
        clue:
          "地图找到了五枚坐标，却还有一个地方从来不需要导航。无论走到哪里，你都一直在那里。",
        unlockCopy:
          "前面的五件行李，会陪你走进二十九岁；最后这一份不用拿在手里。读完这封信，二十八岁的故事合上，而在过去、今天和地图尚未画出的未来里，你都会被我好好地爱着。",
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
  "二十八岁的第一枚印记已经收好。地图正在把下一段路，折进二十九岁的行囊。",
  "旧一岁的脚步正在变成新的方向。前方还有一段回声，等待被时间重新唤醒。",
  "二十八岁的回声渐渐远去。最后两枚坐标，将在同一片夜色里连续显形。",
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
