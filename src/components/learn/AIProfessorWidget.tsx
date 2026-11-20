import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X, Send } from "lucide-react";

interface ChatMessage {
  role: "professor" | "user";
  text: string;
}

const quickActions = [
  "Explain Again",
  "Simpler Version",
  "Real-Life Analogy",
  "Solve Step-by-Step",
  "Give a Quiz",
  "Summarize",
];

const mockResponses: Record<string, string> = {
  "Explain Again": "Let's slow down. What part of the boundary conditions feels unclear — where the wave must be zero, or why that limits the shapes?",
  "Simpler Version": "Think of it like this: imagine a jump rope tied at both ends. What shapes could it make if both ends must stay still?",
  "Real-Life Analogy": "You've seen a guitar string vibrate, right? What do you think happens if you pluck it exactly in the middle versus near one end?",
  "Solve Step-by-Step": "First step: write down what ψ(x) must equal at x=0. What value makes sense there, and why?",
  "Give a Quiz": "Quick one: if n=2, how many nodes (zero points) would you expect between the walls, not counting the walls themselves?",
  "Summarize": "Before I summarize — can you tell me in your own words why energy can't be continuous in this box?",
};

export default function AIProfessorWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "professor", text: "You're doing great! Quantum physics becomes easier when we build intuition first. Ask me anything." },
  ]);
  const [input, setInput] = useState("");

  const respond = (userText: string) => {
    setMessages((m) => [...m, { role: "user", text: userText }]);
    const canned = mockResponses[userText];
    const reply =
      canned ??
      "That's a great question. Instead of the direct answer — what do you already know about how the walls constrain the wave?";
    setTimeout(() => {
      setMessages((m) => [...m, { role: "professor", text: reply }]);
    }, 500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    respond(input.trim());
    setInput("");
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[92vw] max-w-sm glass-panel rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style={{ height: 460 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border gradient-primary">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
                <span className="font-semibold text-sm text-primary-foreground">AI Professor</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "professor"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground ml-auto"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-border">
              {quickActions.map((a) => (
                <button
                  key={a}
                  onClick={() => respond(a)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border bg-card hover:border-primary hover:text-primary transition-colors"
                >
                  {a}
                </button>
              ))}
            </div>

            <div className="p-3 flex items-center gap-2 border-t border-border">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 text-sm bg-muted/50 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={handleSend}
                className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center shadow-2xl"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <GraduationCap className="h-7 w-7 text-primary-foreground" />
      </motion.button>
    </div>
  );
}
