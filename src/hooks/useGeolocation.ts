"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { holdLastReliablePosition, smoothPositionSample } from "@/src/lib/geo";
import type { PositionSample } from "@/src/types";

type LocationStatus = "idle" | "requesting" | "active" | "imprecise" | "denied" | "unavailable";

export function useGeolocation(enabled: boolean, maxAccuracy = 200) {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [sample, setSample] = useState<PositionSample | null>(null);
  const [error, setError] = useState("");
  const sampleRef = useRef<PositionSample | null>(null);
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
    sampleRef.current = null;
    setSample(null);
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
        if (!Number.isFinite(next.accuracy) || next.accuracy < 0 || next.accuracy > maxAccuracy) {
          setSample(holdLastReliablePosition(sampleRef.current, next));
          setStatus("imprecise");
          setError(`当前定位精度约 ±${Math.round(next.accuracy)} 米，墨点已冻结，等待更准确的位置。`);
          return;
        }
        const smoothed = smoothPositionSample(sampleRef.current, next);
        sampleRef.current = smoothed;
        setSample(smoothed);
        setStatus("active");
        setError("");
      },
      (locationError) => {
        setStatus(locationError.code === 1 ? "denied" : "unavailable");
        setError(
          locationError.code === 1
            ? "定位权限没有开启。请在 Safari 网站设置中允许位置访问。"
            : "暂时无法获得位置，墨点会停留在云雾里。",
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 25_000 },
    );
  }, [maxAccuracy, stop]);

  useEffect(() => {
    if (enabled) start();
    else {
      stop();
      setStatus("idle");
      sampleRef.current = null;
      setSample(null);
    }
    return stop;
  }, [enabled, start, stop]);

  return { status, sample, error, retry: start, stop };
}
