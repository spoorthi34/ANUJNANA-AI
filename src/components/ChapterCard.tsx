import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type ChapterLevel = "Beginner" | "Core" | "Advanced";

interface ChapterCardProps {
  level: ChapterLevel;
  duration: string;
  title: string;
  description: string;
  progress: number;
  action: "Review" | "Resume" | "Start";
  to?: string;
  delay?: number;
}

const levelStyles: Record<ChapterLevel, string> = {
  Beginner: "bg-success/10 text-success",
  Core: "bg-secondary/10 text-secondary",
  Advanced: "bg-primary/10 text-primary",
};

export function ChapterCard({ level, duration, title, description, progress, action, to = "/learn", delay = 0 }: ChapterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-2xl p-6 card-hover flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", levelStyles[level])}>
          {level}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {duration}
        </span>
      </div>
      <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{description}</p>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <Link to={to}>
        <Button variant={action === "Start" ? "hero" : "outline"} className="w-full rounded-xl">
          {action}
        </Button>
      </Link>
    </motion.div>
  );
}
