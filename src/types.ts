export type LatLng = {
  latitude: number;
  longitude: number;
};

export type GiftType =
  | "scent"
  | "motion"
  | "sound"
  | "sparkle"
  | "taste"
  | "love";

export type MatchMode = "pose-scene" | "scene-only";

export type Checkpoint = {
  id: string;
  label: string;
  giftType: GiftType;
  location: LatLng;
  unlockRadiusM: number;
  referenceImage: string;
  matchMode: MatchMode;
  passScore: number;
  clue: string;
  unlockCopy: string;
  photoPrompt: string;
  mapPoint: { x: number; y: number };
};

export type ExplorationZone = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  parkingLabel: string;
  parkingMapPoint: { x: number; y: number };
  center: LatLng;
  routeGeo: LatLng[];
  svgPath: string;
  maxLocationAccuracyM: number;
  accent: string;
  mapKind: "arcade" | "garden" | "vinyl" | "city";
  illustratedMapAsset?: string;
  checkpoints: Checkpoint[];
};

export type StoryProgress = {
  activeZoneId: string;
  activeCheckpointId: string;
  completedCheckpointIds: string[];
  photoAttempts: Record<string, number>;
  capturedPhotoIds: string[];
  phase: "intro" | "map" | "fog" | "finale";
  zoneStarted: boolean;
  arrivedCheckpointIds: string[];
};

export type PositionSample = LatLng & {
  accuracy: number;
  timestamp: number;
};

export type RouteMatch = {
  progress: number;
  distanceFromRouteM: number;
  distanceToCheckpointM: number;
};

export type CapturedPhoto = {
  id: string;
  checkpointId: string;
  dataUrl: string;
  score: number;
  createdAt: number;
};

export type MatchResult = {
  score: number;
  sceneScore: number;
  poseScore: number | null;
  subjectScore: number;
  message: string;
};
