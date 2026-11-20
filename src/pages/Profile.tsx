import { motion } from "framer-motion";
import { Sun, Sparkles, User, Trophy, Flame, BookOpen, Clock, Target, Star, Zap, Settings, Bell, Moon, Volume2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { AchievementBadge } from "@/components/AchievementBadge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLearnerProgress } from "@/hooks/useLearnerProgress";
import { formatMinutes } from "@/lib/progressStats";

const settings = [
  { icon: Bell, label: "Push Notifications", defaultOn: true },
  { icon: Moon, label: "Dark Mode", defaultOn: false },
  { icon: Volume2, label: "Sound Effects", defaultOn: true },
];

export default function Profile() {
  const { user, profile, displayName, updateProfile } = useAuth();
  const saveSetting = (patch: { prefers_relax_mode?: boolean; suggest_relax_on_low_focus?: boolean }) =>
    updateProfile(patch).catch(() => toast.error("Couldn't save that setting."));
  const { summary: p } = useLearnerProgress();
  const badgePreview = [...p.badges].sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.percent - a.percent).slice(0, 3);

  const stats = [
    { icon: BookOpen, label: "Chapters Completed", value: `${p.chaptersCompleted}/${p.chapters.length}` },
    { icon: Clock, label: "Total Study Time", value: formatMinutes(p.studyMinutes) },
    { icon: Target, label: "Avg Quiz Accuracy", value: p.quiz.accuracy === null ? "—" : `${p.quiz.accuracy}%` },
    { icon: CheckCircle2, label: "Quiz Passes This Week", value: String(p.quiz.passesThisWeek) },
    { icon: Flame, label: "Current Streak", value: `${p.streak} ${p.streak === 1 ? "day" : "days"}` },
    { icon: Trophy, label: "Badges", value: `${p.badgesUnlocked}/${p.badges.length}` },
    { icon: Star, label: "XP Earned", value: p.xp.toLocaleString() },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="relative h-24 w-24 rounded-full gradient-primary flex items-center justify-center shrink-0 animate-float">
          <User className="h-12 w-12 text-primary-foreground" />
          <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-warning text-warning-foreground text-xs font-bold flex items-center justify-center border-2 border-card">
            {p.level.level}
          </span>
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
          <p className="text-muted-foreground">{user?.email ?? "Browsing as a guest"}</p>
          <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-medium gradient-primary text-primary-foreground">Level {p.level.level} · {p.level.title}</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning flex items-center gap-1">
              <Flame className="h-3 w-3" /> {p.streak}-day streak
            </span>
          </div>
        </div>
        <div className="sm:ml-auto text-center">
          <div className="text-3xl font-bold gradient-text flex items-center gap-1 justify-center">
            <Zap className="h-5 w-5 text-primary" /> {p.xp.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total XP</div>
          <Progress value={p.level.percent} className="h-2 w-32 mt-2" />
          <div className="text-xs text-muted-foreground mt-1">{p.level.toNext} XP to Level {p.level.level + 1}</div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="glass-card rounded-2xl p-5 text-center card-hover"
          >
            <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Badges preview */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Badges
          </h2>
          <Button asChild variant="ghost" size="sm"><Link to="/achievements">See all</Link></Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {badgePreview.map((b, i) => (
            <AchievementBadge key={b.id} emoji={b.emoji} title={b.title} description={b.description} unlocked={b.unlocked} progress={b.unlocked ? undefined : b.percent} delay={0.05 * i} />
          ))}
        </div>
      </div>

      {/* Relax Mode, saved per learner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
          <Sun className="h-5 w-5 text-primary" /> My Relax Mode
        </h2>
        {user && profile ? (
          <div className="divide-y divide-border">
            <label className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm text-foreground">Open lessons in Relax Mode</span>
              <Switch checked={profile.prefers_relax_mode} onCheckedChange={(v) => saveSetting({ prefers_relax_mode: v })} />
            </label>
            <label className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm text-foreground flex items-center gap-2"><Sparkles className="h-4 w-4 text-muted-foreground" />Suggest Relax Mode when the camera sees my focus drop</span>
              <Switch checked={profile.suggest_relax_on_low_focus} onCheckedChange={(v) => saveSetting({ suggest_relax_on_low_focus: v })} />
            </label>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-sm text-muted-foreground">Log in so Relax Mode and your progress are saved for you.</p>
            <Button asChild size="sm"><Link to="/login">Log in</Link></Button>
          </div>
        )}
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 card-hover">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Settings
        </h2>
        <div className="divide-y divide-border">
          {settings.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <s.icon className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="text-sm text-foreground">{s.label}</span>
              </div>
              <Switch defaultChecked={s.defaultOn} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
