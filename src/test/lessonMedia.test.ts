import { describe, expect, it } from "vitest";
import { lessonChapters } from "@/lib/lessonData";
import { getSectionMedia, lessonMedia } from "@/lib/lessonMedia";

describe("per-subtopic lesson media", () => {
  it("gives every subtopic its own guitar string and two videos", () => {
    for (const chapter of lessonChapters) {
      expect(lessonMedia[chapter.id]).toHaveLength(chapter.sections.length);
      const titles = lessonMedia[chapter.id].map((media) => media.videos[0].title);
      expect(new Set(titles).size).toBe(chapter.sections.length);
      for (const media of lessonMedia[chapter.id]) expect(media.videos).toHaveLength(2);
    }
  });

  it("returns different media when the learner changes subtopic", () => {
    expect(getSectionMedia("infinite-potential-well", 0).videos[0].title).toBe("Trapped in a Box");
    expect(getSectionMedia("infinite-potential-well", 2).videos[0].title).toBe("Counting the Loops");
    expect(getSectionMedia("quantum-tunneling", 2).string.well).toBe("tunnel");
  });
});
