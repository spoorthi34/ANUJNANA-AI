import { useState, useEffect, useRef } from "react";
import { Music, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WellKind } from "@/lib/lessonMedia";

interface WaveVisualizationProps {
  title: string;
  description: string;
  well?: WellKind;
  initialLevel?: number;
}

const W = 200;
const H = 80;

export default function WaveVisualization({ title, description, well = "infinite", initialLevel = 1 }: WaveVisualizationProps) {
  const [level, setLevel] = useState(initialLevel);
  const [phase, setPhase] = useState(0);
  const [isPlucked, setIsPlucked] = useState(false);
  const started = useRef(0);
  const handlePluck = () => { started.current = performance.now(); setIsPlucked(true); };
  useEffect(() => {
    if (!isPlucked) return;
    let frame = 0;
    const animate = (now: number) => {
      const elapsed = (now - started.current) / 1000;
      setPhase(elapsed);
      if (elapsed < 3) frame = requestAnimationFrame(animate);
      else { setIsPlucked(false); setPhase(0); }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPlucked]);

  const amplitude = isPlucked ? 32 * Math.cos(phase * 14) * Math.exp(-phase * 0.5) : 26;
  const levels = well === "infinite" ? [1, 2, 3, 4, 5] : [1, 2, 3];
  const barrierW = 14 * level;
  const b0 = W / 2 - barrierW / 2;
  const b1 = b0 + barrierW;

  const shapeAt = (x: number) => {
    if (well === "infinite") return amplitude * Math.sin(level * Math.PI * (x / W));
    if (well === "finite") {
      const inner = (u: number) => Math.sin(level * Math.PI * (0.1 + 0.8 * u));
      const u = (x - 30) / 140;
      if (u < 0) return amplitude * inner(0) * Math.exp(u * 12);
      if (u > 1) return amplitude * inner(1) * Math.exp(-(u - 1) * 12);
      return amplitude * inner(u);
    }
    const travel = isPlucked ? phase * 9 : 0;
    const carrier = Math.sin(0.16 * x - travel);
    const decay = (to: number) => Math.exp(-((to - b0) / barrierW) * 1.5 * level);
    if (x < b0) return 26 * carrier;
    if (x < b1) return 26 * decay(x) * Math.sin(0.16 * b0 - travel);
    return 26 * decay(b1) * carrier;
  };
  const antinodeX = well === "infinite" ? W / (2 * level) : 30 + 140 * ((0.5 / level - 0.1) / 0.8);
  const path = `M ${Array.from({ length: 101 }, (_, i) => `${i * 2},${(H / 2 - shapeAt(i * 2)).toFixed(1)}`).join(" L ")}`;
  const labels = well === "tunnel" ? ["INCOMING", "BARRIER", "THROUGH"] : well === "finite" ? ["LOW WALL", "", "LOW WALL"] : ["WALL", "", "WALL"];

  return (
    <div className="guitar-tool">
      <div className="flex items-center gap-2 mb-3">
        <Music className="h-4 w-4 text-secondary" />
        <h3 className="font-sans font-extrabold text-xl text-foreground">{title}</h3>
      </div>

      <div className="guitar-analogy">
        <p className="text-sm text-foreground/80 leading-relaxed">
          <span className="font-semibold text-primary">Imagine: </span>
          {description}
        </p>
      </div>

      <Button variant="ghost" aria-label="Pluck the guitar string" className="guitar-pluck" onClick={handlePluck}>
        <div className="flex w-full justify-between mb-2 text-xs font-bold text-muted-foreground">
          {labels.map((label, i) => <span key={i}>{label}</span>)}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" preserveAspectRatio="none">
          {well === "infinite" && <><rect x="0" y="0" width="3" height={H} className="guitar-wall" /><rect x={W - 3} y="0" width="3" height={H} className="guitar-wall" /></>}
          {well === "finite" && <><rect x="26" y="18" width="4" height={H - 18} className="guitar-wall" opacity=".5" /><rect x="170" y="18" width="4" height={H - 18} className="guitar-wall" opacity=".5" /></>}
          {well === "tunnel" && <rect x={b0} y="4" width={barrierW} height={H - 8} rx="2" className="guitar-barrier" />}
          <path d={path} fill="none" stroke="hsl(var(--lesson-wave))" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          {well !== "tunnel" && <circle cx={antinodeX} cy={H / 2 - shapeAt(antinodeX)} r="4.5" fill="hsl(var(--primary))" />}
        </svg>
        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2"><Hand className="h-3 w-3" />{isPlucked ? (well === "tunnel" ? "Wave travelling…" : "Vibrating…") : well === "tunnel" ? "Send a wave" : "Pluck the string"}</span>
      </Button>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-foreground">{well === "tunnel" ? "Barrier:" : "Energy Level:"}</span>
        {levels.map((n) => {
          const label = well === "tunnel" ? ["thin", "medium", "thick"][n - 1] : `n=${n}`;
          return (
            <Button variant="ghost" size={well === "tunnel" ? "sm" : "icon"}
              key={n}
              aria-label={well === "tunnel" ? `${label} barrier` : `Energy level ${n}`}
              aria-pressed={n === level}
              onClick={() => { setLevel(n); handlePluck(); }}
              className={`h-8 ${well === "tunnel" ? "px-3" : "w-8"} rounded-full text-xs font-bold transition-all ${
                n === level ? "bg-secondary text-secondary-foreground scale-110 shadow-md" : "border-2 border-secondary/40 text-secondary hover:bg-secondary/10"
              }`}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
