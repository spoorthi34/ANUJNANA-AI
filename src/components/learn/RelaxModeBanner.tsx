import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface RelaxModeBannerProps {
  isActive: boolean;
}

export default function RelaxModeBanner({ isActive }: RelaxModeBannerProps) {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-success/10 border border-success/30 py-4 px-6 text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <Sparkles className="h-5 w-5 text-success" />
        <h3 className="text-lg font-semibold text-success">Relax Mode Activated</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Complex equations are hidden. Explanations are simplified into everyday language.
      </p>
    </motion.div>
  );
}
