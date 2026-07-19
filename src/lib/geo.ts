import type { LatLng, PositionSample, RouteMatch } from "@/src/types";

const EARTH_RADIUS_M = 6_371_000;

export function haversineDistance(a: LatLng, b: LatLng) {
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

function toMeters(point: LatLng, origin: LatLng) {
  const latScale = (Math.PI / 180) * EARTH_RADIUS_M;
  const lngScale = latScale * Math.cos((origin.latitude * Math.PI) / 180);
  return {
    x: (point.longitude - origin.longitude) * lngScale,
    y: (point.latitude - origin.latitude) * latScale,
  };
}

function segmentProjection(
  point: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq
    ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq))
    : 0;
  const x = a.x + t * dx;
  const y = a.y + t * dy;
  return { t, distance: Math.hypot(point.x - x, point.y - y) };
}

export function matchPositionToRoute(
  position: LatLng,
  route: LatLng[],
  checkpoint: LatLng,
): RouteMatch {
  if (route.length < 2) {
    return {
      progress: 0,
      distanceFromRouteM: haversineDistance(position, route[0] ?? checkpoint),
      distanceToCheckpointM: haversineDistance(position, checkpoint),
    };
  }

  const origin = route[0];
  const point = toMeters(position, origin);
  const projected = route.map((item) => toMeters(item, origin));
  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i < projected.length - 1; i += 1) {
    const length = Math.hypot(
      projected[i + 1].x - projected[i].x,
      projected[i + 1].y - projected[i].y,
    );
    lengths.push(length);
    total += length;
  }

  let bestDistance = Number.POSITIVE_INFINITY;
  let bestAlong = 0;
  let accumulated = 0;
  for (let i = 0; i < projected.length - 1; i += 1) {
    const projection = segmentProjection(point, projected[i], projected[i + 1]);
    if (projection.distance < bestDistance) {
      bestDistance = projection.distance;
      bestAlong = accumulated + projection.t * lengths[i];
    }
    accumulated += lengths[i];
  }

  return {
    progress: total ? Math.max(0, Math.min(1, bestAlong / total)) : 0,
    distanceFromRouteM: bestDistance,
    distanceToCheckpointM: haversineDistance(position, checkpoint),
  };
}

export function medianSample(samples: PositionSample[]): PositionSample | null {
  if (!samples.length) return null;
  const sortedLat = [...samples].sort((a, b) => a.latitude - b.latitude);
  const sortedLng = [...samples].sort((a, b) => a.longitude - b.longitude);
  const sortedAccuracy = [...samples].sort((a, b) => a.accuracy - b.accuracy);
  const middle = Math.floor(samples.length / 2);
  return {
    latitude: sortedLat[middle].latitude,
    longitude: sortedLng[middle].longitude,
    accuracy: sortedAccuracy[middle].accuracy,
    timestamp: Math.max(...samples.map((item) => item.timestamp)),
    heading: [...samples].reverse().find((item) => Number.isFinite(item.heading))?.heading,
  };
}

export function isInsideCheckpoint(
  distanceM: number,
  accuracyM: number,
  radiusM: number,
) {
  const accuracyAllowance = Math.min(80, Math.max(0, accuracyM * 0.35));
  return distanceM <= radiusM + accuracyAllowance;
}

export function formatDistance(distanceM: number) {
  if (!Number.isFinite(distanceM)) return "等待定位";
  if (distanceM < 1000) return `${Math.max(0, Math.round(distanceM))} 米`;
  return `${(distanceM / 1000).toFixed(1)} 公里`;
}
