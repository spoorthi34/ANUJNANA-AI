import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  explanation: string;
}

const nodes: Node[] = [
  { id: "qm", label: "Quantum Mechanics", x: 280, y: 30, explanation: "The physics of very small systems, where energy, momentum, and other quantities are quantized." },
  { id: "wf", label: "Wave Function", x: 100, y: 110, explanation: "A mathematical function ψ that encodes everything knowable about a quantum particle." },
  { id: "bc", label: "Boundary Conditions", x: 460, y: 110, explanation: "Rules requiring the wave function to vanish at the rigid walls of the box." },
  { id: "sw", label: "Standing Waves", x: 280, y: 190, explanation: "Wave patterns that stay fixed in place, formed when a wave reflects between two boundaries." },
  { id: "eq", label: "Energy Quantization", x: 100, y: 270, explanation: "Only discrete energy values are allowed because only certain standing waves fit in the box." },
  { id: "pd", label: "Probability Density", x: 460, y: 270, explanation: "|ψ|² gives the probability of finding the particle at a given position." },
  { id: "iw", label: "Infinite Potential Well", x: 280, y: 350, explanation: "The idealized box with infinitely high walls that confines the particle completely." },
];

const edges: [string, string][] = [
  ["qm", "wf"],
  ["qm", "bc"],
  ["wf", "sw"],
  ["bc", "sw"],
  ["sw", "eq"],
  ["sw", "pd"],
  ["eq", "iw"],
  ["pd", "iw"],
];

export default function ConceptMap() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedNode = nodes.find((n) => n.id === selected);

  const isEdgeActive = (a: string, b: string) => selected === a || selected === b;

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 card-hover">
      <h3 className="text-lg font-bold text-foreground mb-4">Concept Map</h3>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 rounded-2xl bg-muted/30 border border-border overflow-hidden">
          <svg viewBox="0 0 560 400" className="w-full h-auto">
            {edges.map(([a, b], i) => {
              const na = nodes.find((n) => n.id === a)!;
              const nb = nodes.find((n) => n.id === b)!;
              const active = isEdgeActive(a, b);
              return (
                <motion.line
                  key={i}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={active ? "hsl(var(--primary))" : "hsl(var(--border))"}
                  strokeWidth={active ? 2.5 : 1.5}
                  animate={{ opacity: active ? 1 : 0.5 }}
                />
              );
            })}
            {nodes.map((n) => (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                className="cursor-pointer"
                onClick={() => setSelected(n.id === selected ? null : n.id)}
              >
                <motion.circle
                  r={selected === n.id ? 46 : 42}
                  className={selected === n.id ? "fill-primary" : "fill-card"}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  whileHover={{ scale: 1.06 }}
                />
                <foreignObject x={-40} y={-42} width="80" height="84">
                  <div
                    className={`w-full h-full flex items-center justify-center text-center text-[10px] font-semibold leading-tight px-1 ${
                      selected === n.id ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {n.label}
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>
        <div>
          {selectedNode ? (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl bg-primary/5 border border-primary/20 p-4 relative"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <h4 className="font-bold text-sm text-primary mb-2 pr-6">{selectedNode.label}</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{selectedNode.explanation}</p>
            </motion.div>
          ) : (
            <div className="rounded-2xl bg-muted/30 border border-dashed border-border p-4 h-full flex items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">Click a node to explore its explanation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
