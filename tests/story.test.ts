import { describe, expect, it } from "vitest";
import { fullTestZones } from "@/src/config/fullTestStory";
import { fogMessages, zones } from "@/src/config/story";

describe("formal story route", () => {
  it("uses two standalone drives followed by one three-coordinate walking atlas", () => {
    expect(zones).toHaveLength(3);
    expect(fogMessages).toHaveLength(2);
    expect(zones.map((zone) => zone.checkpoints.filter((item) => item.giftType !== "love").length))
      .toEqual([1, 1, 3]);
    expect(zones.flatMap((zone) => zone.checkpoints).map((item) => item.giftType))
      .toEqual(["motion", "sound", "scent", "sparkle", "taste", "love"]);
  });

  it("starts each map at the intended parking area", () => {
    expect(zones.map((zone) => zone.parkingLabel)).toEqual([
      "外海商厦立体停车场 · 庆春东路 58 号",
      "经纬国际创意产业园停车场 · 石桥路 279 号",
      "杭州来福士中心 · T1 停车区",
    ]);
  });

  it("keeps Aesop, Dior and City Balcony on the same walking route", () => {
    expect(zones[2].checkpoints.slice(0, 3).map((item) => item.label))
      .toEqual(["Aesop", "Dior", "城市阳台"]);
    expect(zones[2].mysterySubtitle).toContain("三枚坐标");
  });

  it("uses one new illustrated map for each of the three formal walking areas", () => {
    expect(zones.map((zone) => zone.illustratedMapAsset)).toEqual([
      "/assets/maps/caihe-motion-v3.jpg",
      "/assets/maps/jingwei-sound-v3.jpg",
      "/assets/maps/qianjiang-grand-v3.jpg",
    ]);
  });

  it("keeps every active goal clear of the floating quest panel", () => {
    for (const zone of zones) {
      for (const checkpoint of zone.checkpoints) {
        expect(checkpoint.mapPoint.x).toBeLessThanOrEqual(590);
      }
    }
  });
});

describe("full rehearsal story route", () => {
  it("mirrors the formal three-map structure around the four fixed gates", () => {
    expect(fullTestZones).toHaveLength(3);
    expect(fullTestZones.flatMap((zone) => zone.checkpoints).map((item) => item.giftType))
      .toEqual(["motion", "sound", "scent", "sparkle", "taste", "love"]);
  });
});
