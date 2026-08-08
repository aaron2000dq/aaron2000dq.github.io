"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MUTED_KEY = "exploration-atlas:music-muted-v1";
const PHRASE_SECONDS = 9.6;

// An original D-minor pentatonic phrase. It deliberately avoids quoting any
// film score while retaining the glassy, nocturnal character of a magic atlas.
const PHRASE: Array<[offset: number, midi: number, duration: number, volume: number]> = [
  [0, 74, 0.78, 0.14],
  [0.76, 77, 0.42, 0.1],
  [1.22, 81, 0.88, 0.12],
  [2.34, 72, 0.48, 0.08],
  [2.92, 79, 0.76, 0.1],
  [4.22, 76, 0.46, 0.085],
  [4.76, 81, 0.48, 0.095],
  [5.34, 84, 0.9, 0.11],
  [6.72, 79, 0.58, 0.085],
  [7.42, 74, 1.52, 0.105],
];

type SafariWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

function midiFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function scheduleBell(
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  startsAt: number,
  duration: number,
  volume: number,
) {
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0.0001, startsAt);
  envelope.gain.exponentialRampToValueAtTime(volume, startsAt + 0.018);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);
  envelope.connect(destination);

  const partials: Array<[ratio: number, level: number, type: OscillatorType]> = [
    [1, 1, "sine"],
    [2.01, 0.31, "triangle"],
    [3.98, 0.09, "sine"],
  ];
  partials.forEach(([ratio, level, type]) => {
    const oscillator = context.createOscillator();
    const partialGain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency * ratio, startsAt);
    partialGain.gain.setValueAtTime(level, startsAt);
    oscillator.connect(partialGain).connect(envelope);
    oscillator.start(startsAt);
    oscillator.stop(startsAt + duration + 0.08);
  });
}

function schedulePhrase(context: AudioContext, destination: AudioNode, startsAt: number) {
  PHRASE.forEach(([offset, midi, duration, volume]) => {
    scheduleBell(context, destination, midiFrequency(midi), startsAt + offset, duration, volume);
  });

  // A nearly subliminal two-note floor keeps the sparse bells from feeling
  // like notification sounds. It fades fully between phrases.
  const padGain = context.createGain();
  padGain.gain.setValueAtTime(0.0001, startsAt);
  padGain.gain.exponentialRampToValueAtTime(0.018, startsAt + 1.4);
  padGain.gain.setValueAtTime(0.018, startsAt + 7.2);
  padGain.gain.exponentialRampToValueAtTime(0.0001, startsAt + 9.3);
  padGain.connect(destination);
  [50, 57].forEach((midi, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = index ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(midiFrequency(midi), startsAt);
    oscillator.connect(padGain);
    oscillator.start(startsAt);
    oscillator.stop(startsAt + 9.4);
  });
}

export function useMagicalSoundscape() {
  const [muted, setMuted] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(MUTED_KEY) === "true",
  );
  const [started, setStarted] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextPhraseRef = useRef(0);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const setMasterLevel = useCallback((isMuted: boolean) => {
    const context = contextRef.current;
    const master = masterRef.current;
    if (!context || !master) return;
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.exponentialRampToValueAtTime(isMuted ? 0.0001 : 0.52, now + 0.28);
  }, []);

  const ensureStarted = useCallback(() => {
    if (contextRef.current) {
      void contextRef.current.resume().catch(() => undefined);
      setMasterLevel(mutedRef.current);
      return true;
    }
    const AudioContextClass = window.AudioContext ?? (window as SafariWindow).webkitAudioContext;
    if (!AudioContextClass) return false;
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.setValueAtTime(mutedRef.current ? 0.0001 : 0.52, context.currentTime);
    master.connect(context.destination);
    contextRef.current = context;
    masterRef.current = master;
    setStarted(true);

    const firstPhrase = context.currentTime + 0.08;
    schedulePhrase(context, master, firstPhrase);
    nextPhraseRef.current = firstPhrase + PHRASE_SECONDS;
    timerRef.current = window.setInterval(() => {
      const activeContext = contextRef.current;
      const activeMaster = masterRef.current;
      if (!activeContext || !activeMaster || activeContext.state === "closed") return;
      while (nextPhraseRef.current < activeContext.currentTime + 2.2) {
        schedulePhrase(activeContext, activeMaster, nextPhraseRef.current);
        nextPhraseRef.current += PHRASE_SECONDS;
      }
    }, 900);
    void context.resume().catch(() => undefined);
    return true;
  }, [setMasterLevel]);

  const start = useCallback(() => {
    if (mutedRef.current) return;
    ensureStarted();
  }, [ensureStarted]);

  const toggle = useCallback(() => {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setMuted(nextMuted);
    window.localStorage.setItem(MUTED_KEY, String(nextMuted));
    if (!nextMuted) ensureStarted();
    setMasterLevel(nextMuted);
  }, [ensureStarted, setMasterLevel]);

  useEffect(() => {
    const handleVisibility = () => {
      const context = contextRef.current;
      if (!context) return;
      if (document.visibilityState === "hidden") {
        void context.suspend().catch(() => undefined);
      } else if (!mutedRef.current) {
        void context.resume().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (timerRef.current) window.clearInterval(timerRef.current);
      void contextRef.current?.close().catch(() => undefined);
    };
  }, []);

  return {
    muted,
    started,
    start,
    toggle,
  };
}
