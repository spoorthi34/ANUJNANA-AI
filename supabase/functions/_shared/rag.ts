import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { generateEmbeddings } from "npm:@lovable.dev/ai-gateway@0.1.11";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { COURSE_CORPUS, COURSE_CORPUS_VERSION } from "./courseCorpus.ts";

export const EMBEDDING_MODEL = "google/gemini-embedding-2";
export const EMBEDDING_DIMENSIONS = 768;

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function serviceClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
}

/** Validates the caller's session and returns a client that acts as that learner (RLS applies). */
export async function requireLearner(req: Request): Promise<{ userId: string; userClient: SupabaseClient } | Response> {
  const header = req.headers.get("Authorization") ?? "";
  if (!header.startsWith("Bearer ")) return json({ error: "Please log in to use the AI tutor." }, 401);
  const token = header.slice(7);
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, anonKey, {
    global: { headers: { Authorization: header } },
    auth: { persistSession: false },
  });
  const { data, error } = await userClient.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId || data?.claims?.role !== "authenticated") {
    return json({ error: "Your session has expired. Please log in again." }, 401);
  }
  return { userId, userClient };
}

/** Embeds texts in batches; returns one 768-number vector per input, in order. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const vectors: number[][] = [];
  for (let start = 0; start < texts.length; start += 64) {
    const batch = texts.slice(start, start + 64);
    const response = await generateEmbeddings({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSIONS,
    });
    const rows = [...response.data].sort((a, b) => a.index - b.index);
    for (const row of rows) {
      if (typeof row.embedding === "string") throw new Error("Unexpected base64 embedding");
      vectors.push(row.embedding);
    }
  }
  if (vectors.length !== texts.length) throw new Error("Embedding count mismatch");
  return vectors;
}

export const toVector = (values: number[]) => `[${values.join(",")}]`;

/**
 * Makes sure the built-in lessons are searchable for the current catalog version.
 * Seeds once per version; a unique version column stops concurrent requests seeding twice.
 */
export async function ensureCourseIndexed(admin: SupabaseClient) {
  const { data: existing } = await admin
    .from("knowledge_documents")
    .select("id, status, created_at")
    .eq("course_version", COURSE_CORPUS_VERSION)
    .maybeSingle();
  if (existing?.status === "ready") return;
  if (existing) {
    const stale = Date.now() - new Date(existing.created_at).getTime() > 5 * 60_000;
    if (existing.status === "processing" && !stale) return;
    await admin.from("knowledge_documents").delete().eq("id", existing.id);
  }

  const { data: doc, error } = await admin
    .from("knowledge_documents")
    .insert({
      title: "AnuJnana course lessons",
      source_type: "course",
      course_version: COURSE_CORPUS_VERSION,
      status: "processing",
      page_count: COURSE_CORPUS.length,
    })
    .select("id")
    .single();
  if (error || !doc) return; // another request is seeding this version

  try {
    const vectors = await embedTexts(COURSE_CORPUS.map((entry) => entry.content));
    const rows = COURSE_CORPUS.map((entry, index) => ({
      document_id: doc.id,
      owner_id: null,
      chunk_index: index,
      content: entry.content,
      source_label: entry.label,
      chapter_id: entry.chapterId,
      section_index: entry.sectionIndex,
      embedding: toVector(vectors[index]),
    }));
    const { error: insertError } = await admin.from("knowledge_chunks").insert(rows);
    if (insertError) throw insertError;
    await admin
      .from("knowledge_documents")
      .update({ status: "ready", chunk_count: rows.length })
      .eq("id", doc.id);
    await admin
      .from("knowledge_documents")
      .delete()
      .eq("source_type", "course")
      .neq("course_version", COURSE_CORPUS_VERSION);
  } catch (seedError) {
    console.error("course seeding failed", seedError);
    await admin.from("knowledge_documents").delete().eq("id", doc.id);
    throw seedError;
  }
}
