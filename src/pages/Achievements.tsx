import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Flame, Brain, Zap, Star, Clock, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AchievementBadge } from "@/components/AchievementBadge";
import { useLearnerProgress } from "@/hooks/useLearnerProgress";
import { UNDATED } from "@/lib/learnerActivity";
import { formatMinutes } from "@/lib/progressStats";

function whenLabel(iso: string) {
  if (iso === UNDATED) return "Earlier";
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (date.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function Achievements() {
  const { summary: p, isGuest } = useLearnerProgress();
  const goal = p.dailyGoal;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" /> Achievements
        </h1>
        <p className="text-muted-foreground mt-1">{p.badgesUnlocked}/{p.badges.length} badges unlocked</p>
        <Progress value={(p.badgesUnlocked / p.badges.length) * 100} className="h-2 mt-3 max-w-sm" />
        {isGuest && (
          <p className="mt-3 text-sm text-muted-foreground">
            You're a guest, so badges are saved on this device only. <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">Log in</Link> to keep them on your account.
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: "XP Points", value: p.xp.toLocaleString(), color: "text-primary" },
          { icon: Star, label: p.level.title, value: `Level ${p.level.level}`, color: "text-accent" },
          { icon: Flame, label: `Daily streak · best ${p.longestStreak}`, value: `${p.streak} ${p.streak === 1 ? "day" : "days"}`, color: "text-destructive" },
          { icon: Clock, label: "Time learned", value: formatMinutes(p.studyMinutes), color: "text-warning" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="glass-card rounded-2xl p-5 text-center card-hover"
          >
            <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {p.badges.map((b, i) => (
          <AchievementBadge
            key={b.id}
            emoji={b.emoji}
            title={b.title}
            description={`${b.description} · ${b.current}/${b.target}`}
            unlocked={b.unlocked}
            progress={b.unlocked ? undefined : b.percent}
            delay={0.05 * i}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 card-hover">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Recent activity
          </h3>
          {p.recent.length ? (
            <div className="space-y-2">
              {p.recent.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                    {item.where && <p className="text-xs text-muted-foreground truncate">{item.where}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{whenLabel(item.at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Nothing yet. Open a chapter, read a subtopic or take a quiz and it will show here.
              <div className="mt-3"><Button asChild size="sm"><Link to="/topics">Start a lesson</Link></Button></div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 gradient-hero flex flex-col justify-between card-hover"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-foreground/90 bg-primary-foreground/15 rounded-full px-3 py-1 mb-3">
              <Brain className="h-3.5 w-3.5" /> Today's goal
            </span>
            <h3 className="text-lg font-bold text-primary-foreground">Read one subtopic and finish one quiz</h3>
            <p className="text-sm text-primary-foreground/80 mt-1">Keeps your streak going and earns points.</p>
          </div>
          <div className="mt-4">
            <Progress value={(goal.done / goal.target) * 100} className="h-2 mb-2" />
            <p className="text-xs text-primary-foreground/80">
              {goal.done}/{goal.target} done today · subtopic {goal.lesson ? "✓" : "—"} · quiz {goal.quiz ? "✓" : "—"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
