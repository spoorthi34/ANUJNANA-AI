import { describe, expect, it } from "vitest";
import { lessonChapters } from "@/lib/lessonData";

describe("chapter lessons", () => {
  it("provides a distinct five-section lesson and chapter quiz for every course chapter", () => {
    expect(lessonChapters.map((chapter) => chapter.id)).toEqual([
      "infinite-potential-well",
      "finite-potential-well",
      "quantum-tunneling",
    ]);
    for (const chapter of lessonChapters) {
      expect(chapter.sections).toHaveLength(5);
      expect(chapter.quizQuestions).toHaveLength(5);
      expect(new Set(chapter.quizQuestions.map((question) => question.question)).size).toBe(5);
    }
  });
});