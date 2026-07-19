"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Checkpoint, MatchResult } from "@/src/types";
import { resizeCapture, scorePhoto } from "@/src/lib/photoMatch";
import { getReference, saveReference } from "@/src/lib/storage";

type Props = {
  checkpoint: Checkpoint;
  attempt: number;
  surveyMode: boolean;
  storageNamespace?: string;
  onClose(): void;
  onPass(dataUrl: string, result: MatchResult): void;
  onAttempt(result: MatchResult): void;
};

export function CameraChallenge({
  checkpoint,
  attempt,
  surveyMode,
  storageNamespace = "formal",
  onClose,
  onPass,
  onAttempt,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<"loading" | "ready" | "error">("loading");
  const [reference, setReference] = useState(checkpoint.referenceImage);
  const [opacity, setOpacity] = useState(0.42);
  const [capture, setCapture] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    getReference(checkpoint.id, storageNamespace).then((saved) => saved && setReference(saved));
    let cancelled = false;
    const cameraTimeout = window.setTimeout(() => {
      if (!cancelled) setCameraState("error");
    }, 12_000);
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } }, audio: false })
      .then((stream) => {
        window.clearTimeout(cameraTimeout);
        if (cancelled) return stream.getTracks().forEach((track) => track.stop());
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => setCameraState("ready"));
        }
      })
      .catch(() => {
        window.clearTimeout(cameraTimeout);
        setCameraState("error");
      });
    return () => {
      cancelled = true;
      window.clearTimeout(cameraTimeout);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [checkpoint.id, storageNamespace]);

  async function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setCapture(await resizeCapture(canvas));
    setResult(null);
  }

  async function evaluate() {
    if (!capture) return;
    setScoring(true);
    try {
      const match = await scorePhoto(reference, capture, checkpoint.matchMode);
      setResult(match);
      onAttempt(match);
      if (match.score >= checkpoint.passScore) onPass(capture, match);
    } catch {
      const fallback: MatchResult = {
        score: 58,
        sceneScore: 58,
        poseScore: null,
        subjectScore: 58,
        message: "魔法镜暂时无法完成计算，可以重拍或请制图人校准。",
      };
      setResult(fallback);
      onAttempt(fallback);
    } finally {
      setScoring(false);
    }
  }

  async function useAsReference() {
    if (!capture) return;
    await saveReference(checkpoint.id, capture, storageNamespace);
    setReference(capture);
    setCapture(null);
    setResult(null);
  }

  function loadFallback(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCapture(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <motion.div className="camera-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="camera-header">
        <button className="text-button" onClick={onClose}>返回地图</button>
        <div><span>PHOTO RE-CREATION</span><strong>{checkpoint.photoPrompt}</strong></div>
        <div className="attempt-mark">第 {attempt + 1} 次</div>
      </div>
      <div className="camera-frame">
        <video ref={videoRef} muted playsInline className={capture ? "hidden" : ""} />
        {capture && <img src={capture} alt="刚刚拍摄的复刻照片" className="captured-preview" />}
        {!capture && <img src={reference} alt="半透明参考照片" className="reference-overlay" style={{ opacity }} />}
        <div className="camera-grid"><i/><i/><i/><i/></div>
        {cameraState === "loading" && <div className="camera-notice">正在唤醒魔法镜头…</div>}
        {cameraState === "error" && (
          <div className="camera-notice error">
            <p>相机没有开启。你可以从照片中选一张继续测试。</p>
            <label className="primary-button">选择照片<input type="file" accept="image/*" onChange={(event) => loadFallback(event.target.files?.[0])} /></label>
          </div>
        )}
        {result && (
          <motion.div className={`score-card ${result.score >= checkpoint.passScore ? "passed" : ""}`} initial={{ scale: 0.86 }} animate={{ scale: 1 }}>
            <b>{result.score}</b><span>匹配度</span><p>{result.message}</p>
            <small>场景 {result.sceneScore} · 姿势 {result.poseScore ?? "未识别"} · 位置 {result.subjectScore}</small>
          </motion.div>
        )}
        <canvas ref={canvasRef} hidden />
      </div>
      <div className="camera-controls">
        {!capture ? (
          <>
            <label>参考透明度<input type="range" min="0" max="0.8" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))}/></label>
            <button className="shutter" onClick={takePhoto} disabled={cameraState !== "ready"} aria-label="拍照"><span /></button>
            <span>请按参考图调整站位</span>
          </>
        ) : (
          <>
            <button className="secondary-button" onClick={() => { setCapture(null); setResult(null); }}>重拍</button>
            {surveyMode && <button className="secondary-button" onClick={useAsReference}>设为本关参考图</button>}
            <button className="primary-button" onClick={evaluate} disabled={scoring}>{scoring ? "正在比对墨迹…" : "开始匹配"}</button>
          </>
        )}
      </div>
      {attempt >= 3 && <p className="magic-interference">魔法受到干扰，请让制图人长按罗盘进行校准。</p>}
    </motion.div>
  );
}
