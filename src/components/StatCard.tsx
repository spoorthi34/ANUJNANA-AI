import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

interface StatCardProps {
  icon?: LucideIcon;
  emoji?: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  formatted?: string;
  delay?: number;
}

export function StatCard({ icon: Icon, emoji, label, value, suffix = "", prefix = "", formatted, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-2xl p-5 card-hover"
    >
      <div className="flex items-center gap-2 mb-2">
        {emoji ? (
          <span className="text-2xl leading-none" aria-hidden="true">{emoji}</span>
        ) : Icon ? (
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        ) : null}
      </div>
      <div className="text-2xl font-bold text-foreground">
        {formatted ?? <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />}
      </div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
    </motion.div>
  );
}
