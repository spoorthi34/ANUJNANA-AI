import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { extractText, getDocumentProxy } from "npm:unpdf@1.9.1";
import { chunkPages } from "../_shared/ragText.ts";
import { embedTexts, json, requireLearner, serviceClient, toVector } from "../_shared/rag.ts";

const MAX_PAGES = 60;
const MAX_CHARS = 250_000;
const MAX_DOCS_PER_LEARNER = 25;

const BodySchema = z.object({
  storagePath: z.string().min(3).max(400),
  title: z.string().trim().min(1).max(160),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const auth = await requireLearner(req);
  if (auth instanceof Response) return auth;
  const { userId } = auth;

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid upload details." }, 400);
  const { storagePath, title } = parsed.data;
  if (!storagePath.startsWith(`${userId}/`) || storagePath.includes("..")) {
    return json({ error: "You can only add your own files." }, 403);
  }
  const extension = storagePath.split(".").pop()?.toLowerCase() ?? "";
  if (!["pdf", "txt", "md"].includes(extension)) return json({ error: "Only PDF, TXT or MD files are supported." }, 400);

  const admin = serviceClient();
  const { count } = await admin
    .from("knowledge_documents")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId);
  if ((count ?? 0) >= MAX_DOCS_PER_LEARNER) {
    return json({ error: `You can keep up to ${MAX_DOCS_PER_LEARNER} files. Delete one to add more.` }, 400);
  }

  const { data: doc, error: docError } = await admin
    .from("knowledge_documents")
    .insert({
      owner_id: userId,
      title,
      source_type: "upload",
      mime_type: extension === "pdf" ? "application/pdf" : "text/plain",
      storage_path: storagePath,
      status: "processing",
    })
    .select("id")
    .single();
  if (docError || !doc) return json({ error: "Could not save your file." }, 500);

  const fail = async (message: string, status = 400) => {
    await admin.from("knowledge_documents").update({ status: "failed", error_message: message }).eq("id", doc.id);
    return json({ error: message, documentId: doc.id }, status);
  };

  try {
    const { data: file, error: downloadError } = await admin.storage.from("learner-notes").download(storagePath);
    if (downloadError || !file) return await fail("We couldn't find the uploaded file. Please try again.");

    let pages: string[];
    if (extension === "pdf") {
      const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
      if (pdf.numPages > MAX_PAGES) return await fail(`This PDF has ${pdf.numPages} pages. Please upload ${MAX_PAGES} pages or fewer.`);
      const result = await extractText(pdf, { mergePages: false });
      pages = Array.isArray(result.text) ? result.text : [result.text];
    } else {
      pages = [await file.text()];
    }

    const totalChars = pages.reduce((sum, page) => sum + page.length, 0);
    if (totalChars < 40) return await fail("We couldn't find readable text. Scanned photos of pages aren't supported yet.");
    if (totalChars > MAX_CHARS) return await fail("This file has too much text. Please split it into smaller files.");

    const chunks = chunkPages(pages);
    const vectors = await embedTexts(chunks.map((chunk) => chunk.content));
    const rows = chunks.map((chunk, index) => ({
      document_id: doc.id,
      owner_id: userId,
      chunk_index: index,
      content: chunk.content,
      source_label: chunk.pageNumber ? `${title} · page ${chunk.pageNumber}` : title,
      page_number: chunk.pageNumber,
      embedding: toVector(vectors[index]),
    }));
    for (let start = 0; start < rows.length; start += 100) {
      const { error } = await admin.from("knowledge_chunks").insert(rows.slice(start, start + 100));
      if (error) throw error;
    }
    await admin
      .from("knowledge_documents")
      .update({ status: "ready", page_count: pages.length, chunk_count: rows.length, error_message: null })
      .eq("id", doc.id);
    return json({ documentId: doc.id, pages: pages.length, chunks: rows.length });
  } catch (error) {
    console.error("ingest failed", error);
    return await fail("Something went wrong while reading your file. Please try again.", 500);
  }
});
