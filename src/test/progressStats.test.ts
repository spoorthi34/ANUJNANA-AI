import { describe, expect, it } from "vitest";
import {
  computeBadges,
  computeXp,
  currentStreak,
  dailyGoal,
  levelFor,
  longestStreak,
  studyMinutes,
  summarize,
  type ChapterInfo,
  type LearningActivity,
} from "@/lib/progressStats";

const chapters: ChapterInfo[] = [
  { id: "infinite-potential-well", title: "Infinite Potential Well", sectionCount: 5 },
  { id: "finite-potential-well", title: "Finite Potential Well", sectionCount: 5 },
];

const act = (partial: Partial<LearningActivity> & Pick<LearningActivity, "kind">): LearningActivity => ({
  chapterId: "infinite-potential-well",
  sectionIndex: null,
  score: null,
  total: null,
  durationSeconds: 0,
  createdAt: new Date(2026, 10, 17, 10).toISOString(),
  ...partial,
});
const onDay = (day: number) => new Date(2026, 10, day, 10).toISOString();

describe("points", () => {
  it("gives 10 points per subtopic, only the first time it is read", () => {
    expect(computeXp([act({ kind: "section_read", sectionIndex: 0 }), act({ kind: "section_read", sectionIndex: 0 }), act({ kind: "section_read", sectionIndex: 1 })])).toBe(20);
  });

  it("gives 100 points once per completed chapter", () => {
    expect(computeXp([act({ kind: "lesson_complete" }), act({ kind: "lesson_complete" })])).toBe(100);
  });

  it("counts only each chapter's best quiz: 5 per correct answer plus 20 for passing", () => {
    const quizzes = [act({ kind: "quiz", score: 2, total: 5 }), act({ kind: "quiz", score: 4, total: 5 }), act({ kind: "quiz", score: 4, total: 5 })];
    expect(computeXp(quizzes)).toBe(4 * 5 + 20);
  });

  it("does not give the pass bonus for 3 out of 5", () => {
    expect(computeXp([act({ kind: "quiz", score: 3, total: 5 })])).toBe(15);
  });

  it("gives 15 points per finished game, at most 3 games a day", () => {
    const games = Array.from({ length: 5 }, () => act({ kind: "game", score: 10, total: 40 }));
    expect(computeXp(games)).toBe(45);
    expect(computeXp([...games, act({ kind: "game", createdAt: onDay(18) })])).toBe(60);
  });

  it("gives no points for study time alone", () => {
    expect(computeXp([act({ kind: "study", durationSeconds: 1800 })])).toBe(0);
  });
});

describe("levels", () => {
  it("starts at level 1 and goes up every 500 points", () => {
    expect(levelFor(0)).toMatchObject({ level: 1, toNext: 500 });
    expect(levelFor(499).level).toBe(1);
    expect(levelFor(500)).toMatchObject({ level: 2, intoLevel: 0, toNext: 500 });
    expect(levelFor(1250)).toMatchObject({ level: 3, intoLevel: 250, percent: 50 });
  });
});

describe("streaks", () => {
  const now = new Date(2026, 10, 17, 20);
  it("counts days in a row ending today", () => {
    const days = [15, 16, 17].map((d) => act({ kind: "section_read", createdAt: onDay(d) }));
    expect(currentStreak(days, now)).toBe(3);
  });

  it("keeps yesterday's streak alive before today's first lesson", () => {
    const days = [15, 16].map((d) => act({ kind: "section_read", createdAt: onDay(d) }));
    expect(currentStreak(days, now)).toBe(2);
  });

  it("resets after a missed day", () => {
    const days = [13, 14].map((d) => act({ kind: "section_read", createdAt: onDay(d) }));
    expect(currentStreak(days, now)).toBe(0);
    expect(longestStreak(days)).toBe(2);
  });
});

describe("study time and goals", () => {
  it("adds up study minutes", () => {
    expect(studyMinutes([act({ kind: "study", durationSeconds: 300 }), act({ kind: "study", durationSeconds: 90 })])).toBe(6);
  });

  it("needs one subtopic and one quiz today for the daily goal", () => {
    const now = new Date(2026, 10, 17, 20);
    expect(dailyGoal([act({ kind: "section_read", sectionIndex: 0 })], now)).toMatchObject({ done: 1, target: 2 });
    expect(dailyGoal([act({ kind: "section_read", sectionIndex: 0 }), act({ kind: "quiz", score: 1, total: 5 })], now).done).toBe(2);
    expect(dailyGoal([act({ kind: "quiz", score: 5, total: 5, createdAt: onDay(16) })], now).done).toBe(0);
  });
});

describe("badges and chapters", () => {
  it("unlocks First Quantum Chapter after one completed chapter", () => {
    const badges = computeBadges(chapters, [act({ kind: "lesson_complete" })]);
    expect(badges.find((b) => b.id === "first-chapter")?.unlocked).toBe(true);
    expect(badges.find((b) => b.id === "explorer")).toMatchObject({ target: 10, unlocked: false });
  });

  it("needs 5 perfect quizzes for Quiz Master", () => {
    const perfect = Array.from({ length: 4 }, () => act({ kind: "quiz", score: 5, total: 5 }));
    expect(computeBadges(chapters, perfect).find((b) => b.id === "quiz-master")).toMatchObject({ current: 4, unlocked: false });
    expect(computeBadges(chapters, [...perfect, act({ kind: "quiz", score: 5, total: 5 })]).find((b) => b.id === "quiz-master")?.unlocked).toBe(true);
  });

  it("shows chapter progress as subtopics read, and 100% once marked complete", () => {
    const summary = summarize(chapters, [
      act({ kind: "section_read", sectionIndex: 0 }),
      act({ kind: "section_read", sectionIndex: 1 }),
      act({ kind: "lesson_complete", chapterId: "finite-potential-well" }),
    ]);
    expect(summary.chapters[0]).toMatchObject({ sectionsRead: 2, percent: 40, completed: false });
    expect(summary.chapters[1]).toMatchObject({ percent: 100, completed: true });
    expect(summary.chaptersCompleted).toBe(1);
    expect(summary.coursePercent).toBe(70);
  });

  it("starts every new learner at zero", () => {
    const summary = summarize(chapters, []);
    expect(summary).toMatchObject({ xp: 0, streak: 0, studyMinutes: 0, chaptersCompleted: 0, badgesUnlocked: 0 });
  });
});
