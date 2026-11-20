import { motion } from "framer-motion";

export type LearningMode = "normal" | "relax" | "story" | "animation" | "quiz" | "game";

const modes: { key: LearningMode; label: string; emoji: string }[] = [
  { key: "normal", label: "Normal", emoji: "📘" },
  { key: "relax", label: "Relax", emoji: "🧘" },
  { key: "story", label: "Story", emoji: "📖" },
  { key: "animation", label: "Animation", emoji: "🎬" },
  { key: "quiz", label: "Quiz", emoji: "🧠" },
  { key: "game", label: "Game", emoji: "🎮" },
];

interface LearningModeToggleProps {
  mode: LearningMode;
  onChange: (mode: LearningMode) => void;
}

export default function LearningModeToggle({ mode, onChange }: LearningModeToggleProps) {
  return (
    <div className="flex flex-wrap gap-2 p-1.5 rounded-full glass-panel border border-border w-fit max-w-full">
      {modes.map((m) => {
        const isActive = m.key === mode;
        return (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="mode-pill-indicator"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{m.emoji}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
