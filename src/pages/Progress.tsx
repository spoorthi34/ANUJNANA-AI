import { motion } from "framer-motion";
import { LineChart as LineChartIcon } from "lucide-react";
import { ProgressDashboard } from "@/components/ProgressDashboard";

export default function ProgressPage() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <LineChartIcon className="h-8 w-8 text-primary" /> Your Progress
        </h1>
        <p className="text-muted-foreground mt-1">Track your quantum-physics learning journey</p>
      </motion.div>

      <ProgressDashboard />
    </div>
  );
}
