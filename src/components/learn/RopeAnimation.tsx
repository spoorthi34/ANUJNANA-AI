import { useState } from "react";
import type { VideoSpec } from "@/lib/lessonMedia";
import { AnimationControls, captionAt, useAnimationClock } from "./animationShared";

export default function RopeAnimation({ spec }: { spec: VideoSpec }) {
  const clock = useAnimationClock();
  const [level, setLevel] = useState(spec.level);
  const { time } = clock;
  const tunnel = spec.well === "tunnel";
  const finite = spec.well === "finite";
  const foamWidth = 22 * level;
  const f0 = 400 - foamWidth / 2;
  const f1 = f0 + foamWidth;
  const y = (i: number) => {
    const x = 130 + i * 4.5;
    const u = i / 120;
    if (tunnel) {
      const carrier = Math.sin(0.06 * x - time * 4);
      if (x < f0) return 230 - 40 * carrier;
      const fade = Math.exp(-((Math.min(x, f1) - f0) / foamWidth) * 1.5 * level);
      return x < f1 ? 230 - 40 * fade * Math.sin(0.06 * f0 - time * 4) : 230 - 40 * fade * carrier;
    }
    const shape = finite ? Math.sin(level * Math.PI * (0.1 + 0.8 * u)) : Math.sin(level * Math.PI * u);
    return 230 - 46 * shape * Math.cos(time * 3);
  };
  const wave = Array.from({ length: 121 }, (_, i) => `${i === 0 ? "M" : "L"}${130 + i * 4.5},${y(i).toFixed(1)}`).join(" ");
  const student = (x: number, colorClass: string, facing: number, handY = 15) => <g transform={`translate(${x} 215)`} className={colorClass}>
    <ellipse cx="0" cy="86" rx="34" ry="8" className="rope-shadow" />
    <path d="M-10 25 L-17 80 M10 25 L18 80" className="rope-limbs" />
    <path d="M-20 -14 L20 -14 L14 34 L-14 34 Z" fill="currentColor" />
    <path d={`M${facing * 17} -4 L${facing * 42} ${handY}`} className="rope-limbs" />
    <circle cy="-35" r="17" className="rope-skin" />
    <path d="M-17 -39 Q0 -66 17 -39" className="rope-hair" />
  </g>;
  return <div className="rope-player">
    <svg viewBox="0 0 800 430" role="img" aria-label={`${spec.title}: a rope animation in the quantum gym`}>
      <rect width="800" height="430" className="rope-room" />
      <path d="M0 290 L800 290 L800 430 L0 430Z" className="rope-floor" />
      <path d="M0 430 L190 290 M800 430 L610 290 M400 430 V290 M0 355 H800" className="rope-floor-lines" />
      <rect x="40" y="22" width="380" height="40" rx="4" className="rope-sign" />
      <text x="230" y="48" textAnchor="middle" className="rope-sign-text">{spec.title.toUpperCase()}</text>
      <rect x="565" y="84" width="195" height="70" rx="6" className="rope-board" />
      <text x="585" y="108" className="rope-caption">{tunnel ? "FOAM WALL" : finite ? "LOOSE HANDLES" : "FIXED HANDLES"}</text>
      <text x="585" y="136" className="rope-level">{tunnel ? `${["thin", "medium", "thick"][level - 1]} wall` : `n = ${level} · ${level} loop${level > 1 ? "s" : ""}`}</text>
      {student(88, "rope-student-blue", 1, y(0) - 215)}
      {student(712, "rope-student-coral", -1, y(120) - 215)}
      {tunnel && <rect x={f0} y="150" width={foamWidth} height="140" rx="6" className="box-wall" opacity=".7" />}
      <path d={wave} className="rope-wave-glow" />
      <path d={wave} className="rope-wave" />
      {!tunnel && <circle cx="400" cy={y(60)} r="7" className="rope-particle" />}
      <rect x="80" y="334" width="640" height="72" rx="8" className="rope-board" />
      <text x="100" y="358" className="rope-caption">COACH</text>
      <text x="100" y="385" className="rope-subtitle">{captionAt(spec.captions, time)}</text>
    </svg>
    <AnimationControls well={spec.well} level={level} setLevel={setLevel} clock={clock} />
  </div>;
}
