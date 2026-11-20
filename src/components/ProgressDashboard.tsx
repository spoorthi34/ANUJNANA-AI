import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Flame, Award, Zap, CheckCircle2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLearnerProgress } from "@/hooks/useLearnerProgress";
import { UNDATED } from "@/lib/learnerActivity";
import { XP_PER_LEVEL } from "@/lib/progressStats";

function issuedLabel(iso: string | null) {
  if (!iso || iso === UNDATED) return "Completed";
  return `Issued ${new Date(iso).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}`;
}

export function ProgressDashboard() {
  const { summary: p } = useLearnerProgress();
  const completionPct = p.coursePercent;
  const radialData = [{ name: "completion", value: completionPct, fill: "hsl(var(--primary))" }];
  const weeklyData = p.weekly;
  const accuracyTrend = p.quiz.trend;
  const certificates = p.chapters.filter((c) => c.completed);
  const totalSections = p.chapters.reduce((sum, c) => sum + c.sectionCount, 0);
  const sectionsRead = p.chapters.reduce((sum, c) => sum + c.sectionsRead, 0);
  return (
    <div className="space-y-6">
      {/* Top row: completion ring + XP */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center card-hover"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-2 self-start">Course Completion</h3>
          <div className="relative h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="75%"
                outerRadius="100%"
                data={radialData}
                startAngle={90}
                endAngle={90 - 360 * (completionPct / 100)}
              >
                <RadialBar dataKey="value" background cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold gradient-text">{completionPct}%</span>
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{sectionsRead}/{totalSections} subtopics read</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-6 lg:col-span-2 flex flex-col justify-center card-hover"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Level Progress</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-foreground">Level {p.level.level}</span>
                <span className="text-sm text-muted-foreground">{p.level.title} · {p.xp.toLocaleString()} XP</span>
              </div>
            </div>
            <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center animate-float">
              <Zap className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <Progress value={p.level.percent} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{p.level.intoLevel} / {XP_PER_LEVEL} XP this level</span>
            <span>{p.level.toNext} XP to Level {p.level.level + 1}</span>
          </div>
        </motion.div>
      </div>

      {/* Weekly + accuracy charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 card-hover"
        >
          <h3 className="font-semibold text-foreground mb-4">Weekly Learning Minutes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                }}
              />
              <Area type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" fill="url(#weeklyFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6 card-hover"
        >
          <h3 className="font-semibold text-foreground mb-4">Quiz Accuracy Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={accuracyTrend.length ? accuracyTrend : [{ quiz: "—", accuracy: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="quiz" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                }}
              />
              <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Chapter completion + streak heatmap */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 card-hover"
        >
          <h3 className="font-semibold text-foreground mb-4">Chapter Completion</h3>
          <div className="space-y-4">
            {p.chapters.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2 text-foreground">
                    {c.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    {c.title}
                  </span>
                  <span className="text-muted-foreground">{c.sectionsRead}/{c.sectionCount} · {c.percent}%</span>
                </div>
                <Progress value={c.percent} className="h-2" />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-6 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Streak Calendar</h3>
            <span className="flex items-center gap-1 text-sm text-warning font-medium">
              <Flame className="h-4 w-4" /> {p.streak} {p.streak === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {p.heatmap.map(({ day, count, level: lvl }) => (
              <div
                key={day}
                title={`${day}: ${count} ${count === 1 ? "activity" : "activities"}`}
                className={`aspect-square rounded-md ${
                  lvl === 0
                    ? "bg-muted"
                    : lvl === 1
                    ? "bg-primary/25"
                    : lvl === 2
                    ? "bg-primary/55"
                    : "bg-primary"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="h-3 w-3 rounded-sm bg-muted" />
            <div className="h-3 w-3 rounded-sm bg-primary/25" />
            <div className="h-3 w-3 rounded-sm bg-primary/55" />
            <div className="h-3 w-3 rounded-sm bg-primary" />
            <span>More</span>
          </div>
        </motion.div>
      </div>

      {/* Certificates */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6 card-hover"
      >
        <h3 className="font-semibold text-foreground mb-4">Certificates Earned</h3>
        {certificates.length ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {certificates.map((c, i) => (
              <div key={c.id} className={`rounded-xl p-5 flex items-center gap-4 ${i % 2 ? "gradient-accent" : "gradient-primary"}`}>
                <Award className="h-9 w-9 text-primary-foreground shrink-0" />
                <div>
                  <p className="font-semibold text-primary-foreground">{c.title}</p>
                  <p className="text-xs text-primary-foreground/80">{issuedLabel(c.completedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Finish a chapter and press Mark Complete to earn its certificate.</p>
        )}
      </motion.div>

      {/* Badge grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card rounded-2xl p-6 card-hover"
      >
        <h3 className="font-semibold text-foreground mb-4">Badges</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {p.badges.map((b) => (
            <div
              key={b.id}
              title={`${b.description} · ${b.current}/${b.target}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${
                b.unlocked ? "border-primary/30 bg-primary/5" : "border-border opacity-50"
              }`}
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${b.unlocked ? "gradient-primary" : "bg-muted"}`}>
                {b.emoji}
              </div>
              <span className="text-xs text-center text-foreground font-medium">{b.title}</span>
              {!b.unlocked && <span className="text-[11px] text-muted-foreground">{b.current}/{b.target}</span>}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
