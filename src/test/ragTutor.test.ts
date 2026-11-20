import { describe, expect, it } from "vitest";
import { citedSourceNumbers, splitCitations } from "@/lib/ragTutor";
import { validateNoteFile } from "@/lib/learnerNotes";
import { buildKeywordQuery, chunkPages } from "../../supabase/functions/_shared/ragText";
import { buildCourseCorpus } from "@/lib/courseCorpus";
import { COURSE_CORPUS_VERSION } from "../../supabase/functions/_shared/courseCorpus";

describe("tutor citations", () => {
  it("splits [n] markers out of the reply", () => {
    expect(splitCitations("Waves fade [2]. Think!")).toEqual([
      { type: "text", text: "Waves fade " },
      { type: "cite", n: 2 },
      { type: "text", text: ". Think!" },
    ]);
  });

  it("expands grouped citations and ignores numbers with no matching source", () => {
    expect(citedSourceNumbers("A [1, 3] B [9] C [3]", 5)).toEqual([1, 3]);
    expect(citedSourceNumbers("Only [9]", 5)).toEqual([]);
  });
});

describe("learner note uploads", () => {
  it("accepts PDF, TXT and MD up to 10 MB", () => {
    expect(validateNoteFile({ name: "notes.pdf", size: 1000 })).toBeNull();
    expect(validateNoteFile({ name: "a.MD", size: 10 * 1024 * 1024 })).toBeNull();
    expect(validateNoteFile({ name: "a.docx", size: 1000 })).not.toBeNull();
    expect(validateNoteFile({ name: "big.pdf", size: 10 * 1024 * 1024 + 1 })).not.toBeNull();
  });
});

describe("retrieval text helpers", () => {
  it("builds a safe OR keyword query without stopwords or punctuation", () => {
    expect(buildKeywordQuery("Why can't the ground-state energy be zero?")).toBe("ground | state | energy | zero");
    expect(buildKeywordQuery("what is it?")).toBe("");
  });

  it("chunks long pages with page numbers and keeps every chunk under the size limit", () => {
    const sentence = "The wave function decays inside the barrier. ";
    const chunks = chunkPages([sentence.repeat(60), "Short page two text about nodes."], 300, 50);
    expect(chunks.length).toBeGreaterThan(5);
    expect(chunks.every((chunk) => chunk.content.length <= 300)).toBe(true);
    expect(chunks[0].pageNumber).toBe(1);
    expect(chunks[chunks.length - 1].pageNumber).toBe(2);
  });
});

describe("course corpus", () => {
  it("has one passage per lesson subtopic and the backend copy is up to date", () => {
    const corpus = buildCourseCorpus();
    expect(corpus.entries).toHaveLength(15);
    // If this fails, run: bun scripts/build-course-corpus.ts
    expect(COURSE_CORPUS_VERSION).toBe(corpus.version);
  });
});

describe("pedagogical scaffolding", () => {
  it("parses valid pedagogical metadata objects", () => {
    const sampleMeta = {
      misconception: "Confusing classical rest with ground state",
      bloomLevel: "Analyze",
      scaffoldingTactic: "Heisenberg uncertainty counterfactual",
      targetDiscovery: "Confinement fixes spatial uncertainty Δx",
    };
    expect(sampleMeta.bloomLevel).toBe("Analyze");
    expect(sampleMeta.scaffoldingTactic).toContain("Heisenberg");
  });
});
