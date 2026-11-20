import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { lessonChapters } from "@/lib/lessonData";
import { loadActivities, recordActivity, type ActivityInput } from "@/lib/learnerActivity";
import { summarize, type ChapterInfo } from "@/lib/progressStats";

export const courseChapters: ChapterInfo[] = lessonChapters.map((c) => ({ id: c.id, title: c.title, sectionCount: c.sections.length }));

const progressKey = (userId: string | null) => ["learner-progress", userId ?? "guest"];

/** The current learner's own progress: points, level, streak, badges and charts. */
export function useLearnerProgress() {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;
  const query = useQuery({
    queryKey: progressKey(userId),
    queryFn: () => loadActivities(userId),
    enabled: !loading,
    staleTime: 15_000,
  });
  const summary = useMemo(() => summarize(courseChapters, query.data ?? []), [query.data]);
  return { summary, activities: query.data ?? [], isLoading: loading || query.isLoading, isError: query.isError, isGuest: !userId };
}

/** Records a learning event for whoever is using the app and refreshes their progress. */
export function useRecordActivity() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;
  return useCallback(async (input: ActivityInput) => {
    try {
      await recordActivity(userId, input);
    } catch {
      return false;
    }
    queryClient.invalidateQueries({ queryKey: progressKey(userId) });
    return true;
  }, [userId, queryClient]);
}

/** Lets other screens refresh progress after saving a chapter completion. */
export function useRefreshProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.invalidateQueries({ queryKey: progressKey(user?.id ?? null) }), [user?.id, queryClient]);
}
