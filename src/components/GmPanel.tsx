"use client";

import type { ExplorationZone, PositionSample, StoryProgress } from "@/src/types";

type Props = {
  zone: ExplorationZone;
  progress: StoryProgress;
  position: PositionSample | null;
  surveyMode: boolean;
  onSurveyMode(value: boolean): void;
  onClose(): void;
  onForceArrive(): void;
  onForcePass(): void;
  onPrevious(): void;
  onReset(keepPhotos: boolean): void;
  onMockPosition(): void;
};

export function GmPanel({
  zone,
  progress,
  position,
  surveyMode,
  onSurveyMode,
  onClose,
  onForceArrive,
  onForcePass,
  onPrevious,
  onReset,
  onMockPosition,
}: Props) {
  function exportSurvey() {
    const data = {
      exportedAt: new Date().toISOString(),
      zone: zone.id,
      currentPosition: position,
      activeCheckpoint: progress.activeCheckpointId,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exploration-survey-${zone.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="gm-backdrop">
      <section className="gm-panel" aria-label="制图人控制台">
        <header><div><span>THE CARTOGRAPHER</span><h2>制图人控制台</h2></div><button onClick={onClose}>关闭</button></header>
        <p>当前区域：{zone.title}<br/>当前关卡：{progress.activeCheckpointId}</p>
        <div className="gm-grid">
          <button onClick={onForceArrive}>强制抵达</button>
          <button onClick={onForcePass}>强制过关</button>
          <button onClick={onMockPosition}>模拟当前目标坐标</button>
          <button onClick={onPrevious}>退回上一关</button>
          <button onClick={exportSurvey}>导出当前勘测点</button>
          <label className="gm-toggle"><input type="checkbox" checked={surveyMode} onChange={(event) => onSurveyMode(event.target.checked)}/><span>现场勘测模式</span></label>
        </div>
        <div className="gm-location">
          <b>定位读数</b>
          {position ? (
            <code>{position.latitude.toFixed(6)}, {position.longitude.toFixed(6)} · ±{Math.round(position.accuracy)}m</code>
          ) : <span>暂无有效位置</span>}
        </div>
        <footer>
          <button className="danger-text" onClick={() => onReset(true)}>保留照片并重置进度</button>
          <button className="danger-text" onClick={() => onReset(false)}>清空全部测试数据</button>
        </footer>
      </section>
    </div>
  );
}
