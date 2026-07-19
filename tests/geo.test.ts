import { describe, expect, it } from "vitest";
import {
  haversineDistance,
  isInsideCheckpoint,
  matchPositionToRoute,
  medianSample,
} from "../src/lib/geo";

describe("geographic matching", () => {
  const route = [
    { latitude: 30.275, longitude: 119.99 },
    { latitude: 30.275, longitude: 119.991 },
    { latitude: 30.275, longitude: 119.992 },
  ];

  it("computes useful meter distances", () => {
    const distance = haversineDistance(route[0], route[1]);
    expect(distance).toBeGreaterThan(90);
    expect(distance).toBeLessThan(100);
  });

  it("snaps a nearby position to route progress", () => {
    const match = matchPositionToRoute(
      { latitude: 30.27502, longitude: 119.991 },
      route,
      route[2],
    );
    expect(match.progress).toBeGreaterThan(0.45);
    expect(match.progress).toBeLessThan(0.55);
    expect(match.distanceFromRouteM).toBeLessThan(4);
  });

  it("uses median values to suppress a location spike", () => {
    const sample = medianSample([
      { latitude: 30.27, longitude: 119.99, accuracy: 20, timestamp: 1 },
      { latitude: 31.5, longitude: 121.0, accuracy: 900, timestamp: 2 },
      { latitude: 30.2701, longitude: 119.9901, accuracy: 22, timestamp: 3 },
    ]);
    expect(sample?.latitude).toBeCloseTo(30.2701);
    expect(sample?.accuracy).toBe(22);
  });

  it("allows a bounded accuracy cushion for geofences", () => {
    expect(isInsideCheckpoint(165, 80, 150)).toBe(true);
    expect(isInsideCheckpoint(260, 80, 150)).toBe(false);
  });
});
