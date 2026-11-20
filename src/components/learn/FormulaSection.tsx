import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";

const formulas = [
  {
    eq: "ψₙ(x) = √(2/L) · sin(nπx/L)",
    explain: "This describes the shape of the particle's wave inside the box for quantum number n — it's zero at both walls and peaks in between.",
  },
  {
    eq: "Eₙ = n²h² / 8mL²",
    explain: "The allowed energy for level n. Because n is a whole number, energy jumps in discrete steps rather than varying smoothly.",
  },
  {
    eq: "L = box length",
    explain: "A smaller box squeezes the wave more tightly, which pushes all the allowed energies higher.",
  },
];

export default function FormulaSection() {
  const [showMath, setShowMath] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card rounded-3xl p-6 md:p-8 card-hover"
    >
      <div className="flex items-center justify-between gap-4 mb-5">
        <h3 className="text-lg font-bold text-foreground">Mathematical Derivation</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show Mathematical Derivation</span>
          <Switch checked={showMath} onCheckedChange={setShowMath} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showMath ? (
          <motion.div
            key="math"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {formulas.map((f, i) => (
              <div key={i} className="rounded-2xl bg-secondary/5 border border-border p-4">
                <p className="font-mono text-base md:text-lg font-semibold text-primary tracking-wide mb-1.5">
                  {f.eq}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.explain}</p>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.p
            key="conceptual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-foreground/80 leading-relaxed"
          >
            The particle's allowed energies depend on how many half-waves fit inside the box. More
            half-waves mean higher energy, and the energy grows much faster than the number of waves —
            it quadruples every time n doubles. Toggle the switch above to see the exact formulas.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
