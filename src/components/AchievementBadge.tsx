import { motion } from "framer-motion";
import { Lock, type LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AchievementBadgeProps {
  emoji?: string;
  icon?: LucideIcon;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  delay?: number;
}

export function AchievementBadge({ emoji, icon: Icon, title, description, unlocked, progress, delay = 0 }: AchievementBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden glass-card rounded-2xl p-6 card-hover ${!unlocked ? "opacity-70" : ""}`}
    >
      {unlocked && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(115deg, transparent 30%, hsl(var(--primary-foreground) / 0.35) 50%, transparent 70%)",
          }}
        />
      )}
      <div className={`relative h-14 w-14 rounded-xl flex items-center justify-center mb-4 text-2xl ${unlocked ? "gradient-primary" : "bg-muted"}`}>
        {unlocked ? (
          emoji ?? (Icon && <Icon className="h-7 w-7 text-primary-foreground" />)
        ) : (
          <Lock className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-semibold text-foreground relative">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 mb-3 relative">{description}</p>
      {typeof progress === "number" && (
        <>
          <Progress value={progress} className="h-1.5 relative" />
          <span className="text-xs text-muted-foreground mt-1.5 block relative">{progress}%</span>
        </>
      )}
      {unlocked && progress === undefined && (
        <span className="text-xs text-success font-medium block relative">✓ Unlocked</span>
      )}
    </motion.div>
  );
}
