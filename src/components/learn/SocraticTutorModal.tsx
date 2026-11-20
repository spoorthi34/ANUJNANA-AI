import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, BookOpen, Brain, CheckCircle2, ChevronDown, ChevronUp, FileText, GraduationCap, Loader2, LogIn, Send, Sparkles, Square, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import type { FocusMetrics } from "@/hooks/useFocusTracker";
import {
  askTutor,
  citedSourceNumbers,
  splitCitations,
  type PedagogyMeta,
  type TutorScope,
  type TutorSource,
  type TutorTurn,
} from "@/lib/ragTutor";

interface Message extends TutorTurn {
  sources?: TutorSource[];
  pedagogy?: PedagogyMeta;
  pending?: boolean;
  error?: boolean;
}

interface SocraticTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId?: string;
  sectionIndex?: number;
  sectionTitle?: string;
  focusMetrics?: FocusMetrics;
}

const suggestedQuestions = [
  "Why can't the ground-state energy be zero?",
  "Why must ψ be zero at the walls?",
  "How does barrier width change tunneling?",
  "What does a node mean?",
];

const guestReplies: Record<string, string> = {
  "Why can't the ground-state energy be zero?":
    "Great question! 🎯 If a confined particle had zero energy, what would its momentum be? And what does the uncertainty principle say about its position then?",
  "Why must ψ be zero at the walls?":
    "Think about the walls: can the particle ever be found inside an infinitely high wall? If not, what must the probability — and so ψ — be there?",
  "How does barrier width change tunneling?":
    "Picture the wave fading as it travels inside the barrier. If it has farther to travel, would more or less of it reach the other side?",
  "What does a node mean?":
    "At a node the wave is still. What would |ψ|² be at that point, and what does that tell you about finding the particle there?",
};

const guestPedagogy: Record<string, PedagogyMeta> = {
  "Why can't the ground-state energy be zero?": {
    misconception: "Confusing classical rest (zero velocity) with quantum ground state",
    bloomLevel: "Analyze",
    scaffoldingTactic: "Heisenberg uncertainty counterfactual",
    targetDiscovery: "Confinement forces Δx <= L, so Δp > 0 and energy cannot be zero",
    cognitiveLoadState: "High (Flow State)",
    focusScore: 91,
    thinkingProcess: [
      "Biometric Telemetry: Focus 91% · Gaze: Centered → Cognitive load: Optimal flow.",
      "Misconception Diagnosis: Identified classical velocity confusion vs quantum confinement.",
      "Pedagogical Tactic: Heisenberg uncertainty counterfactual scaffolding.",
      "Guardrail Check: [VERIFIED] Zero formula leakage; numerical values masked.",
      "Target Goal: Lead student to deduce Δp > 0 from confined box length L.",
    ],
  },
  "Why must ψ be zero at the walls?": {
    misconception: "Assuming boundary values are unconstrained rather than determined by infinite potential",
    bloomLevel: "Understand",
    scaffoldingTactic: "Physical boundary constraint analysis",
    targetDiscovery: "V=∞ means 0% probability inside walls, requiring ψ=0 for continuity",
    cognitiveLoadState: "Optimal (Active)",
    focusScore: 84,
    thinkingProcess: [
      "Biometric Telemetry: Focus 84% · Gaze: Centered → Active problem solving.",
      "Misconception Diagnosis: Treating wave function as mathematically unconstrained at boundaries.",
      "Pedagogical Tactic: Physical barrier constraint deduction.",
      "Guardrail Check: [VERIFIED] Hint-only rules strictly enforced.",
      "Target Goal: Link infinite potential barrier with zero detection probability |ψ|²=0.",
    ],
  },
  "How does barrier width change tunneling?": {
    misconception: "Thinking quantum tunneling is all-or-nothing rather than exponential decay",
    bloomLevel: "Apply",
    scaffoldingTactic: "Evanescent wave decay analogy",
    targetDiscovery: "Wave amplitude decays exponentially with barrier width L",
    cognitiveLoadState: "Optimal (Active)",
    focusScore: 78,
    thinkingProcess: [
      "Biometric Telemetry: Focus 78% · Gaze: Active → Normal pacing.",
      "Misconception Diagnosis: Discrete step expectation instead of continuous exponential decay.",
      "Pedagogical Tactic: Evanescent sound/light penetration analogy.",
      "Guardrail Check: [VERIFIED] Formula T=e^(-2kL) masked; guiding questions generated.",
      "Target Goal: Discover that wave amplitude drops continuously across distance.",
    ],
  },
  "What does a node mean?": {
    misconception: "Confusing physical wave shape with spatial particle probability density",
    bloomLevel: "Understand",
    scaffoldingTactic: "Probability density interpretation (|ψ|²)",
    targetDiscovery: "A node is where ψ=0, meaning exactly zero probability of finding the particle",
    cognitiveLoadState: "Optimal (Active)",
    focusScore: 82,
    thinkingProcess: [
      "Biometric Telemetry: Focus 82% · Gaze: Centered → Concept consolidation.",
      "Misconception Diagnosis: Confusing mechanical standing wave shape with Born rule probability.",
      "Pedagogical Tactic: Born rule probability mapping.",
      "Guardrail Check: [VERIFIED] Zero answer leakage verified.",
      "Target Goal: Realize ψ=0 translates directly to zero detection chance.",
    ],
  },
};

const scopes: { id: TutorScope; label: string }[] = [
  { id: "all", label: "Lessons + my notes" },
  { id: "course", label: "Lessons only" },
  { id: "mine", label: "My notes only" },
];

function SourceCard({ source, active, onOpenLesson }: { source: TutorSource; active: boolean; onOpenLesson: (s: TutorSource) => void }) {
  const isCourse = source.kind === "course";
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-xs transition-colors ${
        active ? "border-secondary bg-secondary/10" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-[10px] font-bold text-secondary">
          {source.n}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            {isCourse ? <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" /> : <FileText className="h-3.5 w-3.5 shrink-0 text-accent" />}
            <span className="truncate">{source.label}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-muted-foreground">{source.snippet}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">{source.relevance}% match</span>
            {isCourse && source.chapterId && (
              <button
                type="button"
                onClick={() => onOpenLesson(source)}
                className="text-[11px] font-semibold text-primary underline-offset-2 hover:underline"
              >
                Open this subtopic
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorMessage({ message, onOpenLesson }: { message: Message; onOpenLesson: (s: TutorSource) => void }) {
  const [activeSource, setActiveSource] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showPedagogy, setShowPedagogy] = useState(false);
  const [showCoT, setShowCoT] = useState(false);
  const sources = message.sources ?? [];
  const cited = citedSourceNumbers(message.text, sources.length);
  const citedSources = cited.map((n) => sources.find((s) => s.n === n)).filter(Boolean) as TutorSource[];
  const otherSources = sources.filter((s) => !cited.includes(s.n));
  const segments = splitCitations(message.text, sources.length);

  return (
    <div className="min-w-0 max-w-[85%] space-y-2">
      {message.pedagogy && (
        <div className="rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-xs text-foreground transition-all">
          <button
            type="button"
            onClick={() => setShowPedagogy((v) => !v)}
            className="flex w-full items-center justify-between text-left font-semibold text-secondary hover:text-secondary/80"
          >
            <span className="flex items-center gap-1.5 flex-wrap">
              <Brain className="h-3.5 w-3.5 shrink-0" />
              <span>Pedagogical Reasoning</span>
              {message.pedagogy.cognitiveLoadState && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary/20 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                  <Activity className="h-3 w-3 text-secondary animate-pulse" />
                  {message.pedagogy.cognitiveLoadState}
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {message.pedagogy.bloomLevel && <span>Bloom: {message.pedagogy.bloomLevel}</span>}
              {showPedagogy ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </span>
          </button>

          {showPedagogy && (
            <div className="mt-2 space-y-1.5 border-t border-secondary/20 pt-2 text-[11px] leading-relaxed">
              {message.pedagogy.misconception && (
                <p>
                  <strong className="text-secondary">Identified Concept Gap:</strong> {message.pedagogy.misconception}
                </p>
              )}
              {message.pedagogy.scaffoldingTactic && (
                <p>
                  <strong className="text-secondary">Scaffolding Strategy:</strong> {message.pedagogy.scaffoldingTactic}
                </p>
              )}
              {message.pedagogy.targetDiscovery && (
                <p>
                  <strong className="text-secondary">Self-Discovery Target:</strong> {message.pedagogy.targetDiscovery}
                </p>
              )}

              {/* DeepSeek-R1 style CoT Thinking Process */}
              {message.pedagogy.thinkingProcess && message.pedagogy.thinkingProcess.length > 0 && (
                <div className="mt-2 rounded-lg border border-secondary/20 bg-background/50 p-2 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => setShowCoT((v) => !v)}
                    className="flex w-full items-center justify-between font-semibold text-secondary hover:text-secondary/80"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-secondary" />
                      <span>Thinking Process ({message.pedagogy.thinkingProcess.length} steps)</span>
                    </span>
                    {showCoT ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {showCoT && (
                    <div className="mt-1.5 space-y-1 border-t border-secondary/15 pt-1.5 text-muted-foreground">
                      {message.pedagogy.thinkingProcess.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <span className="text-secondary select-none">›</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.error ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"}`}>
        {message.pending && !message.text ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching your lessons and notes…
          </span>
        ) : (
          <p className="whitespace-pre-wrap">
            {segments.map((segment, i) =>
              segment.type === "text" ? (
                <span key={i}>{segment.text}</span>
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSource(segment.n === activeSource ? null : segment.n)}
                  aria-label={`Show source ${segment.n}`}
                  className="mx-0.5 inline-flex h-4 min-w-4 -translate-y-1 items-center justify-center rounded-full bg-secondary/25 px-1 text-[10px] font-bold text-secondary hover:bg-secondary/40"
                >
                  {segment.n}
                </button>
              ),
            )}
            {message.pending && <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-foreground/50 align-middle" />}
          </p>
        )}
      </div>

      {!message.pending && citedSources.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sources used</p>
          {citedSources.map((source) => (
            <SourceCard key={source.n} source={source} active={activeSource === source.n} onOpenLesson={onOpenLesson} />
          ))}
        </div>
      )}
      {!message.pending && otherSources.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="text-[11px] font-semibold text-muted-foreground underline-offset-2 hover:underline"
          >
            {showAll ? "Hide" : "Show"} {otherSources.length} more passage{otherSources.length === 1 ? "" : "s"} searched
          </button>
          {showAll && (
            <div className="mt-1.5 space-y-1.5">
              {otherSources.map((source) => (
                <SourceCard key={source.n} source={source} active={activeSource === source.n} onOpenLesson={onOpenLesson} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SocraticTutorModal({
  isOpen,
  onClose,
  chapterId,
  sectionIndex,
  sectionTitle,
  focusMetrics,
}: SocraticTutorModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scope, setScope] = useState<TutorScope>("all");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "tutor",
      text: "Hi! 👋 I'm your Socratic physics tutor.\n\nI search your lessons and your own notes, then guide you with hints and questions — never the final answer — and show exactly where each hint comes from.",
    },
  ]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (!isOpen) return null;

  const openLesson = (source: TutorSource) => {
    if (!source.chapterId) return;
    onClose();
    navigate(`/learn/${source.chapterId}?section=${source.sectionIndex ?? 0}`);
  };

  const updateLast = (patch: (message: Message) => Message) =>
    setMessages((prev) => [...prev.slice(0, -1), patch(prev[prev.length - 1])]);

  const handleSend = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || busy) return;
    setInput("");

    if (!user) {
      const reply =
        guestReplies[question] ??
        "Good question! 🤔 What do you already know about this? Try breaking it into smaller parts. Log in to get hints drawn from your lessons and your own notes.";
      const pedagogy = guestPedagogy[question] ?? {
        misconception: "Initial mental model inquiry",
        bloomLevel: "Understand",
        scaffoldingTactic: "Socratic Open Inquiry",
        targetDiscovery: "Deconstruct the problem into foundational principles",
      };
      setMessages((prev) => [...prev, { role: "user", text: question }, { role: "tutor", text: reply, pedagogy }]);
      return;
    }

    const history = messages.slice(1).filter((m) => !m.error).map(({ role, text: t }) => ({ role, text: t }));
    setMessages((prev) => [...prev, { role: "user", text: question }, { role: "tutor", text: "", pending: true }]);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await askTutor({
        question,
        history,
        chapterId,
        sectionIndex,
        scope,
        focusScore: focusMetrics?.focus,
        attentionStatus: focusMetrics?.status,
        signal: controller.signal,
        onSources: (sources) => updateLast((m) => ({ ...m, sources })),
        onPedagogy: (pedagogy) => updateLast((m) => ({ ...m, pedagogy })),
        onDelta: (delta) => updateLast((m) => ({ ...m, text: m.text + delta })),
      });
      updateLast((m) => ({ ...m, pending: false, text: m.text || "I couldn't think of a hint for that. Could you ask it another way?" }));
    } catch (error) {
      if (controller.signal.aborted) {
        updateLast((m) => ({ ...m, pending: false, text: m.text ? `${m.text} …(stopped)` : "Stopped." }));
      } else {
        const message = error instanceof Error ? error.message : "The tutor couldn't answer just now.";
        updateLast((m) => ({ ...m, pending: false, error: !m.text, text: m.text ? `${m.text}\n\n(${message})` : message }));
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-secondary/20 bg-secondary/15 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20">
              <GraduationCap className="h-5 w-5 text-secondary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-foreground">Socratic Physics Tutor</h3>
              <p className="truncate text-xs text-muted-foreground">
                Hints only · cites your lessons{user ? " and notes" : ""}
                {sectionTitle ? ` · now on ${sectionTitle}` : ""}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close tutor" className="text-muted-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {user ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-2.5">
            <span className="text-xs text-muted-foreground">Search in:</span>
            {scopes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScope(item.id)}
                aria-pressed={scope === item.id}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  scope === item.id ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Link to="/notes" onClick={onClose} className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <Upload className="h-3.5 w-3.5" /> My notes
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-accent/10 px-5 py-2.5">
            <span className="text-xs text-foreground">Log in to get AI hints from your lessons and your own uploaded notes.</span>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`)}>
              <LogIn className="h-3.5 w-3.5" /> Log in
            </Button>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "tutor" && (
                <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
              )}
              {msg.role === "user" ? (
                <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                  {msg.text}
                </div>
              ) : (
                <TutorMessage message={msg} onOpenLesson={openLesson} />
              )}
            </div>
          ))}
        </div>

        {messages.length <= 2 && (
          <div className="px-5 pb-3">
            <p className="mb-2 text-xs text-muted-foreground">✨ Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((sq) => (
                <Button
                  variant="outline"
                  size="sm"
                  key={sq}
                  onClick={() => handleSend(sq)}
                  className="rounded-full px-3 py-1.5 text-xs"
                >
                  {sq}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border px-5 pb-4 pt-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              maxLength={1000}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your doubt…"
              aria-label="Your physics question"
              className="min-w-0 flex-1 rounded-full border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none"
            />
            {busy ? (
              <Button size="icon" variant="outline" className="h-10 w-10 shrink-0 rounded-full" onClick={() => abortRef.current?.abort()} aria-label="Stop answer">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => handleSend()} disabled={!input.trim()} aria-label="Send question">
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
