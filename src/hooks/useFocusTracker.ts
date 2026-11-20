import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceLandmarker as FaceLandmarkerType } from "@mediapipe/tasks-vision";
import {
  estimateEffort,
  estimateHeadPose,
  isFacingScreen,
  LOW_FOCUS_THRESHOLD,
  updateFocusWindow,
  type FocusSample,
} from "@/lib/focusAnalysis";

export type CameraState = "off" | "starting" | "on" | "error";
export type AnalysisState = "idle" | "loading" | "running" | "unavailable";
export type AttentionStatus = "focused" | "looking-away" | "eyes-closed" | "no-face";

export interface FocusMetrics {
  focus: number;
  effort: number;
  status: AttentionStatus;
  blinksPerMinute: number;
  lowFocusSince: number | null;
}

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const SAMPLE_INTERVAL_MS = 160;

let landmarkerPromise: Promise<FaceLandmarkerType> | null = null;

function loadLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      const options = (delegate: "GPU" | "CPU") => ({
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: "VIDEO" as const,
        numFaces: 1,
        outputFaceBlendshapes: true,
      });
      try {
        return await FaceLandmarker.createFromOptions(fileset, options("GPU"));
      } catch {
        return await FaceLandmarker.createFromOptions(fileset, options("CPU"));
      }
    })().catch((error) => {
      landmarkerPromise = null;
      throw error;
    });
  }
  return landmarkerPromise;
}

function score(categories: { categoryName: string; score: number }[], names: string[]) {
  const values = names.map((name) => categories.find((c) => c.categoryName === name)?.score ?? 0);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Camera stream plus on-device face analysis. Nothing leaves the browser. */
export function useFocusTracker() {
  const [camState, setCamState] = useState<CameraState>("off");
  const [analysis, setAnalysis] = useState<AnalysisState>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [metrics, setMetrics] = useState<FocusMetrics | null>(null);
  const requestId = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const teardown = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    videoRef.current = null;
  }, []);

  const stop = useCallback(() => {
    requestId.current += 1;
    teardown();
    setStream(null);
    setMetrics(null);
    setCamState("off");
    setAnalysis("idle");
  }, [teardown]);

  const start = useCallback(async () => {
    const id = ++requestId.current;
    setCamState("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera unavailable");
      const media = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      if (id !== requestId.current) { media.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = media;
      setStream(media);
      setCamState("on");

      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = media;
      videoRef.current = video;
      await video.play().catch(() => undefined);

      setAnalysis("loading");
      let landmarker: FaceLandmarkerType;
      try {
        landmarker = await loadLandmarker();
      } catch {
        if (id === requestId.current) setAnalysis("unavailable");
        return;
      }
      if (id !== requestId.current) return;
      setAnalysis("running");

      let samples: FocusSample[] = [];
      let eyesWereClosed = false;
      let blinks: number[] = [];
      let lowFocusSince: number | null = null;
      let lastPublish = 0;
      let lastVideoTime = -1;

      timerRef.current = window.setInterval(() => {
        const v = videoRef.current;
        if (!v || v.readyState < 2 || v.currentTime === lastVideoTime) return;
        lastVideoTime = v.currentTime;
        const now = performance.now();
        let status: AttentionStatus = "no-face";
        let effort = 0;
        try {
          const result = landmarker.detectForVideo(v, now);
          const face = result.faceLandmarks[0];
          const shapes = result.faceBlendshapes[0]?.categories ?? [];
          if (face) {
            const blink = score(shapes, ["eyeBlinkLeft", "eyeBlinkRight"]);
            const closed = blink > 0.55;
            if (closed && !eyesWereClosed) blinks.push(now);
            eyesWereClosed = closed;
            effort = estimateEffort(score(shapes, ["browDownLeft", "browDownRight"]), score(shapes, ["eyeSquintLeft", "eyeSquintRight"]));
            status = !isFacingScreen(estimateHeadPose(face)) ? "looking-away" : closed ? "eyes-closed" : "focused";
          }
        } catch {
          return;
        }
        // Blinks last ~1 sample, so they barely move the 20 s focus window; long eye closures do.
        const next = updateFocusWindow(samples, { t: now, attentive: status === "focused", effort });
        samples = next.samples;
        blinks = blinks.filter((t) => now - t <= 60_000);
        lowFocusSince = next.focus < LOW_FOCUS_THRESHOLD ? lowFocusSince ?? now : null;
        if (now - lastPublish > 450) {
          lastPublish = now;
          const elapsed = Math.min(60_000, now - (samples[0]?.t ?? now));
          setMetrics({
            focus: next.focus,
            effort: next.effort,
            status,
            blinksPerMinute: elapsed > 5_000 ? Math.round((blinks.length / elapsed) * 60_000) : blinks.length,
            lowFocusSince,
          });
        }
      }, SAMPLE_INTERVAL_MS);
    } catch {
      if (id === requestId.current) {
        teardown();
        setStream(null);
        setCamState("error");
      }
    }
  }, [teardown]);

  const toggle = useCallback(() => {
    if (camState === "on" || camState === "starting") stop();
    else start();
  }, [camState, start, stop]);

  useEffect(() => () => { requestId.current += 1; teardown(); }, [teardown]);

  return { camState, analysis, stream, metrics, start, stop, toggle };
}

export type FocusTracker = ReturnType<typeof useFocusTracker>;
