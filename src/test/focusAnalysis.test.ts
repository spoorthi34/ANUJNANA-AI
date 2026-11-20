import { describe, expect, it } from "vitest";
import { estimateHeadPose, isFacingScreen, shouldSuggestRelax, updateFocusWindow } from "@/lib/focusAnalysis";

function face(noseX: number, noseY = 0.55) {
  const points = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
  points[234] = { x: 0, y: 0.5 };
  points[454] = { x: 1, y: 0.5 };
  points[10] = { x: 0.5, y: 0 };
  points[152] = { x: 0.5, y: 1 };
  points[1] = { x: noseX, y: noseY };
  return points;
}

describe("focus analysis", () => {
  it("treats a centred face as looking at the screen", () => {
    expect(isFacingScreen(estimateHeadPose(face(0.5)))).toBe(true);
  });

  it("treats a turned head as looking away", () => {
    expect(isFacingScreen(estimateHeadPose(face(0.85)))).toBe(false);
  });

  it("scores focus as the share of attentive moments in the last 20 seconds", () => {
    let samples = [] as Parameters<typeof updateFocusWindow>[0];
    let focus = 0;
    [true, true, false, false].forEach((attentive, i) => {
      ({ samples, focus } = updateFocusWindow(samples, { t: i * 1000, attentive, effort: 0 }));
    });
    expect(focus).toBe(50);
    ({ focus } = updateFocusWindow(samples, { t: 21_500, attentive: true, effort: 0 }));
    expect(focus).toBe(33); // the two attentive samples older than 20 s dropped out
  });

  it("suggests Relax Mode only after 15 seconds of low focus", () => {
    expect(shouldSuggestRelax(null, 60_000)).toBe(false);
    expect(shouldSuggestRelax(50_000, 64_000)).toBe(false);
    expect(shouldSuggestRelax(50_000, 65_000)).toBe(true);
  });
});
