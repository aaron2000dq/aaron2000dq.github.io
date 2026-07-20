import { describe, expect, it } from "vitest";
import {
  haversineDistance,
  holdLastReliablePosition,
  isInsideCheckpoint,
  matchPositionToRoute,
  medianSample,
  projectLocationToBounds,
  projectPositionToMap,
  smoothPositionSample,
} from "../src/lib/geo";
import { rehearsalZones } from "../src/config/rehearsal";

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
    expect(isInsideCheckpoint(0, 500, 150, 200)).toBe(false);
    expect(isInsideCheckpoint(0, Number.NaN, 150, 200)).toBe(false);
  });

  it("freezes at the last reliable coordinate when a coarse sample arrives", () => {
    const previous = { latitude: 30.275, longitude: 119.99, accuracy: 24, timestamp: 1 };
    const held = holdLastReliablePosition(previous, {
      latitude: 30.28,
      longitude: 120.01,
      accuracy: 500,
      timestamp: 2,
    });
    expect(held?.latitude).toBe(previous.latitude);
    expect(held?.longitude).toBe(previous.longitude);
    expect(held?.accuracy).toBe(500);
    expect(held?.timestamp).toBe(2);
    expect(holdLastReliablePosition(null, { ...previous, accuracy: 500 })).toBeNull();
  });

  it("projects live coordinates in two dimensions instead of snapping to route progress", () => {
    const zone = rehearsalZones[0];
    const checkpoint = zone.checkpoints[0];
    const first = projectPositionToMap(
      { latitude: 30.2748, longitude: 119.9904 },
      zone,
      checkpoint,
    );
    const second = projectPositionToMap(
      { latitude: 30.2750, longitude: 119.9904 },
      zone,
      checkpoint,
    );
    expect(Math.abs(second.y - first.y)).toBeGreaterThan(10);
    expect(Math.abs(second.x - first.x)).toBeLessThan(1);
  });

  it("keeps the four-gate map aligned to its real OSM bounds", () => {
    const zone = rehearsalZones[0];
    const point = projectLocationToBounds(zone.checkpoints[0].location, zone.mapBounds!);
    expect(point.x).toBeCloseTo(zone.checkpoints[0].mapPoint.x, -1);
    expect(point.y).toBeCloseTo(zone.checkpoints[0].mapPoint.y, -1);
  });

  it("responds immediately to meaningful movement without a five-sample freeze", () => {
    const previous = { latitude: 30.275, longitude: 119.99, accuracy: 35, timestamp: 1 };
    const next = { latitude: 30.2752, longitude: 119.99, accuracy: 35, timestamp: 2 };
    const smoothed = smoothPositionSample(previous, next);
    expect(smoothed.latitude).toBeGreaterThan(30.27515);
    expect(smoothed.timestamp).toBe(2);
  });
});
