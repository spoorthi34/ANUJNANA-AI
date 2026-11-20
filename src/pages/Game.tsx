import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { GameCard } from "@/components/game/GameCard";

export default function Game() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Gamepad2 className="h-8 w-8 text-primary" /> Quantum Arcade
        </h1>
        <p className="text-muted-foreground mt-1">Learn by playing — catch valid quantum states, dodge the forbidden zones.</p>
      </motion.div>
      <GameCard />
    </div>
  );
}
