import { describe, expect, it } from "vitest";
import {
  bearingDegrees,
  haversineDistance,
  holdLastReliablePosition,
  isInsideCheckpoint,
  matchPositionToRoute,
  medianSample,
  projectLocationToBounds,
  projectPositionToMap,
  smoothPositionSample,
} from "../src/lib/geo";
import { gcj02ToWgs84Approx, wgs84ToGcj02 } from "../src/lib/coordinateTransform";
import { rehearsalZones } from "../src/config/rehearsal";
import { zones } from "../src/config/story";

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

  it("keeps the 30 metre geofence tight while allowing a small accuracy edge", () => {
    expect(isInsideCheckpoint(39, 80, 30)).toBe(true);
    expect(isInsideCheckpoint(41, 80, 30)).toBe(false);
    expect(isInsideCheckpoint(0, 500, 30, 200)).toBe(false);
    expect(isInsideCheckpoint(0, Number.NaN, 30, 200)).toBe(false);
  });

  it("derives a geographic walking direction when GPS has no compass heading", () => {
    expect(bearingDegrees(route[0], route[1])).toBeCloseTo(90, 1);
    expect(
      bearingDegrees(route[0], {
        latitude: route[0].latitude + 0.001,
        longitude: route[0].longitude,
      }),
    ).toBeCloseTo(0, 1);
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

  it("projects paired WGS route anchors onto the illustrated route", () => {
    const zone = rehearsalZones[0];
    const checkpoint = zone.checkpoints[0];
    const first = projectPositionToMap(zone.routeGeo[0], zone, checkpoint);
    const second = projectPositionToMap(zone.routeGeo[1], zone, checkpoint);
    expect(first.x).toBeCloseTo(zone.mapRoutePoints![0].x, 5);
    expect(first.y).toBeCloseTo(zone.mapRoutePoints![0].y, 5);
    expect(second.x).toBeCloseTo(zone.mapRoutePoints![1].x, 5);
    expect(second.y).toBeCloseTo(zone.mapRoutePoints![1].y, 5);
  });

  it("uses the same registered-route projection in formal and nearby maps", () => {
    for (const zone of [...zones, ...rehearsalZones]) {
      expect(zone.coordinateSystem).toBe("wgs84");
      expect(zone.mapRoutePoints).toHaveLength(zone.routeGeo.length);
      const checkpoint = zone.checkpoints[0];
      const start = projectPositionToMap(zone.routeGeo[0], zone, checkpoint);
      expect(start.x).toBeCloseTo(zone.mapRoutePoints![0].x, 5);
      expect(start.y).toBeCloseTo(zone.mapRoutePoints![0].y, 5);
    }
  });

  it("does not pin a far or wrong-system sample to a map corner", () => {
    const zone = zones[0];
    const point = projectPositionToMap(
      { latitude: 30.257345, longitude: 120.195869 },
      zone,
      zone.checkpoints[0],
    );
    expect(point.x).toBeGreaterThan(16);
    expect(point.x).toBeLessThan(784);
    expect(point.y).toBeGreaterThan(16);
    expect(point.y).toBeLessThan(484);
  });

  it("keeps the four-gate map aligned to its real OSM bounds", () => {
    const zone = rehearsalZones[0];
    const point = projectLocationToBounds(zone.checkpoints[0].location, zone.mapBounds!);
    expect(point.x).toBeCloseTo(zone.checkpoints[0].mapPoint.x, -1);
    expect(point.y).toBeCloseTo(zone.checkpoints[0].mapPoint.y, -1);
  });

  it("responds immediately to meaningful movement without a five-sample freeze", () => {
    const previous = { latitude: 30.275, longitude: 119.99, accuracy: 35, timestamp: 1, heading: 180 };
    const next = { latitude: 30.2752, longitude: 119.99, accuracy: 35, timestamp: 2 };
    const smoothed = smoothPositionSample(previous, next);
    expect(smoothed.latitude).toBeGreaterThan(30.27515);
    expect(smoothed.timestamp).toBe(2);
    expect(smoothed.heading).toBeUndefined();
  });
});

describe("offline coordinate preparation", () => {
  it("reproduces the known local Fuli reference within the geofence margin", () => {
    const converted = gcj02ToWgs84Approx({ latitude: 30.272938, longitude: 119.994665 });
    const osmReference = { latitude: 30.27548, longitude: 119.9901 };
    expect(haversineDistance(converted, osmReference)).toBeLessThan(15);
  });

  it("places the former AMap bicycle destination on the expected local roads", () => {
    const destination = gcj02ToWgs84Approx({ latitude: 30.257345, longitude: 120.195869 });
    const configured = zones[0].checkpoints[0].location;
    const shuanglingRoadReference = { latitude: 30.259743, longitude: 120.1910573 };
    const qingchunRoadReference = { latitude: 30.2599455, longitude: 120.1912823 };
    expect(haversineDistance(destination, configured)).toBeLessThan(1);
    expect(haversineDistance(destination, shuanglingRoadReference)).toBeLessThan(25);
    expect(haversineDistance(destination, qingchunRoadReference)).toBeLessThan(25);
    expect(
      haversineDistance(wgs84ToGcj02(configured), {
        latitude: 30.257345,
        longitude: 120.195869,
      }),
    ).toBeLessThan(1);
  });

  it("uses the new Zǐ'ǒucūn start and keeps the first walk short", () => {
    const convertedStart = gcj02ToWgs84Approx({ latitude: 30.257323, longitude: 120.197675 });
    const configuredStart = zones[0].routeGeo[0];
    expect(haversineDistance(convertedStart, configuredStart)).toBeLessThan(1);
    expect(haversineDistance(configuredStart, zones[0].checkpoints[0].location)).toBeGreaterThan(150);
    expect(haversineDistance(configuredStart, zones[0].checkpoints[0].location)).toBeLessThan(220);
  });
});
