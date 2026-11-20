/**
 * Pure progress rules: points, levels, streaks, badges and chart data are all
 * computed from a learner's activity log, so every learner sees their own numbers.
 */
export type ActivityKind = "section_read" | "lesson_complete" | "quiz" | "game" | "story" | "video" | "study";

export interface LearningActivity {
  kind: ActivityKind;
  chapterId: string | null;
  sectionIndex: number | null;
  score: number | null;
  total: number | null;
  durationSeconds: number;
  createdAt: string;
}

export interface ChapterInfo { id: string; title: string; sectionCount: number }

export const XP_RULES = {
  /** First time a subtopic is read. */
  sectionRead: 10,
  /** First time a chapter is marked complete. */
  chapterComplete: 100,
  /** Per correct answer, counting each chapter's best quiz only. */
  quizCorrect: 5,
  /** Once per chapter, the first time its quiz is passed. */
  quizPass: 20,
  /** Per finished game, up to GAMES_PER_DAY games a day. */
  gameFinished: 15,
  /** First story listen per chapter. */
  story: 5,
  /** First video watched per subtopic. */
  video: 5,
} as const;
export const GAMES_PER_DAY = 3;
export const XP_PER_LEVEL = 500;
export const QUIZ_PASS_RATIO = 0.8;

export const quizPassed = (score: number, total: number) => total > 0 && score >= Math.ceil(total * QUIZ_PASS_RATIO);

/** Local calendar day, e.g. "2026-11-17". */
export function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
const toDay = (iso: string) => dayKey(new Date(iso));
const addDays = (date: Date, days: number) => { const next = new Date(date); next.setDate(next.getDate() + days); return next; };

export function computeXp(activities: LearningActivity[]) {
  const read = new Set<string>();
  const done = new Set<string>();
  const stories = new Set<string>();
  const videos = new Set<string>();
  const bestQuiz = new Map<string, number>();
  const passedQuiz = new Set<string>();
  const gamesPerDay = new Map<string, number>();
  let xp = 0;
  for (const a of activities) {
    const chapter = a.chapterId ?? "general";
    if (a.kind === "section_read" && a.sectionIndex !== null) {
      const key = `${chapter}:${a.sectionIndex}`;
      if (!read.has(key)) { read.add(key); xp += XP_RULES.sectionRead; }
    } else if (a.kind === "lesson_complete") {
      if (!done.has(chapter)) { done.add(chapter); xp += XP_RULES.chapterComplete; }
    } else if (a.kind === "quiz" && a.total) {
      const score = Math.min(a.score ?? 0, a.total);
      bestQuiz.set(chapter, Math.max(bestQuiz.get(chapter) ?? 0, score));
      if (quizPassed(score, a.total)) passedQuiz.add(chapter);
    } else if (a.kind === "game") {
      const day = toDay(a.createdAt);
      const count = gamesPerDay.get(day) ?? 0;
      if (count < GAMES_PER_DAY) xp += XP_RULES.gameFinished;
      gamesPerDay.set(day, count + 1);
    } else if (a.kind === "story") {
      if (!stories.has(chapter)) { stories.add(chapter); xp += XP_RULES.story; }
    } else if (a.kind === "video") {
      const key = `${chapter}:${a.sectionIndex ?? 0}`;
      if (!videos.has(key)) { videos.add(key); xp += XP_RULES.video; }
    }
  }
  for (const best of bestQuiz.values()) xp += best * XP_RULES.quizCorrect;
  xp += passedQuiz.size * XP_RULES.quizPass;
  return xp;
}

const LEVEL_TITLES = ["New Explorer", "Wave Watcher", "Quantum Apprentice", "Well Navigator", "Tunnel Runner", "Pro Learner"];

export function levelFor(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const intoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1],
    intoLevel,
    toNext: XP_PER_LEVEL - intoLevel,
    percent: Math.round((intoLevel / XP_PER_LEVEL) * 100),
  };
}

/** Days in a row with any learning, counting back from today (or from yesterday if today is still empty). */
export function currentStreak(activities: LearningActivity[], now = new Date()) {
  const days = new Set(activities.map((a) => toDay(a.createdAt)));
  let cursor = days.has(dayKey(now)) ? now : addDays(now, -1);
  let streak = 0;
  while (days.has(dayKey(cursor))) { streak += 1; cursor = addDays(cursor, -1); }
  return streak;
}

export function longestStreak(activities: LearningActivity[]) {
  const days = [...new Set(activities.map((a) => toDay(a.createdAt)))].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of days) {
    const [y, m, d] = day.split("-").map(Number);
    run = previous && dayKey(addDays(new Date(y, m - 1, d), -1)) === previous ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}

export const studyMinutes = (activities: LearningActivity[]) =>
  Math.floor(activities.filter((a) => a.kind === "study").reduce((sum, a) => sum + a.durationSeconds, 0) / 60);

export function formatMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function startOfWeek(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

/** Minutes studied on each day of the current Monday-to-Sunday week. */
export function weeklyMinutes(activities: LearningActivity[], now = new Date()) {
  const start = startOfWeek(now);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((day, i) => {
    const key = dayKey(addDays(start, i));
    const seconds = activities.filter((a) => a.kind === "study" && toDay(a.createdAt) === key).reduce((s, a) => s + a.durationSeconds, 0);
    return { day, minutes: Math.round(seconds / 60) };
  });
}

/** Activity count per day for the last `days` days, oldest first, as 0–3 heat levels. */
export function activityHeatmap(activities: LearningActivity[], days = 42, now = new Date()) {
  const counts = new Map<string, number>();
  for (const a of activities) {
    if (a.kind === "study") continue;
    const key = toDay(a.createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from({ length: days }, (_, i) => {
    const key = dayKey(addDays(now, i - days + 1));
    const count = counts.get(key) ?? 0;
    return { day: key, count, level: count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : 3 };
  });
}

export function quizStats(activities: LearningActivity[], now = new Date()) {
  const quizzes = activities.filter((a) => a.kind === "quiz" && (a.total ?? 0) > 0);
  const questions = quizzes.reduce((s, a) => s + (a.total ?? 0), 0);
  const correct = quizzes.reduce((s, a) => s + Math.min(a.score ?? 0, a.total ?? 0), 0);
  const weekStart = startOfWeek(now).getTime();
  const weekEnd = addDays(startOfWeek(now), 7).getTime();
  return {
    attempts: quizzes.length,
    accuracy: questions ? Math.round((correct / questions) * 100) : null,
    passesThisWeek: quizzes.filter((a) => {
      const t = Date.parse(a.createdAt);
      return t >= weekStart && t < weekEnd && quizPassed(a.score ?? 0, a.total ?? 0);
    }).length,
    perfect: quizzes.filter((a) => a.score === a.total).length,
    trend: quizzes.slice(-7).map((a, i) => ({ quiz: `Q${i + 1}`, accuracy: Math.round(((a.score ?? 0) / (a.total ?? 1)) * 100) })),
  };
}

export function chapterProgress(chapters: ChapterInfo[], activities: LearningActivity[]) {
  return chapters.map((chapter) => {
    const read = new Set(
      activities.filter((a) => a.kind === "section_read" && a.chapterId === chapter.id && a.sectionIndex !== null).map((a) => a.sectionIndex),
    ).size;
    const completion = activities.find((a) => a.kind === "lesson_complete" && a.chapterId === chapter.id);
    const completed = Boolean(completion);
    return {
      ...chapter,
      sectionsRead: Math.min(read, chapter.sectionCount),
      completed,
      completedAt: completion?.createdAt ?? null,
      percent: completed ? 100 : Math.round((Math.min(read, chapter.sectionCount) / chapter.sectionCount) * 100),
    };
  });
}

export interface Badge { id: string; emoji: string; title: string; description: string; current: number; target: number; unlocked: boolean; percent: number }

export function computeBadges(chapters: ChapterInfo[], activities: LearningActivity[]): Badge[] {
  const progress = chapterProgress(chapters, activities);
  const quiz = quizStats(activities);
  const totalSections = chapters.reduce((s, c) => s + c.sectionCount, 0);
  const sectionsRead = progress.reduce((s, c) => s + c.sectionsRead, 0);
  const best = longestStreak(activities);
  const firstChapter = progress[0];
  const firstQuizPassed = activities.some((a) => a.kind === "quiz" && a.chapterId === firstChapter?.id && quizPassed(a.score ?? 0, a.total ?? 0));
  const defs: Omit<Badge, "unlocked" | "percent">[] = [
    { id: "first-chapter", emoji: "🏆", title: "First Quantum Chapter", description: "Complete your first chapter", current: progress.filter((c) => c.completed).length, target: 1 },
    { id: "streak-3", emoji: "✨", title: "3-Day Streak", description: "Learn three days in a row", current: best, target: 3 },
    { id: "streak-7", emoji: "🔥", title: "7-Day Streak", description: "Learn every day for a week", current: best, target: 7 },
    { id: "quiz-master", emoji: "🧠", title: "Quiz Master", description: "Score 100% on 5 quizzes", current: quiz.perfect, target: 5 },
    { id: "audio-learner", emoji: "🎧", title: "Audio Learner", description: "Listen to 10 stories or audio summaries", current: activities.filter((a) => a.kind === "story").length, target: 10 },
    { id: "well-wizard", emoji: "⚛️", title: "Well Wizard", description: `Complete ${firstChapter?.title ?? "the first chapter"} and pass its quiz`, current: (firstChapter?.completed ? 1 : 0) + (firstQuizPassed ? 1 : 0), target: 2 },
    { id: "explorer", emoji: "🧭", title: "Explorer", description: `Read all ${totalSections} subtopics`, current: sectionsRead, target: totalSections },
    { id: "game-player", emoji: "🎮", title: "Game Player", description: "Finish 5 games", current: activities.filter((a) => a.kind === "game").length, target: 5 },
  ];
  return defs.map((b) => {
    const current = Math.min(b.current, b.target);
    return { ...b, current, unlocked: current >= b.target, percent: Math.round((current / b.target) * 100) };
  });
}

/** Today's goal: read one subtopic and finish one quiz. */
export function dailyGoal(activities: LearningActivity[], now = new Date()) {
  const today = dayKey(now);
  const todays = activities.filter((a) => toDay(a.createdAt) === today);
  const lesson = todays.some((a) => a.kind === "section_read" || a.kind === "lesson_complete");
  const quiz = todays.some((a) => a.kind === "quiz");
  return { lesson, quiz, done: (lesson ? 1 : 0) + (quiz ? 1 : 0), target: 2 };
}

const ACTIVITY_LABELS: Record<ActivityKind, string> = {
  section_read: "Read a subtopic",
  lesson_complete: "Completed a chapter",
  quiz: "Finished a quiz",
  game: "Finished a game",
  story: "Listened to a story",
  video: "Watched a video",
  study: "Studied",
};

export function recentActivity(activities: LearningActivity[], chapters: ChapterInfo[], limit = 6) {
  return activities
    .filter((a) => a.kind !== "study")
    .slice()
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit)
    .map((a) => {
      const chapter = chapters.find((c) => c.id === a.chapterId);
      const detail = a.kind === "quiz" && a.total ? ` — ${a.score ?? 0}/${a.total}` : a.kind === "game" && a.total ? ` — ${a.score ?? 0}/${a.total} points` : "";
      return { label: `${ACTIVITY_LABELS[a.kind]}${detail}`, where: chapter?.title ?? null, at: a.createdAt };
    });
}

export function summarize(chapters: ChapterInfo[], activities: LearningActivity[], now = new Date()) {
  const xp = computeXp(activities);
  const chaptersList = chapterProgress(chapters, activities);
  const badges = computeBadges(chapters, activities);
  return {
    xp,
    level: levelFor(xp),
    streak: currentStreak(activities, now),
    longestStreak: longestStreak(activities),
    studyMinutes: studyMinutes(activities),
    weekly: weeklyMinutes(activities, now),
    heatmap: activityHeatmap(activities, 42, now),
    quiz: quizStats(activities, now),
    chapters: chaptersList,
    chaptersCompleted: chaptersList.filter((c) => c.completed).length,
    coursePercent: chaptersList.length ? Math.round(chaptersList.reduce((sum, c) => sum + c.percent, 0) / chaptersList.length) : 0,
    badges,
    badgesUnlocked: badges.filter((b) => b.unlocked).length,
    dailyGoal: dailyGoal(activities, now),
    recent: recentActivity(activities, chapters),
    hasActivity: activities.length > 0,
  };
}
export type ProgressSummary = ReturnType<typeof summarize>;
