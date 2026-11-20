import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

const captions: Record<number, string> = {
  1: "n=1 — Lowest energy, no nodes inside the box",
  2: "n=2 — One node at the center",
  3: "n=3 — Two nodes, three half-waves",
  4: "n=4 — Three nodes, four half-waves",
  5: "n=5 — Five half-waves",
};

export default function WaveSimulation() {
  const [n, setN] = useState(1);

  const path = useMemo(() => {
    const width = 560;
    const height = 160;
    const mid = height / 2;
    const amp = 55;
    const points = 120;
    let d = "";
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y = mid - amp * Math.sin((n * Math.PI * (i / points)));
      d += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return d;
  }, [n]);

  const nodes = useMemo(() => {
    const width = 560;
    const arr: number[] = [];
    for (let k = 0; k <= n; k++) arr.push((k / n) * width);
    return arr;
  }, [n]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 md:p-8 card-hover"
    >
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h3 className="text-lg font-bold text-foreground">Standing Wave Simulation</h3>
        <span className="text-sm font-mono font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
          Eₙ ∝ n² = {n * n}
        </span>
      </div>

      <div className="rounded-2xl bg-muted/40 border border-border p-4 overflow-hidden">
        <svg viewBox="0 0 560 160" className="w-full h-auto">
          {/* rigid walls */}
          <rect x="0" y="10" width="8" height="140" className="fill-foreground/70" />
          <rect x="552" y="10" width="8" height="140" className="fill-foreground/70" />
          {/* baseline */}
          <line x1="8" y1="80" x2="552" y2="80" stroke="hsl(var(--border))" strokeDasharray="4 4" />
          {/* nodes */}
          {nodes.map((x, i) => (
            <circle key={i} cx={x} cy={80} r="4" className="fill-accent" />
          ))}
          <motion.path
            key={n}
            d={path}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-3 mb-5">{captions[n]}</p>

      <div className="px-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Quantum Number n</span>
          <span className="text-sm font-bold text-primary">{n}</span>
        </div>
        <Slider min={1} max={5} step={1} value={[n]} onValueChange={(v) => setN(v[0])} />
      </div>
    </motion.div>
  );
}
