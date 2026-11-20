import { supabase } from "@/integrations/supabase/client";

export type TutorScope = "all" | "course" | "mine";

export interface TutorSource {
  n: number;
  kind: "course" | "notes";
  label: string;
  documentTitle: string | null;
  chapterId: string | null;
  sectionIndex: number | null;
  page: number | null;
  snippet: string;
  relevance: number;
}

export interface TutorTurn {
  role: "user" | "tutor";
  text: string;
}

export interface PedagogyMeta {
  misconception?: string;
  bloomLevel?: string;
  scaffoldingTactic?: string;
  targetDiscovery?: string;
  cognitiveLoadState?: "Low (Fatigue)" | "Optimal (Active)" | "High (Flow State)";
  focusScore?: number;
  thinkingProcess?: string[];
}

export type TextSegment = { type: "text"; text: string } | { type: "cite"; n: number };

/** Split a tutor reply into plain text and [n] citation markers (also handles [1, 2] and [1][2]). */
export function splitCitations(text: string, maxSource = Infinity): TextSegment[] {
  const segments: TextSegment[] = [];
  const pattern = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const numbers = match[1].split(",").map((value) => Number(value.trim()));
    if (!numbers.every((n) => n >= 1 && n <= maxSource)) continue;
    if (match.index! > last) segments.push({ type: "text", text: text.slice(last, match.index) });
    numbers.forEach((n) => segments.push({ type: "cite", n }));
    last = match.index! + match[0].length;
  }
  if (last < text.length) segments.push({ type: "text", text: text.slice(last) });
  return segments;
}

/** Source numbers the reply actually cites, in order of first use. */
export function citedSourceNumbers(text: string, maxSource = Infinity): number[] {
  const seen: number[] = [];
  for (const segment of splitCitations(text, maxSource)) {
    if (segment.type === "cite" && !seen.includes(segment.n)) seen.push(segment.n);
  }
  return seen;
}

interface AskOptions {
  question: string;
  history: TutorTurn[];
  chapterId?: string;
  sectionIndex?: number;
  scope: TutorScope;
  focusScore?: number;
  attentionStatus?: string;
  signal?: AbortSignal;
  onSources: (sources: TutorSource[]) => void;
  onDelta: (text: string) => void;
  onPedagogy?: (pedagogy: PedagogyMeta) => void;
}

/** Streams a cited, hint-only reply from the tutor. Throws Error with a learner-friendly message. */
export async function askTutor(options: AskOptions) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please log in to use the AI tutor.");

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rag-tutor`, {
    method: "POST",
    signal: options.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      question: options.question,
      history: options.history.slice(-8).map((turn) => ({ role: turn.role, text: turn.text.slice(0, 4000) })),
      chapterId: options.chapterId,
      sectionIndex: options.sectionIndex,
      scope: options.scope,
      focusScore: options.focusScore,
      attentionStatus: options.attentionStatus,
    }),
  });

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "The tutor couldn't answer just now. Please try again.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;
  while (!finished) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf("\n\n");
    while (boundary >= 0) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
      const line = frame.split("\n").find((item) => item.startsWith("data: "));
      if (!line) continue;
      const event = JSON.parse(line.slice(6));
      if (event.type === "sources") options.onSources(event.sources);
      else if (event.type === "pedagogy") options.onPedagogy?.(event.meta);
      else if (event.type === "delta") options.onDelta(event.text);
      else if (event.type === "error") throw new Error(event.message);
      else if (event.type === "done") finished = true;
    }
  }
}
