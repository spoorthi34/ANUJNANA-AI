import { supabase } from "@/integrations/supabase/client";

const guestCompletedKey = "anujnana-completed-lessons";
const guestRelaxKey = "anujnana-guest-relax-mode";

function readGuestCompleted(): string[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(guestCompletedKey) ?? "[]");
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/** Completed chapters for the signed-in learner, or for this device when browsing as a guest. */
export async function loadCompletedChapters(userId: string | null): Promise<string[]> {
  if (!userId) return readGuestCompleted();
  const { data } = await supabase.from("lesson_completions").select("chapter_id").eq("user_id", userId);
  return (data ?? []).map((row) => row.chapter_id);
}

export async function saveChapterCompleted(userId: string | null, chapterId: string) {
  if (!userId) {
    const previous = readGuestCompleted();
    if (!previous.includes(chapterId)) {
      try { window.localStorage.setItem(guestCompletedKey, JSON.stringify([...previous, chapterId])); } catch { /* storage unavailable */ }
    }
    return;
  }
  const { error } = await supabase
    .from("lesson_completions")
    .upsert({ user_id: userId, chapter_id: chapterId }, { onConflict: "user_id,chapter_id", ignoreDuplicates: true });
  if (error) throw error;
}

export function readGuestRelaxPreference() {
  try { return window.localStorage.getItem(guestRelaxKey) === "on"; } catch { return false; }
}

export function saveGuestRelaxPreference(on: boolean) {
  try { window.localStorage.setItem(guestRelaxKey, on ? "on" : "off"); } catch { /* storage unavailable */ }
}
