import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Brain, CheckCircle2, Clock3, Flame, Play, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { useLearnerProgress } from "@/hooks/useLearnerProgress";
import { formatMinutes } from "@/lib/progressStats";

const lessonLook: Record<string, { subtitle: string; tone: string }> = {
  "infinite-potential-well": { subtitle: "Standing waves and quantized energy", tone: "bg-primary/10" },
  "finite-potential-well": { subtitle: "Discover quantum leakage", tone: "bg-secondary/10" },
  "quantum-tunneling": { subtitle: "Explore particles crossing barriers", tone: "bg-accent/15" },
};

export default function Dashboard() {
  const { displayName } = useAuth();
  const { summary: p } = useLearnerProgress();
  const lessons = p.chapters.map((c) => ({ ...c, ...(lessonLook[c.id] ?? { subtitle: "", tone: "bg-muted" }) }));
  const nextLesson = lessons.find((l) => !l.completed) ?? lessons[0];
  const stats = [
    { icon: Flame, label: "Learning streak", value: `${p.streak} ${p.streak === 1 ? "day" : "days"}`, tone: "bg-accent/15 text-accent-foreground" },
    { icon: Trophy, label: `Experience · Level ${p.level.level}`, value: `${p.xp.toLocaleString()} XP`, tone: "bg-primary/15 text-primary" },
    { icon: BookOpen, label: "Chapters", value: `${p.chaptersCompleted}/${p.chapters.length}`, tone: "bg-secondary/15 text-secondary" },
    { icon: Clock3, label: "Time learned", value: formatMinutes(p.studyMinutes), tone: "bg-muted text-foreground" },
    { icon: CheckCircle2, label: "Quiz passes this week", value: String(p.quiz.passesThisWeek), tone: "bg-secondary/15 text-secondary" },
  ];
  const goal = p.dailyGoal;
  const goalText = goal.done === goal.target
    ? "Today's goal is done — great work!"
    : goal.lesson ? "You've read today. Finish one quiz to complete the goal."
    : goal.quiz ? "Quiz done. Read one subtopic to complete the goal."
    : "Read one subtopic and finish one quiz today.";
  return (
    <div className="mx-auto max-w-7xl space-y-7 p-5 md:p-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-primary/10 px-6 py-7 md:px-9"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-bold text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> Your adaptive learning space
          </div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Welcome back, {displayName.split(" ")[0]}!</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            {p.hasActivity
              ? `You're ${p.coursePercent}% through the course. Continue where you stopped, or explore a new chapter.`
              : "Your first quantum idea is ready. Open a chapter to start earning points and badges."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="hero" className="rounded-full">
              <Link to={`/learn/${nextLesson.id}`}><Play className="h-4 w-4" /> Continue learning</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-card">
              <Link to="/topics"><BookOpen className="h-4 w-4" /> View all topics</Link>
            </Button>
          </div>
        </div>
        <div className="absolute -bottom-16 -right-10 h-44 w-44 rounded-full border-[18px] border-secondary/20" />
        <div className="absolute right-24 top-6 h-16 w-16 rounded-full border-[10px] border-accent/30" />
      </motion.section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${stat.tone}`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.8fr)]">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Continue learning</p>
              <h2 className="text-2xl font-bold text-foreground">Your quantum journey</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/topics">All chapters <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <Link
                to={`/learn/${lesson.id}`}
                key={lesson.id}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${lesson.tone}`}>
                  <span className="text-xl font-bold text-foreground">0{index + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-foreground">{lesson.title}</h3>
                      <p className="text-sm text-muted-foreground">{lesson.subtitle}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={lesson.percent} className="h-2 flex-1" />
                    <span className="text-xs font-bold text-foreground">
                      {lesson.completed ? "Done" : `${lesson.sectionsRead}/${lesson.sectionCount}`} · {lesson.percent}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-secondary/10 p-5">
            <Brain className="mb-4 h-8 w-8 text-secondary" />
            <h2 className="text-lg font-bold text-foreground">Your learning pulse</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {p.quiz.attempts
                ? `Based on your ${p.quiz.attempts} ${p.quiz.attempts === 1 ? "quiz" : "quizzes"} so far.`
                : "Take a quiz to see how well the ideas are sticking."}
            </p>
            <div className="mt-4 rounded-xl bg-card p-3">
              <div className="flex justify-between text-xs"><span>Quiz accuracy</span><strong>{p.quiz.accuracy === null ? "—" : `${p.quiz.accuracy}%`}</strong></div>
              <Progress value={p.quiz.accuracy ?? 0} className="mt-2 h-2" />
              <Button asChild variant="outline" size="sm" className="mt-3 w-full rounded-full">
                <Link to="/revision">See revision plan <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-accent/15 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-foreground">Daily goal</p>
            <p className="mt-2 text-lg font-bold text-foreground">One lesson, one quiz</p>
            <p className="mt-1 text-sm text-muted-foreground">{goalText}</p>
            <Progress value={(goal.done / goal.target) * 100} className="mt-3 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">{goal.done}/{goal.target} done today</p>
          </div>
        </aside>
      </section>
    </div>
  );
}