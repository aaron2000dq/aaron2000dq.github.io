import type { CSSProperties } from "react";
import type { Checkpoint } from "@/src/types";
import { CinematicOwl } from "./CinematicOwl";

const starNodes = [
  { x: 12, y: 20, delay: "-.6s" },
  { x: 24, y: 38, delay: "-1.8s" },
  { x: 43, y: 17, delay: "-2.7s" },
  { x: 61, y: 32, delay: "-1.1s" },
  { x: 76, y: 14, delay: "-3.4s" },
  { x: 88, y: 42, delay: "-2.2s" },
];

function ChapterRelic({ giftType }: { giftType: Checkpoint["giftType"] }) {
  return (
    <div className="chapter-relic" data-gift={giftType}>
      <svg viewBox="0 0 120 120">
        {giftType === "scent" && (
          <g className="relic-potion">
            <path d="M47 16h26M51 17v23L27 82q-8 20 13 22h40q21-2 13-22L69 40V17" />
            <path className="relic-fill" d="M35 77q25-12 50 0l9 18H27Z" />
            <circle cx="54" cy="84" r="3"/><circle cx="70" cy="92" r="2"/>
            <path className="relic-vapor vapor-one" d="M53 13q-14-11 2-20" />
            <path className="relic-vapor vapor-two" d="M68 11q14-13-1-24" />
          </g>
        )}
        {giftType === "motion" && (
          <g className="relic-wheel">
            <circle cx="60" cy="62" r="25"/><circle cx="60" cy="62" r="5"/>
            <path d="M60 37v50M35 62h50M42 44l36 36M78 44 42 80" />
            <path className="relic-wing wing-left" d="M33 50Q12 29 5 51q11 14 31 16" />
            <path className="relic-wing wing-right" d="M87 50q21-21 28 1-11 14-31 16" />
          </g>
        )}
        {giftType === "sound" && (
          <g className="relic-record">
            <circle cx="57" cy="61" r="38"/><circle cx="57" cy="61" r="22"/><circle cx="57" cy="61" r="5"/>
            <path className="record-arm" d="M89 25v50L70 89"/><circle cx="89" cy="22" r="5"/>
            <path className="floating-note note-one" d="M31 27v-17l12-3v17M31 27q-8-3-8 4 8 5 8-4M43 24q-8-3-8 4 8 5 8-4" />
          </g>
        )}
        {giftType === "sparkle" && (
          <g className="relic-gem">
            <path className="gem-core" d="M25 47 43 25h34l18 22-35 51Z" />
            <path d="m25 47 35 11 35-11M43 25l17 33 17-33M60 58v40" />
            <path className="gem-ray" d="M60 7v12M19 22l9 9M101 22l-9 9M12 62h13M108 62H95" />
          </g>
        )}
        {giftType === "taste" && (
          <g className="relic-cloche">
            <path d="M18 82h84M27 77q2-39 33-42 31 3 33 42ZM13 89h94" />
            <circle cx="60" cy="28" r="7" />
            <path className="relic-vapor vapor-one" d="M45 27q-11-14 1-26" />
            <path className="relic-vapor vapor-two" d="M70 24q13-14 1-27" />
          </g>
        )}
        {giftType === "love" && (
          <g className="relic-letter">
            <path d="M16 34h88v58H16Z"/><path d="m16 38 44 34 44-34M16 92l34-31M104 92 70 61" />
            <path className="letter-heart" d="M60 43c-12-14-25 4 0 20 25-16 12-34 0-20Z" />
          </g>
        )}
      </svg>
      <span>{giftType === "love" ? "THE LAST SECRET" : "ENCHANTED OBJECT"}</span>
    </div>
  );
}

export function MapMagicOverlay({ giftType }: { giftType: Checkpoint["giftType"] }) {
  return (
    <div className="map-magic-overlay" data-gift={giftType} aria-hidden="true">
      <div className="map-reveal-veil" />
      <div className="map-arcane-fog map-arcane-fog-a" />
      <div className="map-arcane-fog map-arcane-fog-b" />
      <div className="map-candle-bloom" />
      <svg className="ink-constellation" viewBox="0 0 100 50" preserveAspectRatio="none">
        <path d="M12 20 24 38 43 17 61 32 76 14 88 42" />
        {starNodes.map((node, index) => (
          <g key={index} transform={`translate(${node.x} ${node.y})`}>
            <circle r="1.15" style={{ "--star-delay": node.delay } as CSSProperties} />
            <path d="M-2 0H2M0-2V2" />
          </g>
        ))}
      </svg>

      <div className="map-owl-flight owl-flight-near">
        <span className="owl-flight-glimmer" />
        <CinematicOwl className="owl-map-near" />
      </div>
      <div className="map-owl-flight owl-flight-far">
        <CinematicOwl className="owl-map-far" />
      </div>

      <div className="falling-feather feather-one" />
      <div className="falling-feather feather-two" />
      <ChapterRelic giftType={giftType} />
    </div>
  );
}
