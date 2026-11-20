import { motion } from "framer-motion";
import { Network, Lightbulb, GitBranch, MousePointerClick } from "lucide-react";
import ConceptMap from "@/components/learn/ConceptMap";

const tips = [
  {
    icon: MousePointerClick,
    title: "Tap any circle",
    text: "Each node opens a short, plain-language explanation of that idea.",
  },
  {
    icon: GitBranch,
    title: "Follow the lines",
    text: "Connections show which ideas depend on each other — master the parents first.",
  },
  {
    icon: Lightbulb,
    title: "Start at the top",
    text: "Quantum Mechanics is the root; the Infinite Potential Well sits at the bottom, built from everything above it.",
  },
];

export default function Concepts() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Network className="h-8 w-8 text-primary" /> Concept Map
        </h1>
        <p className="text-muted-foreground mt-1">
          See how every idea in the Infinite Potential Well chapter connects
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <ConceptMap />
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4">
        {tips.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + 0.05 * i }}
            className="glass-card rounded-2xl p-5 card-hover"
          >
            <t.icon className="h-6 w-6 text-primary mb-2" />
            <div className="font-bold text-foreground text-sm">{t.title}</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
