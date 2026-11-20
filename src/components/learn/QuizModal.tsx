import { useState, useMemo, useEffect } from "react";
import { X, ChevronRight, CheckCircle2, XCircle, Calendar, Mail, BarChart3, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRecordActivity } from "@/hooks/useLearnerProgress";
import type { LessonQuizQuestion } from "@/lib/lessonData";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRelaxMode?: boolean;
  chapterId?: string;
  questions?: LessonQuizQuestion[];
}

const defaultQuestions: QuizQuestion[] = [
  {
    question: "What is an infinite potential well?",
    options: [
      "A well with no bottom",
      "A box with infinitely high walls",
      "A well with finite depth",
      "A circular container",
    ],
    correctIndex: 1,
  },
  {
    question: "What must the wave function equal at the walls?",
    options: [
      "Maximum value",
      "Infinity",
      "Zero",
      "One",
    ],
    correctIndex: 2,
  },
  {
    question: "What is the lowest energy state called?",
    options: [
      "Rest energy",
      "Zero-point energy",
      "Thermal energy",
      "Kinetic energy",
    ],
    correctIndex: 1,
  },
  {
    question: "How do energy levels grow with quantum number n?",
    options: [
      "Linearly (n)",
      "As n-squared (n²)",
      "As square root of n",
      "They stay constant",
    ],
    correctIndex: 1,
  },
  {
    question: "What determines the allowed wave patterns?",
    options: [
      "Temperature",
      "Color of the box",
      "Boundary conditions",
      "Gravity",
    ],
    correctIndex: 2,
  },
];

export default function QuizModal({ isOpen, onClose, isRelaxMode, chapterId = "infinite-potential-well", questions = defaultQuestions }: QuizModalProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const record = useRecordActivity();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  }, [isOpen, chapterId]);

  if (!isOpen) return null;

  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      void record({ kind: "quiz", chapterId, score, total: questions.length });
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  const letters = ["A", "B", "C", "D"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div role="dialog" aria-modal="true" aria-label="Practice quiz" className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">
              Question {currentQ + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close quiz" className="text-muted-foreground">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted h-2">
          <div
            className="bg-primary h-2 transition-all duration-500 rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question dots */}
        <div className="flex justify-center gap-2 py-3">
        {questions.map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full transition-all ${
                i === currentQ
                  ? "bg-primary scale-125"
                  : i < currentQ
                  ? "bg-secondary"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {finished ? (
          /* Results with Memory Prediction */
          (() => {
            const scorePercent = Math.round((score / questions.length) * 100);
            const retentionDays = Math.max(3, Math.round(scorePercent / 10) + 2);
            const reminderDate = new Date();
            reminderDate.setDate(reminderDate.getDate() + retentionDays);

            return (
              <div className="px-6 py-6 overflow-y-auto max-h-[70vh]">
                {/* Memory Prediction */}
                <div className="bg-gradient-to-b from-primary/10 to-accent/5 rounded-2xl p-6 text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Memory Prediction</h3>
                  </div>
                <p className="text-sm text-muted-foreground mb-3">
                    Based on this quiz score, consider revisiting this topic in:
                  </p>
                  <p className="text-5xl font-bold text-primary mb-1">{retentionDays} days</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Reminder on {reminderDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                {/* Local progress notice */}
                <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 mb-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Weekly quiz progress saved</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This result is saved in this browser and counts toward this week’s passed quizzes when your score is at least 4 out of 5.
                    </p>
                  </div>
                </div>

                {/* Performance Breakdown */}
                <div className="bg-card border border-border rounded-xl p-5 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <h4 className="font-bold text-sm text-foreground">Performance Breakdown</h4>
                  </div>
                  <Separator className="mb-3" />
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quiz Type:</span>
                      <span className="font-semibold text-foreground">Completed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Score:</span>
                      <span className="font-semibold text-primary">{scorePercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retention Prediction:</span>
                      <span className="font-semibold text-foreground">{retentionDays} days</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <Button onClick={onClose} className="w-full rounded-full bg-primary text-primary-foreground mb-3 py-5">
                  Continue to Next Subtopic <ChevronDown className="h-4 w-4 ml-1.5" />
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleRestart} className="flex-1 rounded-full">
                    <RotateCcw className="h-4 w-4 mr-1.5" /> Retake Quiz
                  </Button>
                  <Button variant="outline" onClick={onClose} className="flex-1 rounded-full">
                    Dashboard
                  </Button>
                </div>

                {/* Motivational quote */}
                <p className="text-xs text-muted-foreground text-center mt-4 italic">
                  💬 Every expert was once a beginner. Keep practicing and you'll master this!
                </p>
              </div>
            );
          })()
        ) : (
          /* Question content */
          <div className="px-8 py-6">
            <div className="mb-6">
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                {isRelaxMode ? "Easy Quiz" : "Quiz"}
              </span>
              <h3 className="text-xl font-bold text-foreground">{q.question}</h3>
            </div>

            <div className="space-y-3">
              {q.options.map((opt, i) => {
                let borderColor = "border-border";
                let bg = "bg-muted/40";

                if (answered) {
                  if (i === q.correctIndex) {
                    borderColor = "border-secondary";
                    bg = "bg-secondary/10";
                  } else if (i === selected && i !== q.correctIndex) {
                    borderColor = "border-destructive";
                    bg = "bg-destructive/10";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 ${borderColor} ${bg} text-left transition-all ${
                      !answered ? "hover:border-primary hover:bg-primary/5 cursor-pointer" : ""
                    }`}
                  >
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      answered && i === q.correctIndex
                        ? "bg-secondary text-secondary-foreground"
                        : answered && i === selected
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {answered && i === q.correctIndex ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : answered && i === selected ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        letters[i]
                      )}
                    </span>
                    <span className="text-sm text-foreground">{opt}</span>
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleNext} className="rounded-full bg-primary text-primary-foreground">
                  {currentQ < questions.length - 1 ? (
                    <>Next Question <ChevronRight className="h-4 w-4 ml-1" /></>
                  ) : (
                    "See Results"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
