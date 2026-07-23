"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CameraChallenge } from "./CameraChallenge";
import { CelebrationLayer, type CelebrationKind } from "./CelebrationLayer";
import { GmPanel } from "./GmPanel";
import { MapCanvas } from "./MapCanvas";
import { MagicAtmosphere } from "./MagicAtmosphere";
import { fogMessages, GM_PIN, zones as formalZones } from "@/src/config/story";
import { formatDistance, isInsideCheckpoint, matchPositionToRoute } from "@/src/lib/geo";
import { getPhotos, loadProgress, resetProgress, savePhoto, saveProgress } from "@/src/lib/storage";
import { warmPhotoMatcher } from "@/src/lib/photoMatch";
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

async function decodeIntroImage(src: string) {
  await new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      image.decode().catch(() => undefined).finally(resolve);
    };
    image.onerror = () => resolve();
    image.src = src;
  });
}

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
  const [compassHolding, setCompassHolding] = useState(false);
  const [questExpanded, setQuestExpanded] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [surveyMode, setSurveyMode] = useState(false);
  const [mockPosition, setMockPosition] = useState<PositionSample | null>(null);
  const [insideStreak, setInsideStreak] = useState(0);
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [celebration, setCelebration] = useState<{ id: number; kind: CelebrationKind; label: string } | null>(null);
  const [deviceStatus, setDeviceStatus] = useState({
    label: "正在检查设备",
    location: false,
    camera: false,
    offlineReady: false,
  });
  const compassTimer = useRef<number | null>(null);
  const introTimer = useRef<number | null>(null);
  const celebrationTimer = useRef<number | null>(null);
  const unlockTimer = useRef<number | null>(null);
  const celebratedArrivals = useRef(new Set<string>());

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
  const locationReliable = Boolean(position && position.accuracy <= zone.maxLocationAccuracyM);
  const coordinateNumber = giftOrder[checkpoint.giftType];
  const concealedTitle = checkpoint.mysteryTitle ?? `第${coordinateNumber}枚未知坐标`;
  const concealedLabel = checkpoint.mysteryLabel ?? "答案尚在雾中";
  const displayedZoneTitle = arrived
    ? zone.title
    : zone.mysteryTitle ?? `XXVIII · PAGE ${String(zone.order).padStart(2, "0")}`;

  const triggerCelebration = useCallback((kind: CelebrationKind, label: string) => {
    if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current);
    setCelebration({ id: Date.now(), kind, label });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    celebrationTimer.current = window.setTimeout(
      () => setCelebration(null),
      reducedMotion ? 420 : kind === "photo" ? 2400 : 1750,
    );
  }, []);

  useEffect(() => {
    setQuestExpanded(arrived);
  }, [checkpoint.id, arrived]);

  useEffect(() => {
    const introAssets = [
      "/assets/magic/parchment-cinematic-v1.jpg",
      "/assets/magic/explorer-envelope-open-v3.png",
      "/assets/magic/exploration-wax-seal-v3.png",
      "/assets/magic/owl-courier-sprite-v1.png",
      "/assets/magic/gilded-atlas-frame-v2.png",
      "/assets/magic/constellation-veins-v2.png",
      storyZones[0].illustratedMapAsset ?? "/assets/maps/qianjiang-scent-v3.jpg",
    ];
    Promise.all([
      loadProgress(storageNamespace, storyInitialProgress),
      getPhotos(storageNamespace),
    ]).then(async ([saved, savedPhotos]) => {
      if (saved.phase === "intro") {
        for (const src of introAssets) {
          await decodeIntroImage(src);
        }
      }
      const checkpointExists = storyZones.some((item) =>
        item.checkpoints.some((candidate) => candidate.id === saved.activeCheckpointId),
      );
      const restoredProgress = checkpointExists ? saved : structuredClone(storyInitialProgress);
      celebratedArrivals.current = new Set(restoredProgress.arrivedCheckpointIds);
      setProgress(restoredProgress);
      setPhotos(savedPhotos);
      setHydrated(true);
    });
  }, [storageNamespace, storyInitialProgress, storyZones]);

  useEffect(
    () => () => {
      if (introTimer.current) window.clearTimeout(introTimer.current);
      if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current);
      if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
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
      camera: "FileReader" in window,
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
    if (!position || !locationReliable || arrived || !progress.zoneStarted || progress.phase !== "map") {
      setInsideStreak(0);
      return;
    }
    const inside = isInsideCheckpoint(
      routeMatch.distanceToCheckpointM,
      position.accuracy,
      checkpoint.unlockRadiusM,
      zone.maxLocationAccuracyM,
    );
    setInsideStreak((value) => (inside ? value + 1 : 0));
  }, [position?.timestamp, locationReliable, arrived, progress.zoneStarted, progress.phase, routeMatch.distanceToCheckpointM, checkpoint, zone.maxLocationAccuracyM]);

  useEffect(() => {
    if (insideStreak < 2 || arrived) return;
    setProgress((current) => ({
      ...current,
      arrivedCheckpointIds: [...new Set([...current.arrivedCheckpointIds, checkpoint.id])],
    }));
  }, [insideStreak, arrived, checkpoint.id]);

  useEffect(() => {
    if (!hydrated || !arrived || celebratedArrivals.current.has(checkpoint.id)) return;
    celebratedArrivals.current.add(checkpoint.id);
    triggerCelebration("arrival", checkpoint.label);
  }, [arrived, checkpoint.id, checkpoint.label, hydrated, triggerCelebration]);

  const completeCheckpoint = useCallback(
    async (dataUrl?: string, result?: MatchResult) => {
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
        await savePhoto(photo, storageNamespace).catch(() => undefined);
        setPhotos((current) => [...current.filter((item) => item.id !== photo.id), photo]);
      }
      setLastResult(result ?? null);
      setProgress((current) => ({
        ...current,
        completedCheckpointIds: [...new Set([...current.completedCheckpointIds, checkpoint.id])],
        capturedPhotoIds: photoId ? [...current.capturedPhotoIds, photoId] : current.capturedPhotoIds,
      }));
      setCameraOpen(false);
      if (dataUrl && result) {
        triggerCelebration("photo", checkpoint.label);
        if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        unlockTimer.current = window.setTimeout(() => setUnlockOpen(true), reducedMotion ? 120 : 620);
      } else {
        setUnlockOpen(true);
      }
    },
    [checkpoint.id, checkpoint.label, storageNamespace, triggerCelebration],
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
    setMockPosition(null);
    setInsideStreak(0);
    const checkpointIndex = zone.checkpoints.findIndex((item) => item.id === checkpoint.id);
    const nextInZone = zone.checkpoints[checkpointIndex + 1];
    if (nextInZone) {
      const alreadyAtNext = Boolean(
        position &&
          isInsideCheckpoint(
            matchPositionToRoute(position, zone.routeGeo, nextInZone.location).distanceToCheckpointM,
            position.accuracy,
            nextInZone.unlockRadiusM,
            zone.maxLocationAccuracyM,
          ),
      );
      setProgress((current) => ({
        ...current,
        activeCheckpointId: nextInZone.id,
        arrivedCheckpointIds:
          nextInZone.giftType === "love" || alreadyAtNext
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
    setInsideStreak(0);
    setProgress((current) => ({
      ...current,
      phase: "map",
      activeZoneId: nextZone.id,
      activeCheckpointId: nextZone.checkpoints[0].id,
      zoneStarted: false,
    }));
  }

  function forceArrive() {
    setMockPosition(null);
    setInsideStreak(0);
    setProgress((current) => ({
      ...current,
      arrivedCheckpointIds: [...new Set([...current.arrivedCheckpointIds, checkpoint.id])],
    }));
    setGmOpen(false);
  }

  async function forcePass() {
    setMockPosition(null);
    setInsideStreak(0);
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
    setMockPosition(null);
    setInsideStreak(0);
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
    celebratedArrivals.current.clear();
    if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current);
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    setCelebration(null);
    setUnlockOpen(false);
    setCameraOpen(false);
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
      reducedMotion ? 250 : 3650,
    );
  }

  useEffect(() => {
    if (!hydrated || progress.phase !== "map") return;
    const timer = window.setTimeout(() => void warmPhotoMatcher(), 350);
    return () => window.clearTimeout(timer);
  }, [hydrated, progress.phase]);

  function startExploration() {
    void deviceHeading.request();
    setMockPosition(null);
    setInsideStreak(0);
    setProgress((current) => ({ ...current, zoneStarted: true }));
  }

  function beginCompassHold(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (compassTimer.current) window.clearTimeout(compassTimer.current);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Safari may reject capture for a synthetic event; the hold timer still works.
    }
    setCompassHolding(true);
    compassTimer.current = window.setTimeout(() => {
      compassTimer.current = null;
      setCompassHolding(false);
      setGmPinOpen(true);
      setPin("");
      setPinError(false);
    }, 3000);
  }

  function endCompassHold(event?: React.PointerEvent<HTMLButtonElement>) {
    if (compassTimer.current) window.clearTimeout(compassTimer.current);
    compassTimer.current = null;
    setCompassHolding(false);
    if (event?.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
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

  if (!hydrated) return <div className="loading-screen"><div className="ink-loader"/><p>正在唤醒信使与地图……</p></div>;

  return (
    <main className="atlas-shell" data-intro-assets="ready">
      <div className="rotate-notice"><div className="rotate-icon">↻</div><h1>请将 iPad 横过来</h1><p>地图需要一片更宽的羊皮纸。</p></div>
      <MagicAtmosphere phase={progress.phase} giftType={checkpoint.giftType} awake={progress.phase !== "intro" || introOpening} />
      <button
        className={`compass-secret ${compassHolding ? "is-holding" : ""}`}
        aria-label="指南针"
        onPointerDown={beginCompassHold}
        onPointerUp={endCompassHold}
        onPointerCancel={endCompassHold}
        onContextMenu={(event) => event.preventDefault()}
      ><span>N</span><i/><svg className="compass-hold-progress" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" pathLength="1"/></svg></button>

      <AnimatePresence>
        {celebration && <CelebrationLayer key={celebration.id} kind={celebration.kind} label={celebration.label} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {progress.phase === "intro" && (
          <motion.section className={`intro-screen ${introOpening ? "is-opening" : ""}`} key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .32 }}>
            <div className="intro-map-lines" />

            <div className="intro-atlas-reveal" aria-hidden={!introOpening}>
              <div className="intro-map-sheet">
                <img src={storyZones[0].illustratedMapAsset ?? "/assets/maps/qianjiang-scent-v3.jpg"} alt="" />
                <div className="intro-generated-ink-bloom" />
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
                <span>FROM XXVIII TO XXIX</span>
                <strong>二十八岁的最后一页正在翻动</strong>
                <small>PAGE I · PAGE II · PAGE III · PAGE IV · PAGE V · EPILOGUE</small>
              </div>
            </div>

            <div className="sealed-letter opening-letter">
              <div className="envelope-prop" aria-hidden="true" />
              <div className="envelope-letter-content">
                <div className="eyebrow">PRIVATE DELIVERY · TO THE EXPLORER</div>
                <h1>Exploration <em>Atlas</em></h1>
                <p>今天，是二十八岁的最后一页。</p>
                <blockquote>杭州替你藏起了五枚坐标。每找到一枚，<br/>就把旧一岁的某束光，装进二十九岁的行囊。</blockquote>
                <div className="device-readiness" aria-label="设备就绪状态">
                  <span className="ready">{deviceStatus.label}</span>
                  <span className={deviceStatus.location ? "ready" : "warning"}>{deviceStatus.location ? "定位可用" : "定位需暗门兜底"}</span>
                  <span className={deviceStatus.camera ? "ready" : "warning"}>{deviceStatus.camera ? "相册可用" : "照片读取不可用"}</span>
                  <span className={deviceStatus.offlineReady ? "ready" : "pending"}>{deviceStatus.offlineReady ? "离线地图已缓存" : "正在缓存"}</span>
                </div>
              </div>
              <button className="wax-button intro-wax-trigger" disabled={introOpening} onClick={openAtlas} aria-label="开启地图"><span><i/></span><b>{introOpening ? "信使已送达 · 地图正在显影" : "按下火漆 · 接收探索地图"}</b></button>
              <div className="envelope-wind-fold" aria-hidden="true" />
            </div>
            <footer>FROM XXVIII TO XXIX · 2026 BIRTHDAY EDITION</footer>
          </motion.section>
        )}

        {progress.phase === "fog" && (
          <motion.section className="fog-screen" key="fog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="fog-layer one"/><div className="fog-layer two"/>
            <div className="fog-content"><div className="spinning-compass">✦</div><span>TURNING THE PAGE · XXVIII → XXIX</span><h2>{fogMessages[(zone.order - 1) % fogMessages.length]}</h2><p>请使用正常导航驾车。停稳并下车后，再让下一页从云雾中显形。</p><button className="primary-button" onClick={arriveNextZone}>我已停车，翻开下一页</button></div>
          </motion.section>
        )}

        {progress.phase === "map" && (
          <motion.section className="exploration-screen" key={`${zone.id}-${checkpoint.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="topbar"><div><i className="topbar-sigil" aria-hidden="true"/><span>THE EXPLORATION ATLAS · XXVIII → XXIX</span><b>{displayedZoneTitle}</b></div><div className="chapter-dots">{storyZones.map((item) => <i key={item.id} className={item.order <= zone.order ? "active" : ""}/>)}</div><div className="status-chip">{arrived ? "坐标已揭晓" : location.status === "active" ? "墨点已定位" : location.status === "imprecise" ? "定位在云雾中" : progress.zoneStarted ? "正在寻找位置" : "等待开始"}</div></header>
            <div className="map-layout">
              <MapCanvas zone={zone} checkpoint={checkpoint} position={position} locationReliable={!progress.zoneStarted || locationReliable} arrived={arrived} completedIds={progress.completedCheckpointIds} heading={deviceHeading.heading ?? position?.heading ?? 0} onMapFocus={() => setQuestExpanded(false)}/>
              <aside className={`quest-card floating-quest-card ${questExpanded ? "is-expanded" : "is-collapsed"}`}>
                <button
                  className="quest-panel-toggle"
                  type="button"
                  aria-expanded={questExpanded}
                  onClick={() => setQuestExpanded((current) => !current)}
                >{questExpanded ? "收起" : "查看线索"}</button>
                <div className="quest-medallion" aria-hidden="true"><span className="quest-number">{String(coordinateNumber).padStart(2, "0")}</span></div>
                <span className="eyebrow">{arrived ? "COORDINATE REVEALED" : "THE LAST PAGE OF XXVIII"}</span>
                <h2>{arrived ? giftNames[checkpoint.giftType] : concealedTitle}<small>{arrived ? checkpoint.label : concealedLabel}</small></h2>
                {questExpanded && checkpoint.storyBeat && <p className="quest-story-beat">{checkpoint.storyBeat}</p>}
                {questExpanded && <p className="quest-clue">{checkpoint.clue}</p>}
                <div className="distance-row"><span>{arrived ? "已经抵达" : position && !locationReliable ? "墨点已冻结" : formatDistance(routeMatch.distanceToCheckpointM)}</span><small>{position ? `精度 ±${Math.round(position.accuracy)}m` : "Wi‑Fi iPad 粗定位"}</small></div>
                {questExpanded && location.error && !arrived && <div className="location-warning">{location.error}<button onClick={location.retry}>重试</button></div>}
                {checkpoint.giftType === "love" ? (
                  <button className="primary-button" onClick={() => completeCheckpoint()}>打开最后一封信</button>
                ) : !progress.zoneStarted ? (
                  <button className="primary-button" onClick={startExploration}>停车完毕，开始探索</button>
                ) : arrived ? (
                  <button className="primary-button" onClick={() => setCameraOpen(true)}>开启照片复刻</button>
                ) : (
                  <><button className="secondary-button" onClick={location.retry}>重新定位</button>{questExpanded && <p className="tiny-note">定位连续两次进入约 {checkpoint.unlockRadiusM} 米范围后，照片任务会自动出现。</p>}</>
                )}
              </aside>
            </div>
          </motion.section>
        )}

        {progress.phase === "finale" && (
          <motion.section className="finale-screen" key="finale" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="finale-generated-rune" aria-hidden="true" />
            <div className="finale-content">
              <div className="final-heart" aria-hidden="true"><i/><span>♡</span></div><span>XXVIII HAS BEEN KEPT · XXIX NOW BEGINS</span><h1>Exploration<br/>Completed</h1><blockquote>二十八岁的故事，已经被好好收藏。<br/>现在，请翻开二十九岁的第一章。<br/>地图走完了，我们的探索还会继续很多很多年。<br/><b>Happy 29th Birthday, bb.</b></blockquote>
              <div className="gallery-strip">{photos.length ? photos.map((photo) => <button key={photo.id} onClick={() => sharePhoto(photo)}><img src={photo.dataUrl} alt="探索复刻照片"/><span>{photo.score} 分 · 保存</span></button>) : <p>完成照片关卡后，探索相册会出现在这里。</p>}</div>
              <button className="secondary-button" onClick={() => resetAll(true)}>重新彩排</button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {cameraOpen && <CameraChallenge checkpoint={checkpoint} attempt={progress.photoAttempts[checkpoint.id] ?? 0} surveyMode={surveyMode} storageNamespace={storageNamespace} onClose={() => setCameraOpen(false)} onPass={completeCheckpoint} onAttempt={recordAttempt}/>} 

      <AnimatePresence>
        {unlockOpen && (
          <motion.div className="unlock-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section className="unlock-card" initial={{ scale: 0.7, rotate: -3 }} animate={{ scale: 1, rotate: 0 }}>
              <div className="unlock-generated-rune" aria-hidden="true" />
              <div className="unlock-seal">{checkpoint.giftType === "love" ? "♡" : "✦"}</div><span>PAGE {String(coordinateNumber).padStart(2, "0")} · REVEALED</span><h2>{giftNames[checkpoint.giftType]}<small>{checkpoint.label}</small></h2>{checkpoint.storyBeat && <blockquote className="unlock-story-beat">{checkpoint.storyBeat}</blockquote>}<p>{checkpoint.unlockCopy}</p>{lastResult && <small>照片匹配度 {lastResult.score}%{lastResult.poseScore === null ? " · 场景匹配模式" : " · 姿势已识别"}</small>}<button className="primary-button" onClick={continueAfterUnlock}>{checkpoint.giftType === "love" ? "翻开二十九岁的第一章" : zone.checkpoints[zone.checkpoints.findIndex((item) => item.id === checkpoint.id) + 1] ? "寻找下一枚未知坐标" : "带着这一页返回载具"}</button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {gmPinOpen && <div className="gm-backdrop"><form className="pin-card" onSubmit={submitPin}><span>CARTOGRAPHER ONLY</span><h2>输入制图人口令</h2><input autoFocus inputMode="numeric" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}/>{pinError && <p>墨迹没有认出这个口令。</p>}<div><button type="button" onClick={() => setGmPinOpen(false)}>取消</button><button className="primary-button">进入</button></div></form></div>}
      {gmOpen && <GmPanel zone={zone} progress={progress} position={position} surveyMode={surveyMode} onSurveyMode={setSurveyMode} onClose={() => setGmOpen(false)} onForceArrive={forceArrive} onForcePass={forcePass} onPrevious={previousCheckpoint} onReset={resetAll} onMockPosition={() => { setMockPosition({ ...checkpoint.location, accuracy: 12, timestamp: Date.now() }); setGmOpen(false); }}/>} 
    </main>
  );
}
