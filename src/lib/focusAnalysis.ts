export interface Point { x: number; y: number }

/** Landmark indices from the 478-point face mesh. */
const NOSE_TIP = 1;
const FACE_LEFT = 234;
const FACE_RIGHT = 454;
const FOREHEAD = 10;
const CHIN = 152;

export interface HeadPose {
  /** 0 = facing the camera; positive/negative = turned to one side. */
  yaw: number;
  /** 0 = level; positive = looking down, negative = looking up. */
  pitch: number;
}

export function estimateHeadPose(landmarks: Point[]): HeadPose | null {
  const nose = landmarks[NOSE_TIP];
  const left = landmarks[FACE_LEFT];
  const right = landmarks[FACE_RIGHT];
  const top = landmarks[FOREHEAD];
  const bottom = landmarks[CHIN];
  if (!nose || !left || !right || !top || !bottom) return null;
  const width = right.x - left.x;
  const height = bottom.y - top.y;
  if (Math.abs(width) < 1e-6 || Math.abs(height) < 1e-6) return null;
  return {
    yaw: (nose.x - left.x) / width - 0.5,
    pitch: (nose.y - top.y) / height - 0.55,
  };
}

export const MAX_YAW = 0.17;
export const MAX_PITCH = 0.16;

export function isFacingScreen(pose: HeadPose | null) {
  return !!pose && Math.abs(pose.yaw) <= MAX_YAW && Math.abs(pose.pitch) <= MAX_PITCH;
}

export interface FocusSample { t: number; attentive: boolean; effort: number }

export const FOCUS_WINDOW_MS = 20_000;

/** Keeps samples from the last window and returns the share of attentive moments (0-100). */
export function updateFocusWindow(samples: FocusSample[], sample: FocusSample, windowMs = FOCUS_WINDOW_MS) {
  const kept = [...samples.filter((s) => sample.t - s.t <= windowMs), sample];
  const attentive = kept.filter((s) => s.attentive).length;
  const focus = Math.round((attentive / kept.length) * 100);
  const effort = Math.round(kept.reduce((sum, s) => sum + s.effort, 0) / kept.length);
  return { samples: kept, focus, effort };
}

/** Effort estimate (0-100) from brow tension and squinting blendshapes. */
export function estimateEffort(browDown: number, squint: number) {
  const raw = (browDown * 0.7 + squint * 0.3) / 0.5;
  return Math.round(Math.min(1, Math.max(0, raw)) * 100);
}

export const LOW_FOCUS_THRESHOLD = 50;
export const LOW_FOCUS_DURATION_MS = 15_000;

/** True once focus has stayed below the threshold for the whole duration. */
export function shouldSuggestRelax(lowFocusSince: number | null, now: number) {
  return lowFocusSince !== null && now - lowFocusSince >= LOW_FOCUS_DURATION_MS;
}
