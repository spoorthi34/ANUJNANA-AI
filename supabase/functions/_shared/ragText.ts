// Pure text helpers shared by the RAG edge functions and their tests.
// Keep this file free of Deno/npm imports so vitest can load it.

export interface TextChunk {
  content: string;
  pageNumber: number | null;
}

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "does", "for", "from", "how", "i", "if",
  "in", "is", "it", "its", "me", "my", "of", "on", "or", "so", "that", "the", "their", "then", "there", "this",
  "to", "was", "we", "what", "when", "where", "which", "who", "why", "will", "with", "you", "your", "about",
  "explain", "tell", "please", "mean", "means", "cant", "can't", "dont", "don't", "doesnt", "isnt",
]);

/** Collapse whitespace and drop control characters that PDFs often leave behind. */
export function cleanText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*\n\s*/g, "\n\n")
    .replace(/\s*\n\s*(?!\n)/g, " ")
    .trim();
}

/**
 * Split pages into overlapping chunks of roughly `size` characters, breaking on
 * sentence boundaries where possible. Each chunk keeps the page it started on.
 */
export function chunkPages(pages: string[], size = 900, overlap = 150): TextChunk[] {
  const chunks: TextChunk[] = [];
  pages.forEach((raw, pageIndex) => {
    const text = cleanText(raw);
    if (!text) return;
    const sentences = text.match(/[^.!?\n]+[.!?]+["')\]]*\s*|[^.!?\n]+$/g) ?? [text];
    let current = "";
    for (const sentence of sentences) {
      const piece = sentence.trim();
      if (!piece) continue;
      if (current && current.length + piece.length + 1 > size) {
        chunks.push({ content: current.trim(), pageNumber: pages.length > 1 ? pageIndex + 1 : null });
        const tail = current.slice(-overlap);
        const cut = tail.indexOf(" ");
        current = (cut >= 0 ? tail.slice(cut + 1) : tail) + " ";
      }
      if (piece.length > size) {
        for (let i = 0; i < piece.length; i += size - overlap) {
          chunks.push({ content: piece.slice(i, i + size).trim(), pageNumber: pages.length > 1 ? pageIndex + 1 : null });
        }
        current = "";
        continue;
      }
      current += piece + " ";
    }
    if (current.trim().length > 20 || (current.trim() && chunks.length === 0)) {
      chunks.push({ content: current.trim(), pageNumber: pages.length > 1 ? pageIndex + 1 : null });
    }
  });
  return chunks;
}

/** Build an OR-joined Postgres tsquery from a learner's question, safe to pass to to_tsquery. */
export function buildKeywordQuery(question: string): string {
  const words = question
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
  return Array.from(new Set(words)).slice(0, 12).join(" | ");
}
