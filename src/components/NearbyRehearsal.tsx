"use client";

import { useEffect, useMemo, useState } from "react";
import { MapCanvas } from "./MapCanvas";
import { rehearsalZones } from "@/src/config/rehearsal";
import { useGeolocation } from "@/src/hooks/useGeolocation";
import { formatDistance, isInsideCheckpoint, matchPositionToRoute } from "@/src/lib/geo";

const SESSION_KEY = "exploration-nearby-rehearsal-v4";

type NearbySession = {
  started: boolean;
  activeIndex: number;
  completedIds: string[];
};

function loadNearbySession(): NearbySession {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return { started: false, activeIndex: 0, completedIds: [] };
    const parsed = JSON.parse(saved) as NearbySession;
    if (
      typeof parsed.started !== "boolean" ||
      !Number.isInteger(parsed.activeIndex) ||
      parsed.activeIndex < 0 ||
      parsed.activeIndex > rehearsalZones.length ||
      !Array.isArray(parsed.completedIds)
    ) {
      throw new Error("invalid rehearsal session");
    }
    return parsed;
  } catch {
    return { started: false, activeIndex: 0, completedIds: [] };
  }
}

export function NearbyRehearsal() {
  const [initialSession] = useState(loadNearbySession);
  const [started, setStarted] = useState(initialSession.started);
  const [activeIndex, setActiveIndex] = useState(initialSession.activeIndex);
  const [completedIds, setCompletedIds] = useState(initialSession.completedIds);
  const [insideStreak, setInsideStreak] = useState(0);
  const [forcedArrival, setForcedArrival] = useState(false);
  const zone = rehearsalZones[activeIndex];
  const checkpoint = zone?.checkpoints[0];
  const location = useGeolocation(started, zone?.maxLocationAccuracyM ?? 90);
  const routeMatch = useMemo(() => {
    if (!zone || !checkpoint || !location.sample) {
      return {
        progress: 0,
        distanceFromRouteM: Number.POSITIVE_INFINITY,
        distanceToCheckpointM: Number.POSITIVE_INFINITY,
      };
    }
    return matchPositionToRoute(location.sample, zone.routeGeo, checkpoint.location);
  }, [zone, checkpoint, location.sample]);
  const arrived = Boolean(checkpoint && (forcedArrival || completedIds.includes(checkpoint.id)));
  const locationReliable = Boolean(
    location.sample && location.sample.accuracy <= (zone?.maxLocationAccuracyM ?? 120),
  );

  useEffect(() => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ started, activeIndex, completedIds }),
    );
  }, [started, activeIndex, completedIds]);

  useEffect(() => {
    if (!checkpoint || !location.sample || !locationReliable || arrived) {
      setInsideStreak(0);
      return;
    }
    const inside = isInsideCheckpoint(
      routeMatch.distanceToCheckpointM,
      location.sample.accuracy,
      checkpoint.unlockRadiusM,
      zone.maxLocationAccuracyM,
    );
    setInsideStreak((value) => (inside ? value + 1 : 0));
  }, [checkpoint, location.sample?.timestamp, locationReliable, arrived, routeMatch.distanceToCheckpointM, zone?.maxLocationAccuracyM]);

  useEffect(() => {
    if (!checkpoint || insideStreak < 2 || arrived) return;
    setCompletedIds((current) => [...new Set([...current, checkpoint.id])]);
  }, [insideStreak, arrived, checkpoint]);

  function beginRehearsal() {
    setActiveIndex(0);
    setCompletedIds([]);
    setForcedArrival(false);
    setInsideStreak(0);
    setStarted(true);
  }

  function nextCheckpoint() {
    if (!checkpoint) return;
    setCompletedIds((current) => [...new Set([...current, checkpoint.id])]);
    setForcedArrival(false);
    setInsideStreak(0);
    setActiveIndex((value) => value + 1);
  }

  if (!started) {
    return (
      <main className="atlas-shell nearby-rehearsal-shell">
        <section className="intro-screen">
          <div className="intro-map-lines" />
          <div className="sealed-letter nearby-letter">
            <span className="eyebrow">FIXED REHEARSAL ROUTE</span>
            <h1>Nearby<em>固定路线彩排</em></h1>
            <p>四枚坐标集中在同一栋建筑周边：富力中心北区东门、南门、西门、北门。</p>
            <blockquote>每一张地图都以真实街区截图为地理底稿，并按正式版的钢笔建筑鸟瞰与古旧羊皮纸风格重新绘制。路线不会随机变化。</blockquote>
            <button className="wax-button" onClick={beginRehearsal}>
              <span>FR</span><b>展开固定彩排地图</b>
            </button>
            <a className="nearby-formal-link" href="/">返回正式生日地图</a>
          </div>
        </section>
      </main>
    );
  }

  if (activeIndex >= rehearsalZones.length) {
    return (
      <main className="atlas-shell">
        <section className="finale-screen nearby-finale">
          <div>
            <span className="eyebrow">FIXED REHEARSAL COMPLETE</span>
            <h1>附近彩排完成</h1>
            <p>四个预设地点已经全部走通。地图、定位进度与自动解锁工作正常。</p>
            <button className="primary-button" onClick={beginRehearsal}>从头再彩排一次</button>
            <a className="nearby-formal-link light" href="/">返回正式生日地图</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="atlas-shell">
      <section className="exploration-screen nearby-map-screen">
        <header className="topbar">
          <div><span>FIXED REHEARSAL ATLAS</span><b>{zone.title}</b></div>
          <div className="chapter-dots">{rehearsalZones.map((item, index) => <i key={item.id} className={index <= activeIndex ? "active" : ""}/>)}</div>
          <div className="status-chip">{arrived ? "测试点已抵达" : location.status === "active" ? "正在跟踪位置" : "定位在云雾中"}</div>
        </header>
        <div className="map-layout">
          <MapCanvas
            zone={zone}
            checkpoint={checkpoint}
            position={location.sample}
            locationReliable={arrived || !location.sample || locationReliable}
            arrived={arrived}
            completedIds={completedIds}
          />
          <aside
            className="quest-card nearby-route"
            data-target-latitude={checkpoint.location.latitude}
            data-target-longitude={checkpoint.location.longitude}
          >
            <div className="quest-number">{String(activeIndex + 1).padStart(2, "0")}</div>
            <span className="eyebrow">PRESET TEST COORDINATE</span>
            <h2>{checkpoint.label}<small>附近固定地点 {activeIndex + 1}/4</small></h2>
            <p>{checkpoint.clue}</p>
            <div className="distance-row">
              <span>{arrived ? "已经抵达" : location.sample && !locationReliable ? "墨点已冻结" : formatDistance(routeMatch.distanceToCheckpointM)}</span>
              <small>{location.sample ? `精度 ±${Math.round(location.sample.accuracy)}m` : "等待定位"}</small>
            </div>
            <p className="nearby-coordinate">{checkpoint.location.latitude.toFixed(6)}, {checkpoint.location.longitude.toFixed(6)}</p>
            {arrived ? (
              <button className="primary-button" onClick={nextCheckpoint}>
                {activeIndex === rehearsalZones.length - 1 ? "完成附近彩排" : "记录通过，前往下一点"}
              </button>
            ) : (
              <>
                <button className="primary-button" onClick={() => setForcedArrival(true)}>强制抵达（室内兜底）</button>
                <p className="tiny-note">连续两次定位进入约{checkpoint.unlockRadiusM}米范围后自动解锁。</p>
              </>
            )}
            {location.error && <p className="location-warning">{location.error}</p>}
            <a className="nearby-formal-link" href="/">退出彩排</a>
          </aside>
        </div>
      </section>
    </main>
  );
}
