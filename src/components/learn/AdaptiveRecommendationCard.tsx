import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdaptiveRecommendationCardProps {
  onSwitchRelax: () => void;
  onViewAnalogy: () => void;
}

export default function AdaptiveRecommendationCard({ onSwitchRelax, onViewAnalogy }: AdaptiveRecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 border border-warning/30"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="h-9 w-9 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
          <Sparkles className="h-4.5 w-4.5 text-warning" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-foreground mb-1">AI Recommendation</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You seem to be struggling with boundary conditions. Switch to Relax Mode and try the Guitar
            String analogy before attempting the quiz again.
          </p>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <Button onClick={onSwitchRelax} className="rounded-full gradient-primary text-primary-foreground">
          Switch to Relax Mode
        </Button>
        <Button onClick={onViewAnalogy} variant="outline" className="rounded-full">
          View Analogy
        </Button>
      </div>
    </motion.div>
  );
}
