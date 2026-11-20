import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type LearnerNote = Tables<"knowledge_documents">;

export const NOTE_MAX_BYTES = 10 * 1024 * 1024;
export const NOTE_EXTENSIONS = ["pdf", "txt", "md"] as const;

/** Returns a learner-facing problem with the file, or null when it can be uploaded. */
export function validateNoteFile(file: { name: string; size: number }): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(NOTE_EXTENSIONS as readonly string[]).includes(extension)) return "Please choose a PDF, TXT or MD file.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > NOTE_MAX_BYTES) return "Files must be 10 MB or smaller.";
  return null;
}

export async function listNotes(): Promise<LearnerNote[]> {
  const { data, error } = await supabase
    .from("knowledge_documents")
    .select("*")
    .eq("source_type", "upload")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadNote(userId: string, file: File) {
  const problem = validateNoteFile(file);
  if (problem) throw new Error(problem);
  const extension = file.name.split(".").pop()!.toLowerCase();
  const safeName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_ ]/g, "").trim().slice(0, 60) || "notes";
  const path = `${userId}/${crypto.randomUUID()}-${safeName.replace(/\s+/g, "-")}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("learner-notes").upload(path, file, {
    contentType: extension === "pdf" ? "application/pdf" : "text/plain",
    upsert: false,
  });
  if (uploadError) throw new Error("Upload failed. Please check your connection and try again.");

  const { data, error } = await supabase.functions.invoke("rag-ingest", {
    body: { storagePath: path, title: file.name.slice(0, 160) },
  });
  if (error) {
    let message = "We couldn't read this file. Please try another one.";
    try {
      const body = await (error as { context?: Response }).context?.json();
      if (body?.error) message = body.error;
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  return data as { documentId: string; pages: number; chunks: number };
}

export async function deleteNote(note: LearnerNote) {
  const { error } = await supabase.from("knowledge_documents").delete().eq("id", note.id);
  if (error) throw new Error("Couldn't delete this file. Please try again.");
  if (note.storage_path) await supabase.storage.from("learner-notes").remove([note.storage_path]);
}
