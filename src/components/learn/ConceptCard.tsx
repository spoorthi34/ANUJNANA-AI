import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function ConceptCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 md:p-8 card-hover"
    >
      <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
        Core Concept
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Trapped Inside a Box</h2>
      <p className="text-sm text-muted-foreground mb-5">Infinite potential well intuition</p>

      <p className="text-foreground/80 leading-relaxed mb-6">
        An infinite potential well is an idealized region where a particle is completely confined between
        two perfectly rigid walls. The potential energy is zero inside the box and infinitely large outside,
        so the particle can never escape. Because the wave must vanish at both walls, only standing-wave
        patterns fit inside the box, which is why the particle can occupy only specific allowed energy
        levels.
      </p>

      <div className="rounded-2xl gradient-primary p-5 flex gap-3 items-start">
        <Lightbulb className="h-5 w-5 text-primary-foreground shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-primary-foreground mb-1">Key takeaway</h4>
          <p className="text-sm text-primary-foreground/90 leading-relaxed">
            Confinement creates standing waves, and standing waves create quantized energy levels. The
            particle's energy is not continuous inside the box.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
