import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type MCQQuestion = {
  type: "mcq" | "truefalse";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type FillBlankQuestion = {
  type: "fill";
  question: string;
  answer: string;
  explanation: string;
};

export type MatchQuestion = {
  type: "match";
  question: string;
  pairs: { left: string; right: string }[];
  explanation: string;
};

export type OrderQuestion = {
  type: "order";
  question: string;
  items: string[]; // in scrambled order
  correctOrder: string[];
  explanation: string;
};

export type QuizQuestion = MCQQuestion | FillBlankQuestion | MatchQuestion | OrderQuestion;

interface QuizCardProps {
  question: QuizQuestion;
  onAnswered: (correct: boolean) => void;
}

export function QuizCard({ question, onAnswered }: QuizCardProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // mcq/truefalse state
  const [selected, setSelected] = useState<number | null>(null);
  // fill state
  const [fillValue, setFillValue] = useState("");
  // match state
  const [rightOrder, setRightOrder] = useState<string[]>(() =>
    question.type === "match" ? shuffle(question.pairs.map((p) => p.right)) : []
  );
  const [matches, setMatches] = useState<Record<number, string | null>>({});
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  // order state
  const [order, setOrder] = useState<string[]>(() => (question.type === "order" ? [...question.items] : []));
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const submit = (correct: boolean) => {
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswered(correct);
  };

  const handleMcqSelect = (i: number) => {
    if (submitted) return;
    setSelected(i);
    submit(question.type === "mcq" || question.type === "truefalse" ? i === (question as MCQQuestion).correctIndex : false);
  };

  const handleFillSubmit = () => {
    if (submitted || question.type !== "fill") return;
    const correct = fillValue.trim().toLowerCase() === question.answer.trim().toLowerCase();
    submit(correct);
  };

  const handleRightClick = (right: string) => {
    if (submitted) return;
    setSelectedRight(right);
  };

  const handleLeftClick = (leftIndex: number) => {
    if (submitted || !selectedRight || question.type !== "match") return;
    setMatches((m) => ({ ...m, [leftIndex]: selectedRight }));
    setSelectedRight(null);
  };

  const handleMatchSubmit = () => {
    if (question.type !== "match" || submitted) return;
    const correct = question.pairs.every((p, i) => matches[i] === p.right);
    submit(correct);
  };

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDrop = (i: number) => {
    if (dragIndex === null || submitted) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIndex(null);
  };
  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= order.length || submitted) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleOrderSubmit = () => {
    if (question.type !== "order" || submitted) return;
    const correct = order.every((v, i) => v === question.correctOrder[i]);
    submit(correct);
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in-up">
      <h2 className="text-lg font-semibold text-foreground mb-6">{question.question}</h2>

      {(question.type === "mcq" || question.type === "truefalse") && (
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const showResult = submitted;
            const correct = i === question.correctIndex;
            const isSelected = selected === i;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMcqSelect(i)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center gap-3 text-foreground ${
                  showResult && correct
                    ? "border-success bg-success/10"
                    : showResult && isSelected && !correct
                    ? "border-destructive bg-destructive/10"
                    : isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <span className="h-7 w-7 rounded-full border flex items-center justify-center text-xs font-medium shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {showResult && correct && <CheckCircle2 className="h-5 w-5 text-success" />}
                {showResult && isSelected && !correct && <XCircle className="h-5 w-5 text-destructive" />}
              </motion.button>
            );
          })}
        </div>
      )}

      {question.type === "fill" && (
        <div className="space-y-4">
          <Input
            value={fillValue}
            onChange={(e) => setFillValue(e.target.value)}
            disabled={submitted}
            placeholder="Type your answer..."
            className={`text-base ${
              submitted ? (isCorrect ? "border-success" : "border-destructive") : ""
            }`}
          />
          {!submitted && (
            <Button variant="hero" onClick={handleFillSubmit} disabled={!fillValue.trim()}>
              Submit Answer
            </Button>
          )}
          {submitted && (
            <p className="text-sm text-muted-foreground">
              Correct answer: <span className="font-semibold text-foreground">{question.answer}</span>
            </p>
          )}
        </div>
      )}

      {question.type === "match" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {question.pairs.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleLeftClick(i)}
                  disabled={submitted}
                  className={`w-full p-3 rounded-xl border text-sm text-left text-foreground transition-all ${
                    submitted
                      ? matches[i] === p.right
                        ? "border-success bg-success/10"
                        : "border-destructive bg-destructive/10"
                      : matches[i]
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {p.left} {matches[i] ? `→ ${matches[i]}` : ""}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {rightOrder.map((r, i) => {
                const used = Object.values(matches).includes(r);
                return (
                  <button
                    key={i}
                    onClick={() => handleRightClick(r)}
                    disabled={submitted || used}
                    className={`w-full p-3 rounded-xl border text-sm text-foreground transition-all ${
                      selectedRight === r
                        ? "border-primary bg-primary/10"
                        : used
                        ? "border-border opacity-40"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
          {!submitted && (
            <Button
              variant="hero"
              onClick={handleMatchSubmit}
              disabled={Object.keys(matches).length !== question.pairs.length}
            >
              Submit Matches
            </Button>
          )}
        </div>
      )}

      {question.type === "order" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Drag or use arrows to arrange the energy levels in increasing order.</p>
          <div className="space-y-2">
            {order.map((item, i) => (
              <div
                key={item}
                draggable={!submitted}
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm text-foreground bg-card ${
                  submitted
                    ? item === question.correctOrder[i]
                      ? "border-success bg-success/10"
                      : "border-destructive bg-destructive/10"
                    : "border-border"
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="flex-1">{item}</span>
                {!submitted && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveItem(i, i - 1)}
                      className="h-6 w-6 rounded-md border border-border text-xs hover:bg-muted"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveItem(i, i + 1)}
                      className="h-6 w-6 rounded-md border border-border text-xs hover:bg-muted"
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {!submitted && (
            <Button variant="hero" onClick={handleOrderSubmit}>
              Submit Order
            </Button>
          )}
        </div>
      )}

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div
              className={`rounded-xl p-4 flex items-start gap-3 ${
                isCorrect ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              )}
              <p className={`text-sm font-medium ${isCorrect ? "text-success" : "text-destructive"}`}>
                {isCorrect ? "Correct! Well done." : "Not quite right."}
              </p>
            </div>
            <div className="mt-3 rounded-xl p-4 bg-primary/5 border border-primary/20 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-primary mb-1">AI explains why</p>
                <p className="text-sm text-foreground leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
