"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { medianSample } from "@/src/lib/geo";
import type { PositionSample } from "@/src/types";

type LocationStatus = "idle" | "requesting" | "active" | "imprecise" | "denied" | "unavailable";

export function useGeolocation(enabled: boolean, maxAccuracy = 200) {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [sample, setSample] = useState<PositionSample | null>(null);
  const [error, setError] = useState("");
  const samples = useRef<PositionSample[]>([]);
  const watchId = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchId.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    watchId.current = null;
  }, []);

  const start = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      setError("此设备没有提供网页定位能力。你仍可通过制图人暗门继续。 ");
      return;
    }
    stop();
    setStatus("requesting");
    setError("");
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const next: PositionSample = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          heading: Number.isFinite(position.coords.heading) ? Number(position.coords.heading) : undefined,
        };
        samples.current = [...samples.current, next].slice(-5);
        setSample(medianSample(samples.current));
        setStatus(next.accuracy <= maxAccuracy ? "active" : "imprecise");
      },
      (locationError) => {
        setStatus(locationError.code === 1 ? "denied" : "unavailable");
        setError(
          locationError.code === 1
            ? "定位权限没有开启。请在 Safari 网站设置中允许位置访问。"
            : "暂时无法获得位置，墨点会停留在云雾里。",
        );
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 18_000 },
    );
  }, [maxAccuracy, stop]);

  useEffect(() => {
    if (enabled) start();
    else {
      stop();
      setStatus("idle");
      samples.current = [];
    }
    return stop;
  }, [enabled, start, stop]);

  return { status, sample, error, retry: start, stop };
}
