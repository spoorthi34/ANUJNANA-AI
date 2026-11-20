import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ArrowRight,
  BellRing,
  Box,
  CalendarClock,
  CheckCircle2,
  Clock,
  PauseCircle,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import QuizModal from "@/components/learn/QuizModal";

const DAY_MS = 86_400_000;
const STAGES = [1, 3, 7, 21, 60];

interface Studied {
  id: string;
  title: string;
  chapter: number;
  icon: typeof Box;
  tone: "course-infinite" | "course-finite" | "course-tunneling";
  daysAgo: number;
  score: number;
  reviews: number;
}

const studied: Studied[] = [
  { id: "ipw", title: "Infinite Potential Well", chapter: 1, icon: Box, tone: "course-infinite", daysAgo: 14, score: 0.95, reviews: 4 },
  { id: "boundary", title: "Boundary Conditions & Wave Functions", chapter: 1, icon: Waves, tone: "course-infinite", daysAgo: 11, score: 0.88, reviews: 3 },
  { id: "energy", title: "Quantized Energy Levels", chapter: 1, icon: Zap, tone: "course-finite", daysAgo: 6, score: 0.72, reviews: 2 },
  { id: "tunnel", title: "Quantum Tunneling", chapter: 3, icon: Zap, tone: "course-tunneling", daysAgo: 3, score: 0.65, reviews: 1 },
  { id: "fpw", title: "Finite Potential Well", chapter: 2, icon: Box, tone: "course-finite", daysAgo: 1, score: 0.98, reviews: 5 },
];

// A stronger quiz score buys a longer review interval and a slower fade.
const intervalFor = (score: number) => Math.max(2, Math.round(2 + score * 12));
const retentionFor = (daysAgo: number, interval: number) =>
  Math.round(100 * Math.exp(-daysAgo / (interval * 1.6)));

const formatDay = (date: Date) =>
  date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

const dayLabel = (daysAgo: number) =>
  daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`;

const settings = [
  { key: "daily", label: "Daily revision reminder", detail: "One nudge each evening", defaultOn: true },
  { key: "email", label: "Weekly email digest", detail: "Your plan for the week ahead", defaultOn: false },
  { key: "sound", label: "Chime when a review is due", detail: "A soft bell, nothing louder", defaultOn: true },
];

const times = ["07:30", "13:00", "19:30", "21:00"];

export default function Revision() {
  const [snoozes, setSnoozes] = useState<Record<string, number>>({});
  const [quizFor, setQuizFor] = useState<string | null>(null);
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(settings.map((s) => [s.key, s.defaultOn])),
  );
  const [time, setTime] = useState("19:30");

  const start = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const items = useMemo(
    () =>
      studied
        .map((topic) => {
          const interval = intervalFor(topic.score);
          const dueIn = interval - topic.daysAgo + (snoozes[topic.id] ?? 0);
          const retention = retentionFor(topic.daysAgo, interval);
          return {
            ...topic,
            interval,
            dueIn,
            retention,
            dueDate: new Date(start + dueIn * DAY_MS),
            overdue: dueIn < 0,
            mastered: retention >= 90,
          };
        })
        .sort((a, b) => a.dueIn - b.dueIn),
    [snoozes, start],
  );

  const featured = items[0];
  const dueNow = items.filter((i) => i.dueIn <= 0).length;
  const dueWeek = items.filter((i) => i.dueIn > 0 && i.dueIn <= 7).length;
  const mastered = items.filter((i) => i.mastered).length;

  const forecast = useMemo(() => {
    const tau = featured.interval * 1.6;
    return Array.from({ length: 21 }, (_, day) => {
      const without = Math.round(100 * Math.exp(-day / tau));
      const withReview =
        day <= featured.daysAgo
          ? without
          : Math.round(98 * Math.exp(-(day - featured.daysAgo) / (tau * 2.4)));
      return { day, without, withReview };
    });
  }, [featured]);

  const stages = STAGES.map((stage) => ({
    stage,
    done: featured.daysAgo >= stage,
  }));

  const openQuiz = items.find((i) => i.id === quizFor);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <BellRing className="h-8 w-8 text-primary" /> Revision Reminders
        </h1>
        <p className="text-muted-foreground mt-1">
          Memory fades on a schedule, so we tell you the day to revisit each topic — before it slips away.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Clock, value: String(dueNow), label: "Due for review", tone: "text-primary bg-primary/10" },
          { icon: CalendarClock, value: String(dueWeek), label: "Coming up this week", tone: "text-accent bg-accent/15" },
          { icon: CheckCircle2, value: String(mastered), label: "Held in long-term memory", tone: "text-secondary bg-secondary/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="glass-card rounded-2xl p-5 flex items-center gap-4 card-hover"
          >
            <span className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${stat.tone}`}>
              <stat.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-2xl font-bold text-foreground font-display leading-none">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">Your review plan</h2>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`${item.tone} rounded-2xl border-2 border-border p-5 card-hover`}
            >
              <div className="flex items-start gap-4">
                <span className="course-tile-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <item.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold leading-snug">
                      Chapter {item.chapter} · {item.title}
                    </h3>
                    {item.mastered && (
                      <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
                        remembered
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last studied {dayLabel(item.daysAgo)} · quiz score {Math.round(item.score * 100)}% ·{" "}
                    {item.reviews} {item.reviews === 1 ? "review" : "reviews"} so far
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={item.retention} className="h-2 flex-1" />
                    <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                      {item.retention}% likely recalled
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        item.dueIn <= 0 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                      }`}
                    >
                      <CalendarClock className="h-3.5 w-3.5" />
                      {item.dueIn <= 0
                        ? `Revision day ${item.dueIn === 0 ? "is today" : `was ${formatDay(item.dueDate)}`}`
                        : `Revision day: ${formatDay(item.dueDate)}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSnoozes((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }))}
                      >
                        <PauseCircle className="mr-1.5 h-4 w-4" />
                        Snooze
                      </Button>
                      <Button variant="hero" size="sm" className="rounded-full" onClick={() => setQuizFor(item.id)}>
                        Review now <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 card-hover"
          >
            <h3 className="font-semibold text-foreground">Memory forecast</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {featured.title} without another look, and what one review today would do.
            </p>
            <ResponsiveContainer width="100%" height={190} className="mt-4">
              <AreaChart data={forecast} margin={{ left: -18, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="fadeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="keepFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  labelFormatter={(d) => `Day ${d}`}
                  formatter={(value: number, key: string) => [
                    `${value}%`,
                    key === "without" ? "Without review" : "If you review today",
                  ]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="without" stroke="hsl(var(--primary))" fill="url(#fadeFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="withReview" stroke="hsl(var(--secondary))" fill="url(#keepFill)" strokeWidth={2} />
                <ReferenceLine x={featured.daysAgo} stroke="hsl(var(--accent))" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Fades without review
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-secondary" /> Stays with a review
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass-card rounded-2xl p-6 card-hover"
          >
            <h3 className="font-semibold text-foreground">How a topic gets locked in</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Each review stretches the gap before the next one, so {featured.title} moves further out every time.
            </p>
            <ol className="mt-5 space-y-4">
              {stages.map((stage, i) => (
                <li key={stage.stage} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      stage.done
                        ? "bg-secondary text-secondary-foreground"
                        : i === stages.findIndex((s) => !s.done)
                          ? "border-2 border-primary text-primary"
                          : "border-2 border-border text-muted-foreground"
                    }`}
                  >
                    {stage.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className="text-sm text-foreground">
                    Day {stage.stage} review
                    <span className="ml-2 text-xs text-muted-foreground">
                      {stage.done ? "done" : i === stages.findIndex((s) => !s.done) ? "next up" : "planned"}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 card-hover"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> Reminder settings
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">Choose when AnuJnana should nudge you.</p>
          </div>
          <div className="flex items-center gap-2">
            {times.map((t) => (
              <Button
                key={t}
                variant={time === t ? "hero" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setTime(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-4 divide-y divide-border">
          {settings.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </div>
              <Switch
                checked={toggles[s.key]}
                onCheckedChange={(on) => setToggles((prev) => ({ ...prev, [s.key]: on }))}
                aria-label={s.label}
              />
            </div>
          ))}
        </div>
      </motion.div>

      <QuizModal isOpen={Boolean(openQuiz)} onClose={() => setQuizFor(null)} />
    </div>
  );
}
