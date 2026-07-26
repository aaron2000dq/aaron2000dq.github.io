"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type HeadingPermission = "idle" | "granted" | "denied" | "unavailable";

type CompassOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type PermissionAwareOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function currentScreenAngle() {
  const screenAngle = window.screen.orientation?.angle;
  if (Number.isFinite(screenAngle)) return Number(screenAngle);
  const legacyAngle = (window as Window & { orientation?: number }).orientation;
  return Number.isFinite(legacyAngle) ? Number(legacyAngle) : 0;
}

function compassDegrees(event: CompassOrientationEvent) {
  let raw: number | null = null;
  if (Number.isFinite(event.webkitCompassHeading)) {
    raw = Number(event.webkitCompassHeading);
  } else if (Number.isFinite(event.alpha)) {
    raw = (360 - Number(event.alpha) + 360) % 360;
  }
  if (raw === null) return null;
  // iOS reports the direction of the device's portrait top edge. Rotate that
  // vector into the current screen coordinates so "up" remains screen-up in
  // both landscape orientations.
  return (raw - currentScreenAngle() + 720) % 360;
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
    const resetForScreenRotation = () => {
      lastRaw.current = null;
      lastUpdate.current = 0;
    };
    window.addEventListener("orientationchange", resetForScreenRotation);
    window.screen.orientation?.addEventListener?.("change", resetForScreenRotation);
    return () => {
      if (attached.current) window.removeEventListener("deviceorientation", onOrientation, true);
      window.removeEventListener("orientationchange", resetForScreenRotation);
      window.screen.orientation?.removeEventListener?.("change", resetForScreenRotation);
      attached.current = false;
    };
  }, [attach, onOrientation]);

  return { heading, permission, request };
}
