"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type HeadingPermission = "idle" | "granted" | "denied" | "unavailable";

type CompassOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type PermissionAwareOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function compassDegrees(event: CompassOrientationEvent) {
  if (Number.isFinite(event.webkitCompassHeading)) {
    return Number(event.webkitCompassHeading);
  }
  if (Number.isFinite(event.alpha)) {
    return (360 - Number(event.alpha) + 360) % 360;
  }
  return null;
}

export function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<HeadingPermission>("idle");
  const attached = useRef(false);
  const lastRaw = useRef<number | null>(null);
  const continuous = useRef(0);
  const lastUpdate = useRef(0);

  const onOrientation = useCallback((nativeEvent: DeviceOrientationEvent) => {
    const now = performance.now();
    if (now - lastUpdate.current < 70) return;
    const raw = compassDegrees(nativeEvent as CompassOrientationEvent);
    if (raw === null) return;

    if (lastRaw.current === null) {
      continuous.current = raw;
    } else {
      const shortestTurn = ((raw - lastRaw.current + 540) % 360) - 180;
      continuous.current += shortestTurn;
    }
    lastRaw.current = raw;
    lastUpdate.current = now;
    setHeading(continuous.current);
  }, []);

  const attach = useCallback(() => {
    if (attached.current) return;
    window.addEventListener("deviceorientation", onOrientation, true);
    attached.current = true;
  }, [onOrientation]);

  const request = useCallback(async () => {
    if (!("DeviceOrientationEvent" in window)) {
      setPermission("unavailable");
      return false;
    }
    const constructor = window.DeviceOrientationEvent as PermissionAwareOrientationEvent;
    try {
      if (typeof constructor.requestPermission === "function") {
        const result = await constructor.requestPermission();
        if (result !== "granted") {
          setPermission("denied");
          return false;
        }
      }
      attach();
      setPermission("granted");
      return true;
    } catch {
      setPermission("denied");
      return false;
    }
  }, [attach]);

  useEffect(() => {
    if (!("DeviceOrientationEvent" in window)) {
      setPermission("unavailable");
      return;
    }
    const constructor = window.DeviceOrientationEvent as PermissionAwareOrientationEvent;
    if (typeof constructor.requestPermission !== "function") {
      attach();
      setPermission("granted");
    }
    return () => {
      if (attached.current) window.removeEventListener("deviceorientation", onOrientation, true);
      attached.current = false;
    };
  }, [attach, onOrientation]);

  return { heading, permission, request };
}
