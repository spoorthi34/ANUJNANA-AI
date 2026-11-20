import { useEffect, useRef } from "react";

const IDLE_AFTER_MS = 120_000;
const FLUSH_EVERY_S = 60;
const MIN_FLUSH_S = 20;

/**
 * Counts seconds a learner actively spends on a lesson (tab visible and some
 * interaction in the last two minutes) and hands them over in chunks.
 */
export function useStudyTimer(onFlush: (seconds: number) => void) {
  const flushRef = useRef(onFlush);
  flushRef.current = onFlush;

  useEffect(() => {
    let seconds = 0;
    let lastInteraction = Date.now();
    const touch = () => { lastInteraction = Date.now(); };
    const flush = () => {
      if (seconds >= MIN_FLUSH_S) flushRef.current(seconds);
      seconds = 0;
    };
    const tick = window.setInterval(() => {
      if (document.visibilityState !== "visible" || Date.now() - lastInteraction > IDLE_AFTER_MS) return;
      seconds += 1;
      if (seconds >= FLUSH_EVERY_S) flush();
    }, 1000);
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); else touch(); };
    const events = ["pointerdown", "pointermove", "keydown", "scroll", "wheel", "touchstart"] as const;
    events.forEach((name) => window.addEventListener(name, touch, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      window.clearInterval(tick);
      events.forEach((name) => window.removeEventListener(name, touch));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);
}
