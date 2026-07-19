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
    id: `fulltest-${formal.id}`,
    label: rehearsal.label,
    location: rehearsal.location,
    unlockRadiusM: rehearsal.unlockRadiusM,
    mapPoint: rehearsal.mapPoint,
    ...overrides,
  };
}

// The full test route uses the exact formal story flow, but all live location
// checks are moved to the four fixed rehearsal maps around the nearby block.
export const fullTestZones: ExplorationZone[] = [
  {
    ...rehearsalZones[0],
    id: "fulltest-scent-district",
    checkpoints: [testCheckpoint(formalZones[0].checkpoints[0], rehearsalZones[0].checkpoints[0])],
  },
  {
    ...rehearsalZones[1],
    id: "fulltest-motion-district",
    checkpoints: [testCheckpoint(formalZones[1].checkpoints[0], rehearsalZones[1].checkpoints[0])],
  },
  {
    ...rehearsalZones[2],
    id: "fulltest-sound-district",
    checkpoints: [testCheckpoint(formalZones[2].checkpoints[0], rehearsalZones[2].checkpoints[0])],
  },
  {
    ...rehearsalZones[3],
    id: "fulltest-grand-atlas",
    title: "AICHENG · GRAND TEST ATLAS",
    subtitle: "创景路与爱橙街 · 闪光、终点与隐藏章节",
    checkpoints: [
      testCheckpoint(formalZones[3].checkpoints[0], rehearsalZones[3].checkpoints[0], {
        label: "创景路 · 南街口",
        location: { latitude: 30.273089, longitude: 119.994053 },
        mapPoint: { x: 505, y: 362 },
      }),
      testCheckpoint(formalZones[3].checkpoints[1], rehearsalZones[3].checkpoints[0], {
        label: "爱橙街 · 东桥",
        location: { latitude: 30.272935, longitude: 119.993317 },
        mapPoint: { x: 630, y: 390 },
      }),
      testCheckpoint(formalZones[3].checkpoints[2], rehearsalZones[3].checkpoints[0], {
        label: "Love",
        location: { latitude: 30.272935, longitude: 119.993317 },
        mapPoint: { x: 185, y: 145 },
      }),
    ],
  },
];
