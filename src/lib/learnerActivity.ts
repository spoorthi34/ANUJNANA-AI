import { supabase } from "@/integrations/supabase/client";
import type { ActivityKind, LearningActivity } from "@/lib/progressStats";
import { readQuizAttempts } from "@/lib/quizProgress";

const guestActivityKey = "anujnana-activity";
const guestCompletedKey = "anujnana-completed-lessons";
const GUEST_LIMIT = 3000;
const PAGE = 1000;
/** Placeholder date for guest completions saved before dates were tracked. */
export const UNDATED = "1970-01-01T00:00:00.000Z";

export interface ActivityInput {
  kind: Exclude<ActivityKind, "lesson_complete">;
  chapterId?: string | null;
  sectionIndex?: number | null;
  score?: number | null;
  total?: number | null;
  durationSeconds?: number;
}

function readGuestActivities(): LearningActivity[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(guestActivityKey) ?? "[]");
    return Array.isArray(stored) ? stored.filter((a): a is LearningActivity => typeof a?.kind === "string" && typeof a?.createdAt === "string") : [];
  } catch {
    return [];
  }
}

function readGuestCompletions(): string[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(guestCompletedKey) ?? "[]");
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

const normalize = (input: ActivityInput, createdAt: string): LearningActivity => ({
  kind: input.kind,
  chapterId: input.chapterId ?? null,
  sectionIndex: input.sectionIndex ?? null,
  score: input.score ?? null,
  total: input.total ?? null,
  durationSeconds: Math.max(0, Math.min(1800, Math.round(input.durationSeconds ?? 0))),
  createdAt,
});

/** Saves one learning event for the signed-in learner, or on this device for guests. */
export async function recordActivity(userId: string | null, input: ActivityInput) {
  const activity = normalize(input, new Date().toISOString());
  if (!userId) {
    try {
      const next = [...readGuestActivities(), activity].slice(-GUEST_LIMIT);
      window.localStorage.setItem(guestActivityKey, JSON.stringify(next));
    } catch { /* storage unavailable */ }
    return;
  }
  const { error } = await supabase.from("learning_activities").insert({
    user_id: userId,
    kind: activity.kind,
    chapter_id: activity.chapterId,
    section_index: activity.sectionIndex,
    score: activity.score,
    total: activity.total,
    duration_seconds: activity.durationSeconds,
  });
  if (error) throw error;
}

/** Every learning event for this learner, oldest first, including chapter completions. */
export async function loadActivities(userId: string | null): Promise<LearningActivity[]> {
  if (!userId) {
    const legacyQuizzes = readQuizAttempts().map((q) => normalize({ kind: "quiz", chapterId: q.chapterId, score: q.score, total: q.total }, q.completedAt));
    // Guest completions have no date, so they count toward chapters and badges but not streaks.
    const completions: LearningActivity[] = readGuestCompletions().map((chapterId) => ({
      kind: "lesson_complete", chapterId, sectionIndex: null, score: null, total: null, durationSeconds: 0, createdAt: UNDATED,
    }));
    return [...completions, ...legacyQuizzes, ...readGuestActivities()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  }

  const rows: LearningActivity[] = [];
  for (let from = 0; from < 20 * PAGE; from += PAGE) {
    const { data, error } = await supabase
      .from("learning_activities")
      .select("kind, chapter_id, section_index, score, total, duration_seconds, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []).map((r) => ({
      kind: r.kind as ActivityKind,
      chapterId: r.chapter_id,
      sectionIndex: r.section_index,
      score: r.score,
      total: r.total,
      durationSeconds: r.duration_seconds,
      createdAt: r.created_at,
    })));
    if (!data || data.length < PAGE) break;
  }

  const { data: completions, error } = await supabase.from("lesson_completions").select("chapter_id, completed_at").eq("user_id", userId);
  if (error) throw error;
  for (const c of completions ?? []) {
    rows.push({ kind: "lesson_complete", chapterId: c.chapter_id, sectionIndex: null, score: null, total: null, durationSeconds: 0, createdAt: c.completed_at });
  }
  return rows.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}
