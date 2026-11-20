import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Highlighter, StickyNote, RotateCw } from "lucide-react";

export default function Flashcard() {
  const [flipped, setFlipped] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [highlighted, setHighlighted] = useState(false);

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Flashcard</h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setBookmarked((b) => !b)}
            className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
              bookmarked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title="Bookmark"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            onClick={() => setHighlighted((h) => !h)}
            className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
              highlighted ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </button>
          <button
            className="h-8 w-8 rounded-full bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
            title="Add note"
          >
            <StickyNote className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="[perspective:1200px]">
        <motion.div
          className="relative w-full h-52 cursor-pointer [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => setFlipped((f) => !f)}
        >
          <div
            className={`absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 ${
              highlighted ? "bg-accent/10 border border-accent/30" : "bg-muted/40 border border-border"
            } [backface-visibility:hidden]`}
          >
            <span className="text-xs uppercase tracking-wider text-primary font-bold">Question</span>
            <p className="text-foreground font-medium">Why are energy levels quantized?</p>
            <span className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <RotateCw className="h-3 w-3" /> Tap to flip
            </span>
          </div>
          <div
            className="absolute inset-0 rounded-2xl gradient-primary p-6 flex flex-col items-center justify-center text-center gap-2 [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <span className="text-xs uppercase tracking-wider text-primary-foreground/80 font-bold">Answer</span>
            <p className="text-primary-foreground font-medium">
              Because only standing waves satisfying boundary conditions can exist inside the box.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
