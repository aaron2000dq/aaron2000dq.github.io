import { rehearsalZones } from "@/src/config/rehearsal";
import { zones as formalZones } from "@/src/config/story";
import type { Checkpoint, ExplorationZone } from "@/src/types";

function testCheckpoint(
  formal: Checkpoint,
  rehearsal: Checkpoint,
  overrides: Partial<Checkpoint> = {},
): Checkpoint {
  return {
    ...formal,
    id: `fulltest-v3-${formal.id}`,
    label: rehearsal.label,
    location: rehearsal.location,
    unlockRadiusM: rehearsal.unlockRadiusM,
    mapPoint: rehearsal.mapPoint,
    ...overrides,
  };
}

// The full test route uses the exact formal story flow, but all live location
// checks are moved to the four fixed rehearsal gates around the nearby block:
// motion → sound → scent → sparkle, then taste/love reuse the north gate.
export const fullTestZones: ExplorationZone[] = [
  {
    ...rehearsalZones[0],
    id: "fulltest-v3-motion-district",
    mysteryTitle: formalZones[0].mysteryTitle,
    mysterySubtitle: formalZones[0].mysterySubtitle,
    checkpoints: [testCheckpoint(formalZones[0].checkpoints[0], rehearsalZones[0].checkpoints[0])],
  },
  {
    ...rehearsalZones[1],
    id: "fulltest-v3-sound-district",
    mysteryTitle: formalZones[1].mysteryTitle,
    mysterySubtitle: formalZones[1].mysterySubtitle,
    checkpoints: [testCheckpoint(formalZones[1].checkpoints[0], rehearsalZones[1].checkpoints[0])],
  },
  {
    ...rehearsalZones[2],
    id: "fulltest-v3-grand-atlas",
    title: "FULI NORTH · GRAND TEST ATLAS",
    subtitle: "富力中心北区西门至北门 · 三枚坐标与隐藏章节",
    mysteryTitle: formalZones[2].mysteryTitle,
    mysterySubtitle: formalZones[2].mysterySubtitle,
    routeGeo: [
      ...rehearsalZones[2].routeGeo,
      ...rehearsalZones[3].routeGeo.slice(1),
    ],
    svgPath: "M401 323 C340 325 276 308 274 264 C274 210 321 174 377 174",
    checkpoints: [
      testCheckpoint(formalZones[2].checkpoints[0], rehearsalZones[2].checkpoints[0], {
        label: "富力中心北区 · 西门",
      }),
      testCheckpoint(formalZones[2].checkpoints[1], rehearsalZones[3].checkpoints[0], {
        label: "富力中心北区 · 北门",
      }),
      testCheckpoint(formalZones[2].checkpoints[2], rehearsalZones[3].checkpoints[0], {
        label: "北门 · 终章测试",
      }),
      testCheckpoint(formalZones[2].checkpoints[3], rehearsalZones[3].checkpoints[0], {
        label: "Love",
      }),
    ],
  },
];
