"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Checkpoint, ExplorationZone } from "@/src/types";

type Props = {
  zone: ExplorationZone;
  checkpoint: Checkpoint;
  routeProgress: number;
  locationReliable: boolean;
  arrived: boolean;
  completedIds: string[];
};

const illustratedMapAssets: Partial<Record<ExplorationZone["mapKind"], string>> = {
  arcade: "/assets/maps/qianjiang-scent-v3.jpg",
  garden: "/assets/maps/caihe-motion-v2.jpg",
  vinyl: "/assets/maps/jingwei-sound-v2.jpg",
  city: "/assets/maps/qianjiang-grand-v2.jpg",
};

function Road({
  d,
  label,
  x,
  y,
  rotate = 0,
  major = false,
}: {
  d: string;
  label?: string;
  x?: number;
  y?: number;
  rotate?: number;
  major?: boolean;
}) {
  return (
    <g className={`atlas-road ${major ? "major" : ""}`}>
      <path className="road-casing" d={d} />
      <path className="road-center" d={d} />
      {label && x !== undefined && y !== undefined && (
        <text className="road-name" x={x} y={y} transform={`rotate(${rotate} ${x} ${y})`}>
          {label}
        </text>
      )}
    </g>
  );
}

function CityBlock({ x, y, width, height, cuts = 2 }: { x: number; y: number; width: number; height: number; cuts?: number }) {
  return (
    <g className="city-block">
      <rect x={x} y={y} width={width} height={height} rx="2" />
      {Array.from({ length: cuts }).map((_, index) => (
        <path key={index} d={`M${x + ((index + 1) * width) / (cuts + 1)} ${y + 5}V${y + height - 5}`} />
      ))}
      <path d={`M${x + 5} ${y + height / 2}H${x + width - 5}`} />
    </g>
  );
}

function AtlasFurniture() {
  return (
    <g aria-hidden="true">
      <g className="coordinate-grid">
        {Array.from({ length: 13 }).map((_, index) => <path key={`v-${index}`} d={`M${40 + index * 60} 28V472`} />)}
        {Array.from({ length: 8 }).map((_, index) => <path key={`h-${index}`} d={`M35 ${42 + index * 58}H765`} />)}
      </g>
      <g className="atlas-compass" transform="translate(738 67)">
        <circle r="31" /><circle r="24" /><path d="M0-26 6-5 26 0 6 5 0 26-6 5-26 0-6-5z" />
        <path d="M0-19 4 0 0 19-4 0z" className="compass-needle" />
        <text y="-35">N</text>
      </g>
      <g className="map-scale" transform="translate(55 456)">
        <path d="M0 0h90M0-4v8M45-4v8M90-4v8" />
        <text y="-8">0</text><text x="39" y="-8">125</text><text x="81" y="-8">250 M</text>
      </g>
    </g>
  );
}

function DistrictBlueprint({ kind }: { kind: ExplorationZone["mapKind"] }) {
  if (kind === "arcade") {
    return (
      <g className="district-blueprint">
        <path className="waterway" d="M690-20C665 90 698 175 674 260S720 397 668 525H830V-20Z" />
        <path className="river-bank" d="M690-20C665 90 698 175 674 260S720 397 668 525" />
        <Road d="M18 86H690" label="庆 春 东 路  ·  QINGCHUN EAST RD." x={248} y={78} major />
        <Road d="M35 354C188 326 302 334 440 298S590 284 676 264" label="江 锦 路" x={303} y={320} rotate={-8} />
        <Road d="M168 34C190 135 218 245 238 472" label="钱 江 路" x={196} y={250} rotate={79} major />
        <Road d="M494 25C481 140 505 240 480 465" label="富 春 路" x={488} y={230} rotate={92} major />
        <Road d="M610 22C588 124 615 216 598 455" label="民 心 路" x={606} y={197} rotate={96} />
        <Road d="M42 220C190 228 318 205 470 218S610 205 675 188" label="新 业 路" x={308} y={210} rotate={-2} />
        <CityBlock x={52} y={112} width={102} height={74} cuts={3} />
        <CityBlock x={264} y={112} width={88} height={70} cuts={2} />
        <CityBlock x={365} y={108} width={92} height={78} cuts={2} />
        <CityBlock x={44} y={248} width={112} height={68} cuts={3} />
        <CityBlock x={265} y={242} width={82} height={65} cuts={2} />
        <CityBlock x={360} y={244} width={92} height={58} cuts={3} />
        <g className="landmark mixc" transform="translate(526 118)">
          <path d="M0 76V12h112v64M8 20h96M16 30h25v34H16zM49 30h22v34H49zM79 30h25v34H79z" />
          <path d="M-8 76h128M16 9 56-5l48 14" />
          <text x="56" y="91">HANGZHOU MIXC · 万象城</text>
        </g>
        <g className="landmark civic" transform="translate(575 370)">
          <ellipse cx="35" cy="25" rx="36" ry="20" /><path d="M3 25q32-52 64 0M8 25h54M20 8v34M50 8v34" />
          <text x="35" y="60">GRAND THEATRE</text>
        </g>
        <g className="park-ink" transform="translate(535 300)">
          <path d="M0 50q35-65 78-15t65-18" /><circle cx="37" cy="30" r="8" /><circle cx="88" cy="24" r="7" />
          <path d="M37 38v18M88 31v20M30 56h70" /><text x="65" y="71">世纪花园</text>
        </g>
      </g>
    );
  }

  if (kind === "garden") {
    return (
      <g className="district-blueprint">
        <path className="waterway canal" d="M275-10C290 100 262 190 282 280S265 410 288 520H330C304 410 322 300 304 210S325 95 312-10Z" />
        <Road d="M15 90H785" label="庆 春 东 路  ·  QINGCHUN EAST ROAD" x={250} y={80} major />
        <Road d="M35 336H775" label="采 荷 路  ·  CAIHE ROAD" x={335} y={327} />
        <Road d="M120 30V472" label="钱 江 路" x={112} y={255} rotate={90} major />
        <Road d="M662 28V470" label="凯 旋 路" x={652} y={248} rotate={90} major />
        <Road d="M350 20V470" label="双 菱 路" x={341} y={230} rotate={90} />
        <Road d="M20 432H780" label="解 放 东 路" x={346} y={423} major />
        <CityBlock x={32} y={120} width={72} height={82} cuts={2} />
        <CityBlock x={145} y={122} width={105} height={76} cuts={3} />
        <CityBlock x={370} y={120} width={115} height={75} cuts={3} />
        <CityBlock x={505} y={120} width={132} height={78} cuts={4} />
        <CityBlock x={145} y={226} width={102} height={84} cuts={3} />
        <CityBlock x={368} y={220} width={118} height={88} cuts={3} />
        <CityBlock x={505} y={220} width={132} height={88} cuts={4} />
        <CityBlock x={32} y={350} width={74} height={65} cuts={2} />
        <CityBlock x={145} y={350} width={105} height={64} cuts={3} />
        <CityBlock x={368} y={350} width={118} height={64} cuts={3} />
        <g className="landmark bicycle-shop" transform="translate(535 132)">
          <path d="M0 74V18h116v56M-8 74h132M8 18 22 5h76l18 13M12 30h92M18 30v44M98 30v44" />
          <circle cx="40" cy="57" r="13" /><circle cx="79" cy="57" r="13" /><path d="M40 57 55 38l24 19M55 38l12 19H40M55 38h15" />
          <text x="58" y="90">LIV · 采荷体验中心</text>
        </g>
        <g className="residential-court" transform="translate(420 245)">
          <path d="M0 58V10h78v48M10 18h58M17 25v24M39 25v24M61 25v24" />
          <text x="39" y="72">采荷新村</text>
        </g>
      </g>
    );
  }

  if (kind === "vinyl") {
    return (
      <g className="district-blueprint">
        <path className="waterway canal" d="M540-10C526 105 560 210 542 318S557 425 548 520H590C603 420 578 320 596 220S570 90 583-10Z" />
        <Road d="M12 92C180 82 345 92 520 72S680 58 790 36" label="石 桥 路  ·  SHIQIAO ROAD" x={290} y={80} rotate={-4} major />
        <Road d="M28 314H780" label="兴 业 街  ·  XINGYE STREET" x={322} y={304} major />
        <Road d="M126 20V475" label="东 新 路" x={117} y={238} rotate={90} major />
        <Road d="M420 20V475" label="长 浜 路" x={411} y={245} rotate={90} />
        <Road d="M680 18V475" label="华 中 路" x={671} y={242} rotate={90} major />
        <Road d="M22 432H780" label="永 祥 街" x={350} y={423} />
        <g className="railway"><path d="M0 138 800 88"/><path d="M0 148 800 98"/>{Array.from({length:20}).map((_,i)=><path key={i} d={`M${i*42} ${145-i*2.6}l10-12`}/>)}</g>
        <CityBlock x={30} y={170} width={75} height={110} cuts={2} />
        <CityBlock x={150} y={166} width={112} height={115} cuts={3} />
        <CityBlock x={286} y={170} width={105} height={108} cuts={3} />
        <CityBlock x={450} y={160} width={70} height={122} cuts={2} />
        <CityBlock x={610} y={145} width={50} height={140} cuts={2} />
        <CityBlock x={30} y={340} width={75} height={70} cuts={2} />
        <CityBlock x={150} y={340} width={112} height={70} cuts={3} />
        <CityBlock x={286} y={340} width={105} height={70} cuts={3} />
        <g className="landmark warehouse" transform="translate(500 185)">
          <path d="M0 85V24l58-24 70 24v61M12 85V35h105v50M25 85V48h80v37M25 48h80M58 48v37" />
          <path d="m8 24 50 18 62-18M58 0v42" />
          <circle cx="45" cy="65" r="13" /><circle cx="45" cy="65" r="3" /><circle cx="86" cy="65" r="13" /><circle cx="86" cy="65" r="3" />
          <text x="64" y="103">经纬创意园 · 7A</text>
        </g>
        <g className="vinyl-ornament" transform="translate(705 365)">
          <circle r="46" /><circle r="31" /><circle r="5" /><path d="M-37-25 37 25M-37 25 37-25" />
          <text y="62">LINGXIANG RECORDS</text>
        </g>
      </g>
    );
  }

  return (
    <g className="district-blueprint grand-atlas">
      <path className="waterway" d="M668-15C642 92 682 185 657 270S700 390 640 520H830V-15Z" />
      <path className="river-bank" d="M668-15C642 92 682 185 657 270S700 390 640 520" />
      <Road d="M20 72H676" label="庆 春 东 路" x={310} y={63} major />
      <Road d="M22 225C178 218 324 232 470 208S590 188 665 185" label="新 业 路" x={300} y={218} />
      <Road d="M22 350C180 344 338 350 475 322S598 302 674 280" label="解 放 东 路" x={310} y={339} major />
      <Road d="M164 22C180 135 176 260 198 470" label="钱 江 路" x={174} y={242} rotate={82} major />
      <Road d="M380 18C366 150 400 280 375 470" label="民 心 路" x={384} y={260} rotate={91} />
      <Road d="M520 20C504 150 535 280 514 470" label="富 春 路" x={519} y={258} rotate={91} major />
      <Road d="M610 20C590 150 620 285 598 468" label="之 江 路" x={607} y={260} rotate={94} major />
      <CityBlock x={30} y={95} width={110} height={92} cuts={3} />
      <CityBlock x={225} y={96} width={120} height={95} cuts={3} />
      <CityBlock x={408} y={95} width={90} height={92} cuts={2} />
      <CityBlock x={32} y={248} width={108} height={78} cuts={3} />
      <CityBlock x={224} y={248} width={120} height={78} cuts={3} />
      <CityBlock x={410} y={240} width={88} height={68} cuts={2} />
      <g className="landmark raffles" transform="translate(75 205)">
        <path d="M0 100 16 4h28l12 96M62 100 79-18h30l13 118" /><path d="M10 100h104M18 17h25M77-3h31M23 34h22M74 18h36" />
        <path d="M6 100q54-25 112 0" /><text x="59" y="118">RAFFLES · 来福士</text>
      </g>
      <g className="landmark mixc" transform="translate(438 90)">
        <path d="M0 72V12h142v60M8 20h126M18 30h30v31H18zM56 30h30v31H56zM94 30h30v31H94z" />
        <path d="M-8 72h158M18 9 70-5l54 14" /><text x="70" y="88">MIXC · DIOR</text>
      </g>
      <g className="landmark civic" transform="translate(500 350)">
        <ellipse cx="34" cy="24" rx="38" ry="22" /><path d="M-1 24q35-58 70 0M4 24h60M18 5v38M50 5v38" />
        <text x="34" y="61">HANGZHOU GRAND THEATRE</text>
      </g>
      <g className="city-balcony" transform="translate(655 365)">
        <path d="M0 45q48-52 105 0M10 45h90M24 45V18M52 45V7M80 45V18" />
        <path d="M-6 52h115" /><text x="51" y="68">CITY BALCONY · 城市阳台</text>
      </g>
      <g className="park-ink" transform="translate(420 300)">
        <path d="M0 28q32-50 70-12t56-10" /><circle cx="32" cy="17" r="7" /><circle cx="81" cy="14" r="6" /><path d="M32 24v18M81 20v18" />
        <text x="62" y="53">世纪花园</text>
      </g>
    </g>
  );
}

export function MapCanvas({
  zone,
  checkpoint,
  routeProgress,
  locationReliable,
  arrived,
  completedIds,
}: Props) {
  const illustratedMap = zone.illustratedMapAsset ?? illustratedMapAssets[zone.mapKind];
  const [loadedAsset, setLoadedAsset] = useState<string | null>(null);
  const [failedAsset, setFailedAsset] = useState<string | null>(null);
  const hasIllustratedBase = Boolean(illustratedMap && failedAsset !== illustratedMap);
  const pathRef = useRef<SVGPathElement>(null);
  const [marker, setMarker] = useState(zone.parkingMapPoint);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [footsteps, setFootsteps] = useState<Array<{ x: number; y: number; angle: number }>>([]);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({
    distance: 0,
    zoom: 1,
    center: { x: 0, y: 0 },
    pan: { x: 0, y: 0 },
  });

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    const point = path.getPointAtLength(length * Math.max(0.02, routeProgress));
    setMarker({ x: point.x, y: point.y });
    setFootsteps(
      Array.from({ length: 13 }, (_, index) => {
        const at = length * (index / 12);
        const routePoint = path.getPointAtLength(at);
        const before = path.getPointAtLength(Math.max(0, at - 2));
        const after = path.getPointAtLength(Math.min(length, at + 2));
        return {
          x: routePoint.x,
          y: routePoint.y,
          angle: (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI + 90,
        };
      }),
    );
  }, [routeProgress, zone.id]);

  function pointerCenter() {
    const values = [...pointers.current.values()];
    return {
      x: values.reduce((sum, point) => sum + point.x, 0) / values.length,
      y: values.reduce((sum, point) => sum + point.y, 0) / values.length,
    };
  }

  function pointerDistance() {
    const [first, second] = [...pointers.current.values()];
    return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0;
  }

  function beginGesture(event: React.PointerEvent<HTMLDivElement>) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic rehearsal events are not backed by a physical pointer.
      // Real iPad touch pointers still use capture so the gesture stays smooth.
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    gesture.current = {
      distance: pointerDistance(),
      zoom,
      center: pointerCenter(),
      pan,
    };
  }

  function moveGesture(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId) || arrived) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const center = pointerCenter();
    if (pointers.current.size >= 2) {
      const distance = pointerDistance();
      const ratio = gesture.current.distance ? distance / gesture.current.distance : 1;
      setZoom(Math.max(0.92, Math.min(1.35, gesture.current.zoom * ratio)));
    }
    setPan({
      x: Math.max(-75, Math.min(75, gesture.current.pan.x + center.x - gesture.current.center.x)),
      y: Math.max(-50, Math.min(50, gesture.current.pan.y + center.y - gesture.current.center.y)),
    });
  }

  function endGesture(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size) {
      gesture.current = {
        distance: pointerDistance(),
        zoom,
        center: pointerCenter(),
        pan,
      };
    }
  }

  return (
    <div className="map-stage" aria-label={`${zone.title} 活点地图`}>
      <div className="map-tools" aria-label="地图缩放">
        <button onClick={() => setZoom((value) => Math.min(1.18, value + 0.08))}>＋</button>
        <button onClick={() => setZoom((value) => Math.max(0.92, value - 0.08))}>−</button>
      </div>
      <motion.div
        className="map-camera"
        aria-label="可拖拽和双指缩放的探索地图"
        data-zoom={zoom.toFixed(2)}
        data-pan={`${Math.round(pan.x)},${Math.round(pan.y)}`}
        animate={{ scale: arrived ? 1.08 : zoom, x: arrived ? -18 : pan.x, y: arrived ? 8 : pan.y }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
        onPointerDown={beginGesture}
        onPointerMove={moveGesture}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
      >
        <svg
          viewBox="0 0 800 500"
          preserveAspectRatio={illustratedMap ? "none" : "xMidYMid meet"}
          role="img"
          className={hasIllustratedBase ? "has-illustrated-base" : ""}
        >
          <defs>
            <filter id="roughen">
              <feTurbulence baseFrequency="0.035" numOctaves="2" seed="9" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
            </filter>
            <filter id="inkGlow">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {illustratedMap && (
            <image
              className="illustrated-base-map"
              href={illustratedMap}
              x="-2"
              y="-2"
              width="804"
              height="504"
              preserveAspectRatio="none"
              onLoad={() => setLoadedAsset(illustratedMap)}
              onError={() => setFailedAsset(illustratedMap)}
            />
          )}
          <AtlasFurniture />
          <g className="legacy-blueprint"><DistrictBlueprint kind={zone.mapKind} /></g>
          <path ref={pathRef} className="route-path" d={zone.svgPath} />
          {footsteps.map((point, index) => {
            const progress = index / 12;
            const visible = progress <= Math.max(0.08, routeProgress + 0.08);
            return (
              <g
                key={index}
                className={`footstep ${visible ? "visible" : ""}`}
                transform={`translate(${point.x} ${point.y}) rotate(${point.angle}) translate(${index % 2 ? 5 : -5} 0)`}
              >
                <ellipse cy="-5" rx="3.8" ry="7.6" />
                <ellipse cy="6" rx="2.6" ry="4.6" />
              </g>
            );
          })}
          <g transform={`translate(${zone.parkingMapPoint.x} ${zone.parkingMapPoint.y})`} className="parking-mark">
            <circle r="23" />
            <path d="M-7 10V-11h10q10 0 10 8T3 5H-2v5z" />
          </g>
          <g transform={`translate(${checkpoint.mapPoint.x} ${checkpoint.mapPoint.y})`} className={`checkpoint-mark ${arrived ? "arrived" : ""}`}>
            <path d="M0-32 28-16 28 17 0 33-28 17-28-16z" />
            <text y="8">{{ scent: 1, motion: 2, sound: 3, sparkle: 4, taste: 5, love: 6 }[checkpoint.giftType]}</text>
          </g>
          {completedIds.map((id, index) => (
            <g key={id} transform={`translate(${675 + index * 24} 445)`} className="wax-dot">
              <circle r="8" /><path d="m-4 0 3 3 6-7" />
            </g>
          ))}
          <motion.g
            initial={false}
            animate={{ x: marker.x, y: marker.y }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className={`you-marker ${locationReliable ? "" : "in-fog"} ${arrived ? "at-destination" : ""}`}
          >
            <circle r="21" className="ink-pool" />
            <circle r="6" className="ink-core" />
            <path d="M-34 32h68l-8 16h-52z" className="marker-ribbon" />
            <text y="44">YOU</text>
          </motion.g>
          <g className="map-cartouche" transform="translate(42 34)">
            <path d="M0 0h330l-14 34H0l10-17z" />
            <text x="20" y="16" className="map-title">{zone.title}</text>
            <text x="20" y="29" className="map-subtitle">{zone.subtitle}</text>
          </g>
          <text
            x={checkpoint.mapPoint.x + (checkpoint.mapPoint.x > 650 ? -42 : 42)}
            y={checkpoint.mapPoint.y + 46}
            textAnchor={checkpoint.mapPoint.x > 650 ? "end" : "start"}
            className="checkpoint-label"
          >{checkpoint.label}</text>
          <text x={zone.parkingMapPoint.x - 28} y={zone.parkingMapPoint.y + 50} className="parking-label">{zone.parkingLabel}</text>
        </svg>
      </motion.div>
      {illustratedMap && loadedAsset !== illustratedMap && failedAsset !== illustratedMap && (
        <div className="map-illustration-loading" role="status">
          <span className="ink-loader" />
          <b>正在显影高清地图…</b>
        </div>
      )}
      {illustratedMap && failedAsset === illustratedMap && (
        <div className="map-illustration-fallback">高清底图暂未载入，已切换线稿模式</div>
      )}
      {!locationReliable && <div className="map-fog map-fog-local" aria-hidden="true" />}
    </div>
  );
}
