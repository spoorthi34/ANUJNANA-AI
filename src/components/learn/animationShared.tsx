import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WellKind } from "@/lib/lessonMedia";

export const ANIMATION_LENGTH = 36;

export function useAnimationClock() {
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setTime((value) => (value + 0.08) % ANIMATION_LENGTH), 80);
    return () => window.clearInterval(timer);
  }, [playing]);
  return { playing, setPlaying, time, restart: () => { setTime(0); setPlaying(true); } };
}

export const captionAt = (captions: string[], time: number) =>
  captions[Math.min(captions.length - 1, Math.floor(time / (ANIMATION_LENGTH / captions.length)))] ?? "";

/** Transmission through a barrier of thickness level (1–3), as a rough exp(-2κw) estimate. */
export const transmission = (level: number) => Math.exp(-1.5 * level);

export const levelLabel = (well: WellKind, n: number) =>
  well === "tunnel" ? ["thin", "medium", "thick"][n - 1] : `n=${n}`;

interface ControlsProps {
  well: WellKind;
  level: number;
  setLevel: (n: number) => void;
  clock: ReturnType<typeof useAnimationClock>;
}

export function AnimationControls({ well, level, setLevel, clock }: ControlsProps) {
  return (
    <div className="rope-controls">
      <Button variant="ghost" size="icon" onClick={() => clock.setPlaying((value) => !value)} aria-label={clock.playing ? "Pause animation" : "Play animation"}>{clock.playing ? <Pause /> : <Play />}</Button>
      <Button variant="ghost" size="icon" onClick={clock.restart} aria-label="Restart animation"><RotateCcw /></Button>
      <span className="text-xs tabular-nums">0:{String(Math.floor(clock.time)).padStart(2, "0")} / 0:{ANIMATION_LENGTH}</span>
      <div className="ml-auto flex items-center gap-1">
        <span className="hidden text-xs opacity-70 sm:inline">{well === "tunnel" ? "Barrier:" : "Level:"}</span>
        {[1, 2, 3].map((n) => (
          <Button key={n} variant="ghost" size="sm" aria-pressed={n === level} className={n === level ? "rope-selected" : ""} onClick={() => setLevel(n)}>{levelLabel(well, n)}</Button>
        ))}
      </div>
    </div>
  );
}
