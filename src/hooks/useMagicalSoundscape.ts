"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MUTED_KEY = "exploration-atlas:music-muted-v1";
export const BACKGROUND_TRACK_SRC = "/assets/audio/exploration-background-v2.mp3";
const BACKGROUND_VOLUME = 0.48;

export function useMagicalSoundscape() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const [muted, setMuted] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(MUTED_KEY) === "true",
  );
  const [started, setStarted] = useState(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || mutedRef.current) return false;
    audio.loop = true;
    audio.volume = BACKGROUND_VOLUME;
    audio.muted = false;
    const playback = audio.play();
    startedRef.current = true;
    setStarted(true);
    void playback.catch(() => {
      startedRef.current = false;
      setStarted(false);
    });
    return true;
  }, []);

  const start = useCallback(() => {
    play();
  }, [play]);

  const toggle = useCallback(() => {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setMuted(nextMuted);
    window.localStorage.setItem(MUTED_KEY, String(nextMuted));

    const audio = audioRef.current;
    if (audio) audio.muted = nextMuted;
    if (!nextMuted) play();
  }, [play]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.loop = true;
      audio.volume = BACKGROUND_VOLUME;
      audio.muted = mutedRef.current;
    }

    const handleVisibility = () => {
      const activeAudio = audioRef.current;
      if (!activeAudio) return;
      if (document.visibilityState === "hidden") {
        activeAudio.pause();
      } else if (startedRef.current && !mutedRef.current) {
        void activeAudio.play().catch(() => {
          startedRef.current = false;
          setStarted(false);
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      audioRef.current?.pause();
    };
  }, []);

  return {
    audioRef,
    muted,
    started,
    start,
    toggle,
  };
}
