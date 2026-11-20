import { useMemo, useState } from "react";
import type { VideoSpec, WellKind } from "@/lib/lessonMedia";
import { AnimationControls, captionAt, transmission, useAnimationClock } from "./animationShared";

const LEFT = 170;
const RIGHT = 630;
const FLOOR = 300;
const MID = 170;

/** Wave shape at u (0..1 is inside the well) for infinite and finite wells. */
function boundShape(well: WellKind, n: number, u: number) {
  if (well === "infinite") return u < 0 || u > 1 ? 0 : Math.sin(n * Math.PI * u);
  const inner = (v: number) => Math.sin(n * Math.PI * (0.1 + 0.8 * v));
  if (u < 0) return inner(0) * Math.exp(u * 16);
  if (u > 1) return inner(1) * Math.exp(-(u - 1) * 16);
  return inner(u);
}

function samples(well: WellKind, n: number) {
  let seed = 11 + n * 97 + well.length * 13;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const lo = well === "finite" ? -0.18 : 0;
  const hi = well === "finite" ? 1.18 : 1;
  const points: { x: number; y: number }[] = [];
  while (points.length < 150) {
    const u = lo + rand() * (hi - lo);
    if (rand() < boundShape(well, n, u) ** 2) points.push({ x: LEFT + u * (RIGHT - LEFT), y: FLOOR - 8 - rand() * 24 });
  }
  return points;
}

export default function WellAnimation({ spec }: { spec: VideoSpec }) {
  const clock = useAnimationClock();
  const [level, setLevel] = useState(spec.level);
  const { time } = clock;
  const dots = useMemo(() => (spec.well === "tunnel" ? [] : samples(spec.well, level)), [spec.well, level]);
  const caption = captionAt(spec.captions, time);
  const path = (from: number, to: number, fn: (x: number) => number) =>
    Array.from({ length: 141 }, (_, i) => { const x = from + ((to - from) * i) / 140; return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${fn(x).toFixed(1)}`; }).join(" ");

  let scene: JSX.Element;
  let board: string;
  if (spec.well === "tunnel") {
    const width = 26 * level;
    const b0 = 400 - width / 2;
    const b1 = b0 + width;
    const T = transmission(level);
    const k = 0.07;
    const decay = (x: number) => Math.exp(-((x - b0) / width) * 1.5 * level);
    const wave = (x: number) => {
      const carrier = Math.sin(k * x - time * 4);
      if (x < b0) return MID - 50 * carrier;
      if (x < b1) return MID - 50 * decay(x) * Math.sin(k * b0 - time * 4);
      return MID - 50 * decay(b1) * carrier;
    };
    // Particles: each one runs at the barrier; only a fraction T gets through.
    const particles = Array.from({ length: 10 }, (_, j) => {
      const r = (j * 0.6180339) % 1;
      const passes = r < T;
      const p = ((time + j * 0.9) % 4.5) / 4.5;
      const travel = p * 2 * (b0 - 80);
      const x = passes ? 80 + p * 660 : travel < b0 - 80 ? 80 + travel : b0 - (travel - (b0 - 80));
      return { x, passes };
    });
    board = `Barrier ${["thin", "medium", "thick"][level - 1]} · T ≈ ${(T * 100).toFixed(T < 0.05 ? 1 : 0)}%`;
    scene = <>
      <rect x={b0} y="96" width={width} height={FLOOR - 90} className="box-wall" opacity=".85" />
      <text x={(b0 + b1) / 2} y="90" textAnchor="middle" className="rope-caption">BARRIER</text>
      <path d={`M60 ${FLOOR + 6} H740`} className="box-floor" />
      <path d={path(60, 740, wave)} className="rope-wave-glow" />
      <path d={path(60, 740, wave)} className="rope-wave" />
      {particles.map((p, i) => <circle key={i} cx={p.x} cy={FLOOR - 18} r="6" className={p.passes ? "rope-particle" : "box-ball"} />)}
      <text x="80" y="122" className="rope-caption">incoming + reflected</text>
      <text x="560" y="122" className="rope-caption">transmitted</text>
    </>;
  } else {
    const finite = spec.well === "finite";
    const from = finite ? LEFT - 100 : LEFT;
    const to = finite ? RIGHT + 100 : RIGHT;
    const u = (x: number) => (x - LEFT) / (RIGHT - LEFT);
    const shown = Math.min(dots.length, Math.floor(time * 5));
    const wallTop = finite ? 200 : 90;
    board = `n = ${level} · ${finite ? "bound state" : `E = ${level * level} E₁`}`;
    scene = <>
      {finite && <path d={`M60 ${wallTop} H${LEFT} V${FLOOR + 6} H${RIGHT} V${wallTop} H740`} className="box-outline" />}
      <rect x={LEFT - 18} y={wallTop} width="18" height={FLOOR + 6 - wallTop} className="box-wall" opacity={finite ? 0.45 : 1} />
      <rect x={RIGHT} y={wallTop} width="18" height={FLOOR + 6 - wallTop} className="box-wall" opacity={finite ? 0.45 : 1} />
      <path d={`M60 ${FLOOR + 6} H740`} className="box-floor" />
      {!finite && <><text x={LEFT - 9} y="84" textAnchor="middle" className="rope-caption">∞</text><text x={RIGHT + 9} y="84" textAnchor="middle" className="rope-caption">∞</text></>}
      <path d={`${path(from, to, (x) => FLOOR - 70 * boundShape(spec.well, level, u(x)) ** 2)} L${to},${FLOOR} L${from},${FLOOR} Z`} className="box-density" />
      <path d={path(from, to, (x) => MID - 55 * boundShape(spec.well, level, u(x)) * Math.cos(time * 2.5))} className="rope-wave-glow" />
      <path d={path(from, to, (x) => MID - 55 * boundShape(spec.well, level, u(x)) * Math.cos(time * 2.5))} className="rope-wave" />
      {dots.slice(0, shown).map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="3" className="rope-particle" />)}
      <text x={LEFT + 8} y="112" className="rope-caption">ψ (wave)</text>
      <text x={LEFT + 8} y={FLOOR - 80} className="rope-caption">|ψ|² · dots = measurements</text>
    </>;
  }

  return (
    <div className="rope-player">
      <svg viewBox="0 0 800 430" role="img" aria-label={`${spec.title} animation`}>
        <rect width="800" height="430" className="rope-room" />
        <rect x="40" y="22" width="380" height="40" rx="4" className="rope-sign" />
        <text x="230" y="48" textAnchor="middle" className="rope-sign-text">{spec.title.toUpperCase()}</text>
        <rect x="470" y="22" width="290" height="40" rx="6" className="rope-board" />
        <text x="615" y="48" textAnchor="middle" className="rope-level">{board}</text>
        {scene}
        <rect x="80" y="334" width="640" height="72" rx="8" className="rope-board" />
        <text x="100" y="358" className="rope-caption">NARRATOR</text>
        <text x="100" y="385" className="rope-subtitle">{caption}</text>
      </svg>
      <AnimationControls well={spec.well} level={level} setLevel={setLevel} clock={clock} />
    </div>
  );
}
