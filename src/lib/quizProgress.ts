export const QUIZ_PASS_THRESHOLD = 0.8;
const STORAGE_KEY = "anujnana-quiz-attempts";

export interface QuizAttempt {
  chapterId: string;
  score: number;
  total: number;
  passed: boolean;
  completedAt: string;
}

export function didPassQuiz(score: number, total: number): boolean {
  return total > 0 && score >= Math.ceil(total * QUIZ_PASS_THRESHOLD);
}

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

export function countQuizPassesThisWeek(attempts: QuizAttempt[], now = new Date()): number {
  const start = startOfWeek(now).getTime();
  const next = new Date(start);
  next.setDate(next.getDate() + 7);
  const end = next.getTime();
  return attempts.filter((attempt) => {
    const completed = Date.parse(attempt.completedAt);
    return attempt.passed && Number.isFinite(completed) && completed >= start && completed < end;
  }).length;
}

export function readQuizAttempts(): QuizAttempt[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is QuizAttempt =>
      typeof item?.chapterId === "string" &&
      typeof item?.score === "number" &&
      typeof item?.total === "number" &&
      typeof item?.passed === "boolean" &&
      typeof item?.completedAt === "string",
    );
  } catch {
    return [];
  }
}

export function recordQuizAttempt(chapterId: string, score: number, total: number, completedAt = new Date()): QuizAttempt {
  const attempt: QuizAttempt = {
    chapterId,
    score,
    total,
    passed: didPassQuiz(score, total),
    completedAt: completedAt.toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...readQuizAttempts(), attempt]));
  } catch {
    // The quiz remains usable when browser storage is unavailable.
  }
  return attempt;
}

export function getQuizPassCountThisWeek(now = new Date()): number {
  return countQuizPassesThisWeek(readQuizAttempts(), now);
}

export function getQuizAccuracyPercent(): number | null {
  const attempts = readQuizAttempts().filter((attempt) => attempt.total > 0);
  const totalQuestions = attempts.reduce((sum, attempt) => sum + attempt.total, 0);
  if (totalQuestions === 0) return null;
  const correctAnswers = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return Math.round((correctAnswers / totalQuestions) * 100);
}