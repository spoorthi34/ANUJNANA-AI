import { lessonChapters } from "./lessonData";

export interface CourseCorpusEntry {
  chapterId: string;
  sectionIndex: number;
  label: string;
  content: string;
}

/** Deterministic text hash so the backend can tell when the lesson catalog changed. */
function hashText(text: string) {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h1 ^= text.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }
  return h1.toString(16).padStart(8, "0");
}

/** One retrievable passage per lesson subtopic, built from the shared lesson catalog. */
export function buildCourseCorpus() {
  const entries: CourseCorpusEntry[] = lessonChapters.flatMap((chapter) =>
    chapter.sections.map((section, sectionIndex) => ({
      chapterId: chapter.id,
      sectionIndex,
      label: `Ch ${chapter.chapterNumber} · ${chapter.title} — ${chapter.chapterNumber}.${sectionIndex + 1} ${section.title}`,
      content: [
        `${chapter.title}: ${section.title}.`,
        section.content.replace(/\n+/g, " "),
        `In simple words (${section.simpleTitle}): ${section.simpleContent}`,
        `Analogy: ${section.analogy}`,
      ].join("\n"),
    })),
  );
  return { version: `v1-${hashText(JSON.stringify(entries))}`, entries };
}
