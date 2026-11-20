import { describe, expect, it } from "vitest";
import { countQuizPassesThisWeek, didPassQuiz, getQuizAccuracyPercent, type QuizAttempt } from "@/lib/quizProgress";

describe("weekly quiz pass measure", () => {
  it("counts a 4-of-5 quiz as a pass and a 3-of-5 quiz as not passed", () => {
    expect(didPassQuiz(4, 5)).toBe(true);
    expect(didPassQuiz(3, 5)).toBe(false);
  });

  it("counts only passed quizzes completed in the current Monday-to-Monday week", () => {
    const now = new Date("2026-11-08T12:00:00.000Z");
    const attempts: QuizAttempt[] = [
      { chapterId: "a", score: 4, total: 5, passed: true, completedAt: "2026-11-03T12:00:00.000Z" },
      { chapterId: "b", score: 3, total: 5, passed: false, completedAt: "2026-11-04T12:00:00.000Z" },
      { chapterId: "c", score: 5, total: 5, passed: true, completedAt: "2026-11-01T12:00:00.000Z" },
      { chapterId: "d", score: 5, total: 5, passed: true, completedAt: "2026-11-09T00:00:00.000Z" },
    ];
    expect(countQuizPassesThisWeek(attempts, now)).toBe(1);
  });

  it("reports weighted accuracy from saved quiz answers and no value before any quiz", () => {
    window.localStorage.setItem("anujnana-quiz-attempts", JSON.stringify([
      { chapterId: "a", score: 4, total: 5, passed: true, completedAt: "2026-11-03T12:00:00.000Z" },
      { chapterId: "b", score: 2, total: 5, passed: false, completedAt: "2026-11-04T12:00:00.000Z" },
    ] satisfies QuizAttempt[]));
    expect(getQuizAccuracyPercent()).toBe(60);
    window.localStorage.removeItem("anujnana-quiz-attempts");
    expect(getQuizAccuracyPercent()).toBeNull();
  });
});