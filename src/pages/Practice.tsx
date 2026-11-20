import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { Brain, RotateCcw, ArrowRight, Trophy, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuizCard, type QuizQuestion } from "@/components/quiz/QuizCard";

const questions: QuizQuestion[] = [
  {
    type: "mcq",
    question: "For a particle in an infinite potential well of width L, the allowed energy levels are proportional to:",
    options: ["n", "n²", "1/n", "√n"],
    correctIndex: 1,
    explanation:
      "The energy eigenvalues are Eₙ = n²π²ℏ²/(2mL²), so allowed energies scale with n², not linearly — this comes directly from the boundary conditions ψ(0)=ψ(L)=0.",
  },
  {
    type: "truefalse",
    question: "True or False: The wavefunction of a particle in an infinite square well must be zero at the walls.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "Since the potential is infinite outside the well, the particle cannot exist there, forcing ψ(0) = ψ(L) = 0 as a boundary condition.",
  },
  {
    type: "fill",
    question: "Fill in the blank: The ground state (n = 1) energy of an infinite well is never ____ because of the uncertainty principle.",
    answer: "zero",
    explanation:
      "A zero ground-state energy would mean the particle is perfectly at rest with a definite position, violating the Heisenberg uncertainty principle. Hence E₁ > 0.",
  },
  {
    type: "match",
    question: "Match each quantum number n to its correct relative energy level (E ∝ n²):",
    pairs: [
      { left: "n = 1", right: "E = E₀" },
      { left: "n = 2", right: "E = 4E₀" },
      { left: "n = 3", right: "E = 9E₀" },
    ],
    explanation:
      "Since Eₙ = n²E₁, the energies grow quadratically: n=1 gives E₁, n=2 gives 4E₁, and n=3 gives 9E₁.",
  },
  {
    type: "order",
    question: "Drag the energy levels of the infinite well into increasing order of energy.",
    items: ["E₄ (n=4)", "E₁ (n=1)", "E₃ (n=3)", "E₂ (n=2)"],
    correctOrder: ["E₁ (n=1)", "E₂ (n=2)", "E₃ (n=3)", "E₄ (n=4)"],
    explanation:
      "Because Eₙ ∝ n², energy strictly increases with the quantum number n: E₁ < E₂ < E₃ < E₄.",
  },
];

export default function Practice() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const score = answers.filter(Boolean).length;
  const answeredForCurrent = answers.length > current;

  const handleAnswered = (correct: boolean) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = correct;
      return next;
    });
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrent(0);
    setAnswers([]);
    setFinished(false);
    setReviewMode(false);
  };

  const reviewMistakes = () => {
    setReviewMode(true);
    setFinished(false);
    setCurrent(0);
    setAnswers([]);
  };

  const mistakesCount = questions.length - score;

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const radialData = [{ name: "acc", value: pct, fill: "hsl(var(--primary))" }];
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 sm:p-10 text-center max-w-md w-full"
        >
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-float">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-6">Infinite Potential Well</p>

          <div className="relative h-40 w-40 mx-auto mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="75%" outerRadius="100%" data={radialData} startAngle={90} endAngle={90 - 360 * (pct / 100)}>
                <RadialBar dataKey="value" background cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold gradient-text">
                {score} / {questions.length}
              </span>
              <span className="text-xs text-muted-foreground">{pct}% accuracy</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {mistakesCount > 0 && (
              <Button variant="outline" onClick={reviewMistakes}>
                <ListChecks className="h-4 w-4 mr-2" /> Review Mistakes
              </Button>
            )}
            <Button variant="outline" onClick={restart}>
              <RotateCcw className="h-4 w-4 mr-2" /> Retry
            </Button>
            <Button variant="hero" onClick={restart}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Quiz: Infinite Potential Well
            {reviewMode && <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">Review</span>}
          </h1>
          <span className="text-sm text-muted-foreground">
            {current + 1}/{questions.length}
          </span>
        </div>
        <Progress value={((current + 1) / questions.length) * 100} className="h-2" />
      </div>

      <QuizCard key={current} question={questions[current]} onAnswered={handleAnswered} />

      {answeredForCurrent && (
        <div className="flex justify-end">
          <Button onClick={next} variant="hero">
            {current < questions.length - 1 ? "Next Question" : "See Results"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
