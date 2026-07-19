"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CameraChallenge } from "./CameraChallenge";
import { GmPanel } from "./GmPanel";
import { MapCanvas } from "./MapCanvas";
import { fogMessages, GM_PIN, zones as formalZones } from "@/src/config/story";
import { formatDistance, isInsideCheckpoint, matchPositionToRoute } from "@/src/lib/geo";
import { getPhotos, loadProgress, resetProgress, savePhoto, saveProgress } from "@/src/lib/storage";
import { useGeolocation } from "@/src/hooks/useGeolocation";
import { useDeviceHeading } from "@/src/hooks/useDeviceHeading";
import type { CapturedPhoto, ExplorationZone, MatchResult, PositionSample, StoryProgress } from "@/src/types";

const giftNames = {
  scent: "好闻的",
  motion: "好用的",
  sound: "好听的",
  sparkle: "好看的",
  taste: "好吃的",
  love: "好爱的",
};

const giftOrder = {
  scent: 1,
  motion: 2,
  sound: 3,
  sparkle: 4,
  taste: 5,
  love: 6,
};

type ExplorationAppProps = {
  storageNamespace?: string;
  storyZones?: ExplorationZone[];
};

function createInitialProgress(storyZones: ExplorationZone[]): StoryProgress {
  return {
    activeZoneId: storyZones[0].id,
    activeCheckpointId: storyZones[0].checkpoints[0].id,
    completedCheckpointIds: [],
    photoAttempts: {},
    capturedPhotoIds: [],
    phase: "intro",
    zoneStarted: false,
    arrivedCheckpointIds: [],
  };
}

export function ExplorationApp({ storageNamespace = "formal", storyZones = formalZones }: ExplorationAppProps) {
  const storyInitialProgress = useMemo(() => createInitialProgress(storyZones), [storyZones]);
  const [progress, setProgress] = useState<StoryProgress>(() => structuredClone(storyInitialProgress));
  const [hydrated, setHydrated] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [introOpening, setIntroOpening] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [gmPinOpen, setGmPinOpen] = useState(false);
  const [gmOpen, setGmOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [surveyMode, setSurveyMode] = useState(false);
  const [mockPosition, setMockPosition] = useState<PositionSample | null>(null);
  const [insideStreak, setInsideStreak] = useState(0);
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [deviceStatus, setDeviceStatus] = useState({
    label: "正在检查设备",
    location: false,
    camera: false,
    offlineReady: false,
  });
  const compassTimer = useRef<number | null>(null);
  const introTimer = useRef<number | null>(null);

  const zone = storyZones.find((item) => item.id === progress.activeZoneId) ?? storyZones[0];
  const checkpoint =
    storyZones.flatMap((item) => item.checkpoints).find((item) => item.id === progress.activeCheckpointId) ??
    storyZones[0].checkpoints[0];
  const location = useGeolocation(
    hydrated && progress.phase === "map" && progress.zoneStarted,
    zone.maxLocationAccuracyM,
  );
  const deviceHeading = useDeviceHeading();
  const position = mockPosition ?? location.sample;
  const routeMatch = useMemo(
    () =>
      position
        ? matchPositionToRoute(position, zone.routeGeo, checkpoint.location)
        : { progress: 0, distanceFromRouteM: Number.POSITIVE_INFINITY, distanceToCheckpointM: Number.POSITIVE_INFINITY },
    [position, zone, checkpoint.location],
  );
  const arrived = progress.arrivedCheckpointIds.includes(checkpoint.id);
  const locationReliable = Boolean(position && position.accuracy <= zone.maxLocationAccuracyM && routeMatch.distanceFromRouteM < 220);

  useEffect(() => {
    Promise.all([loadProgress(storageNamespace, storyInitialProgress), getPhotos(storageNamespace)]).then(([saved, savedPhotos]) => {
      const checkpointExists = storyZones.some((item) =>
        item.checkpoints.some((candidate) => candidate.id === saved.activeCheckpointId),
      );
      setProgress(checkpointExists ? saved : structuredClone(storyInitialProgress));
      setPhotos(savedPhotos);
      setHydrated(true);
    });
  }, [storageNamespace, storyInitialProgress, storyZones]);

  useEffect(
    () => () => {
      if (introTimer.current) window.clearTimeout(introTimer.current);
    },
    [],
  );

  useEffect(() => {
    const isIPad =
      /iPad/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setDeviceStatus((current) => ({
      ...current,
      label: isIPad ? "iPad 已识别" : "桌面彩排模式",
      location: "geolocation" in navigator,
      camera: Boolean(navigator.mediaDevices?.getUserMedia),
    }));
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then(() => setDeviceStatus((current) => ({ ...current, offlineReady: true })))
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProgress(progress, storageNamespace).catch(() => undefined);
  }, [hydrated, progress, storageNamespace]);

  useEffect(() => {
    if (!position || arrived || !progress.zoneStarted || progress.phase !== "map") {
      setInsideStreak(0);
      return;
    }
    const inside = isInsideCheckpoint(
      routeMatch.distanceToCheckpointM,
      position.accuracy,
      checkpoint.unlockRadiusM,
    );
    setInsideStreak((value) => (inside ? value + 1 : 0));
  }, [position?.timestamp, arrived, progress.zoneStarted, progress.phase, routeMatch.distanceToCheckpointM, checkpoint]);

  useEffect(() => {
    if (insideStreak < 2 || arrived) return;
    setProgress((current) => ({
      ...current,
      arrivedCheckpointIds: [...new Set([...current.arrivedCheckpointIds, checkpoint.id])],
    }));
  }, [insideStreak, arrived, checkpoint.id]);

  const completeCheckpoint = useCallback(
    async (dataUrl?: string, result?: MatchResult) => {
      const completed = [...new Set([...progress.completedCheckpointIds, checkpoint.id])];
      let photoId: string | undefined;
      if (dataUrl) {
        photoId = `${checkpoint.id}-${Date.now()}`;
        const photo: CapturedPhoto = {
          id: photoId,
          checkpointId: checkpoint.id,
          dataUrl,
          score: result?.score ?? 100,
          createdAt: Date.now(),
        };
        await savePhoto(photo, storageNamespace);
        setPhotos((current) => [...current.filter((item) => item.id !== photo.id), photo]);
      }
      setLastResult(result ?? null);
      setProgress((current) => ({
        ...current,
        completedCheckpointIds: completed,
        capturedPhotoIds: photoId ? [...current.capturedPhotoIds, photoId] : current.capturedPhotoIds,
      }));
      setCameraOpen(false);
      setUnlockOpen(true);
    },
    [checkpoint.id, progress.completedCheckpointIds, storageNamespace],
  );

  function recordAttempt(result: MatchResult) {
    setLastResult(result);
    setProgress((current) => ({
      ...current,
      photoAttempts: {
        ...current.photoAttempts,
        [checkpoint.id]: (current.photoAttempts[checkpoint.id] ?? 0) + 1,
      },
    }));
  }

  function continueAfterUnlock() {
    setUnlockOpen(false);
    const checkpointIndex = zone.checkpoints.findIndex((item) => item.id === checkpoint.id);
    const nextInZone = zone.checkpoints[checkpointIndex + 1];
    if (nextInZone) {
      setProgress((current) => ({
        ...current,
        activeCheckpointId: nextInZone.id,
        arrivedCheckpointIds:
          nextInZone.giftType === "love"
            ? [...new Set([...current.arrivedCheckpointIds, nextInZone.id])]
            : current.arrivedCheckpointIds,
      }));
      return;
    }
    const nextZone = storyZones[zone.order];
    if (nextZone) {
      setProgress((current) => ({ ...current, phase: "fog", zoneStarted: false }));
    } else {
      setProgress((current) => ({ ...current, phase: "finale", zoneStarted: false }));
    }
  }

  function arriveNextZone() {
    const nextZone = storyZones[zone.order];
    if (!nextZone) return;
    setMockPosition(null);
    setProgress((current) => ({
      ...current,
      phase: "map",
      activeZoneId: nextZone.id,
      activeCheckpointId: nextZone.checkpoints[0].id,
      zoneStarted: false,
    }));
  }

  function forceArrive() {
    setProgress((current) => ({
      ...current,
      arrivedCheckpointIds: [...new Set([...current.arrivedCheckpointIds, checkpoint.id])],
    }));
    setGmOpen(false);
  }

  async function forcePass() {
    setGmOpen(false);
    await completeCheckpoint(undefined, {
      score: 100,
      sceneScore: 100,
      poseScore: 100,
      subjectScore: 100,
      message: "制图人已校准本关。",
    });
  }

  function previousCheckpoint() {
    const all = storyZones.flatMap((item) => item.checkpoints.map((cp) => ({ zone: item, cp })));
    const index = all.findIndex((item) => item.cp.id === checkpoint.id);
    const previous = all[Math.max(0, index - 1)];
    setProgress((current) => ({
      ...current,
      phase: "map",
      activeZoneId: previous.zone.id,
      activeCheckpointId: previous.cp.id,
      completedCheckpointIds: current.completedCheckpointIds.filter((id) => id !== previous.cp.id),
      zoneStarted: true,
    }));
    setGmOpen(false);
  }

  async function resetAll(keepPhotos: boolean) {
    await resetProgress(keepPhotos, storageNamespace, storyInitialProgress);
    if (!keepPhotos) setPhotos([]);
    setProgress(structuredClone(storyInitialProgress));
    setIntroOpening(false);
    setMockPosition(null);
    setGmOpen(false);
  }

  function openAtlas() {
    if (introOpening) return;
    setIntroOpening(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    introTimer.current = window.setTimeout(
      () => setProgress((current) => ({ ...current, phase: "map" })),
      reducedMotion ? 250 : 3400,
    );
  }

  function startExploration() {
    void deviceHeading.request();
    setProgress((current) => ({ ...current, zoneStarted: true }));
  }

  function beginCompassHold() {
    compassTimer.current = window.setTimeout(() => {
      setGmPinOpen(true);
      setPin("");
      setPinError(false);
    }, 5000);
  }

  function endCompassHold() {
    if (compassTimer.current) window.clearTimeout(compassTimer.current);
    compassTimer.current = null;
  }

  function submitPin(event: React.FormEvent) {
    event.preventDefault();
    if (pin === GM_PIN) {
      setGmPinOpen(false);
      setGmOpen(true);
      setPinError(false);
    } else setPinError(true);
  }

  async function sharePhoto(photo: CapturedPhoto) {
    const response = await fetch(photo.dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `${photo.checkpointId}.jpg`, { type: "image/jpeg" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Exploration Atlas" });
    } else {
      const link = document.createElement("a");
      link.href = photo.dataUrl;
      link.download = `${photo.checkpointId}.jpg`;
      link.click();
    }
  }

  if (!hydrated) return <div className="loading-screen"><div className="ink-loader"/><p>正在展开地图……</p></div>;

  return (
    <main className="atlas-shell">
      <div className="rotate-notice"><div className="rotate-icon">↻</div><h1>请将 iPad 横过来</h1><p>地图需要一片更宽的羊皮纸。</p></div>
      <button
        className="compass-secret"
        aria-label="指南针"
        onPointerDown={beginCompassHold}
        onPointerUp={endCompassHold}
        onPointerLeave={endCompassHold}
      ><span>N</span><i/></button>

      <AnimatePresence mode="wait">
        {progress.phase === "intro" && (
          <motion.section className={`intro-screen ${introOpening ? "is-opening" : ""}`} key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.025 }} transition={{ duration: .45 }}>
            <div className="intro-map-lines" />

            <div className="intro-atlas-reveal" aria-hidden={!introOpening}>
              <div className="intro-map-sheet">
                <img src={storyZones[0].illustratedMapAsset ?? "/assets/maps/qianjiang-scent-v3.jpg"} alt="" />
                <div className="intro-map-crease vertical"/><div className="intro-map-crease horizontal"/>
                <svg viewBox="0 0 800 500" preserveAspectRatio="none">
                  <path className="intro-ink-route" d="M96 405 C160 370 182 315 252 306 S345 275 398 226 S482 180 535 144 S628 118 694 82"/>
                  {[{ x: 252, y: 306 }, { x: 398, y: 226 }, { x: 535, y: 144 }, { x: 628, y: 118 }, { x: 694, y: 82 }].map((point, index) => (
                    <g key={index} className={`intro-coordinate intro-coordinate-${index + 1}`} transform={`translate(${point.x} ${point.y})`}>
                      <circle r="13"/><text y="4">{index + 1}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="intro-opening-fog fog-a"/><div className="intro-opening-fog fog-b"/>
              <div className="intro-opening-copy" role="status" aria-live="polite">
                <span>THE MAP IS REMEMBERING</span>
                <strong>杭州探索坐标正在显影</strong>
                <small>SCENT · MOTION · SOUND · SPARKLE · TASTE · LOVE</small>
              </div>
            </div>

            <motion.div
              className="sealed-letter opening-letter"
              animate={introOpening ? { opacity: 0, scale: 1.13, rotate: 0, y: 24, filter: "blur(5px)" } : { opacity: 1, scale: 1, rotate: -.7, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.05, ease: [0.55, 0.06, 0.35, 0.98], delay: introOpening ? .28 : 0 }}
            >
              <div className="eyebrow">TO THE EXPLORER</div>
              <h1>Exploration<br/><em>Atlas</em></h1>
              <p>杭州有五个坐标，正在等待今天的寿星发现。</p>
              <blockquote>城市很大，地图很小。今年想和你探索的，不只是杭州的坐标，还有我们尚未抵达的每一个明天。</blockquote>
              <div className="device-readiness" aria-label="设备就绪状态">
                <span className="ready">{deviceStatus.label}</span>
                <span className={deviceStatus.location ? "ready" : "warning"}>{deviceStatus.location ? "定位可用" : "定位需暗门兜底"}</span>
                <span className={deviceStatus.camera ? "ready" : "warning"}>{deviceStatus.camera ? "相机可用" : "可从相册选图"}</span>
                <span className={deviceStatus.offlineReady ? "ready" : "pending"}>{deviceStatus.offlineReady ? "离线地图已缓存" : "正在缓存离线地图"}</span>
              </div>
              <button className="wax-button intro-wax-trigger" disabled={introOpening} onClick={openAtlas}><span>EA<i/></span><b>{introOpening ? "地图正在显影…" : "开启地图"}</b></button>
            </motion.div>
            <footer>2026 BIRTHDAY EDITION · HANGZHOU</footer>
          </motion.section>
        )}

        {progress.phase === "fog" && (
          <motion.section className="fog-screen" key="fog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="fog-layer one"/><div className="fog-layer two"/>
            <div className="fog-content"><div className="spinning-compass">✦</div><span>TRANSIT THROUGH THE UNKNOWN</span><h2>{fogMessages[(zone.order - 1) % fogMessages.length]}</h2><p>请使用正常导航驾车。停稳并下车后，再让下一片地图显形。</p><button className="primary-button" onClick={arriveNextZone}>我已停车，展开下一片地图</button></div>
          </motion.section>
        )}

        {progress.phase === "map" && (
          <motion.section className="exploration-screen" key={`${zone.id}-${checkpoint.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="topbar"><div><span>THE EXPLORATION ATLAS</span><b>{zone.title}</b></div><div className="chapter-dots">{storyZones.map((item) => <i key={item.id} className={item.order <= zone.order ? "active" : ""}/>)}</div><div className="status-chip">{arrived ? "坐标已解锁" : location.status === "active" ? "墨点已定位" : location.status === "imprecise" ? "定位在云雾中" : progress.zoneStarted ? "正在寻找位置" : "等待开始"}</div></header>
            <div className="map-layout">
              <MapCanvas zone={zone} checkpoint={checkpoint} routeProgress={arrived ? 1 : routeMatch.progress} locationReliable={!progress.zoneStarted || locationReliable || arrived} arrived={arrived} completedIds={progress.completedCheckpointIds} heading={deviceHeading.heading ?? position?.heading ?? 0}/>
              <aside className="quest-card">
                <div className="quest-number">{String(giftOrder[checkpoint.giftType]).padStart(2, "0")}</div>
                <span className="eyebrow">CURRENT COORDINATE</span>
                <h2>{giftNames[checkpoint.giftType]}<small>{checkpoint.label}</small></h2>
                <p>{checkpoint.clue}</p>
                <div className="distance-row"><span>{arrived ? "已经抵达" : formatDistance(routeMatch.distanceToCheckpointM)}</span><small>{position ? `精度 ±${Math.round(position.accuracy)}m` : "Wi‑Fi iPad 粗定位"}</small></div>
                {location.error && !arrived && <div className="location-warning">{location.error}<button onClick={location.retry}>重试</button></div>}
                {checkpoint.giftType === "love" ? (
                  <button className="primary-button" onClick={() => completeCheckpoint()}>打开最后一封信</button>
                ) : !progress.zoneStarted ? (
                  <button className="primary-button" onClick={startExploration}>停车完毕，开始探索</button>
                ) : arrived ? (
                  <button className="primary-button" onClick={() => setCameraOpen(true)}>开启照片复刻</button>
                ) : (
                  <><button className="secondary-button" onClick={location.retry}>重新定位</button><p className="tiny-note">定位连续两次进入约 {checkpoint.unlockRadiusM} 米范围后，照片任务会自动出现。</p></>
                )}
              </aside>
            </div>
          </motion.section>
        )}

        {progress.phase === "finale" && (
          <motion.section className="finale-screen" key="finale" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="final-heart">♡</div><span>A HIDDEN PLACE HAS BEEN FOUND</span><h1>Exploration<br/>Completed</h1><blockquote>今天的地图已经走完。<br/>但我们的探索，还会继续很多很多年。<br/><b>Happy Birthday, bb.</b></blockquote>
            <div className="gallery-strip">{photos.length ? photos.map((photo) => <button key={photo.id} onClick={() => sharePhoto(photo)}><img src={photo.dataUrl} alt="探索复刻照片"/><span>{photo.score} 分 · 保存</span></button>) : <p>完成照片关卡后，探索相册会出现在这里。</p>}</div>
            <button className="secondary-button" onClick={() => resetAll(true)}>重新彩排</button>
          </motion.section>
        )}
      </AnimatePresence>

      {cameraOpen && <CameraChallenge checkpoint={checkpoint} attempt={progress.photoAttempts[checkpoint.id] ?? 0} surveyMode={surveyMode} storageNamespace={storageNamespace} onClose={() => setCameraOpen(false)} onPass={completeCheckpoint} onAttempt={recordAttempt}/>} 

      <AnimatePresence>
        {unlockOpen && (
          <motion.div className="unlock-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section className="unlock-card" initial={{ scale: 0.7, rotate: -3 }} animate={{ scale: 1, rotate: 0 }}>
              <div className="unlock-seal">{checkpoint.giftType === "love" ? "♡" : "✦"}</div><span>{checkpoint.giftType.toUpperCase()} FOUND</span><h2>{giftNames[checkpoint.giftType]}</h2><p>{checkpoint.unlockCopy}</p>{lastResult && <small>照片匹配度 {lastResult.score}%</small>}<button className="primary-button" onClick={continueAfterUnlock}>{checkpoint.giftType === "love" ? "完成探索" : zone.checkpoints[zone.checkpoints.findIndex((item) => item.id === checkpoint.id) + 1] ? "点亮下一个坐标" : "返回载具"}</button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {gmPinOpen && <div className="gm-backdrop"><form className="pin-card" onSubmit={submitPin}><span>CARTOGRAPHER ONLY</span><h2>输入制图人口令</h2><input autoFocus inputMode="numeric" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}/>{pinError && <p>墨迹没有认出这个口令。</p>}<div><button type="button" onClick={() => setGmPinOpen(false)}>取消</button><button className="primary-button">进入</button></div></form></div>}
      {gmOpen && <GmPanel zone={zone} progress={progress} position={position} surveyMode={surveyMode} onSurveyMode={setSurveyMode} onClose={() => setGmOpen(false)} onForceArrive={forceArrive} onForcePass={forcePass} onPrevious={previousCheckpoint} onReset={resetAll} onMockPosition={() => { setMockPosition({ ...checkpoint.location, accuracy: 12, timestamp: Date.now() }); setGmOpen(false); }}/>} 
    </main>
  );
}
