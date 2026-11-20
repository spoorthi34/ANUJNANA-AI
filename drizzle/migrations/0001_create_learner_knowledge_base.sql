CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE public.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  title text NOT NULL,
  source_type text NOT NULL DEFAULT 'upload',
  mime_type text,
  storage_path text,
  course_version text UNIQUE,
  status text NOT NULL DEFAULT 'processing',
  page_count integer NOT NULL DEFAULT 0,
  chunk_count integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT knowledge_documents_source_check CHECK (source_type IN ('course', 'upload')),
  CONSTRAINT knowledge_documents_status_check CHECK (status IN ('processing', 'ready', 'failed')),
  CONSTRAINT knowledge_documents_owner_check CHECK (
    (source_type = 'course' AND owner_id IS NULL) OR (source_type = 'upload' AND owner_id IS NOT NULL)
  )
);

GRANT SELECT, DELETE ON public.knowledge_documents TO authenticated;
GRANT ALL ON public.knowledge_documents TO service_role;

ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners read own documents" ON public.knowledge_documents
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Learners delete own documents" ON public.knowledge_documents
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE INDEX knowledge_documents_owner_idx ON public.knowledge_documents (owner_id, created_at DESC);

CREATE TRIGGER knowledge_documents_updated_at
  BEFORE UPDATE ON public.knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  owner_id uuid,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  source_label text NOT NULL,
  chapter_id text,
  section_index integer,
  page_number integer,
  embedding extensions.vector(768) NOT NULL,
  search_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.knowledge_chunks TO authenticated;
GRANT ALL ON public.knowledge_chunks TO service_role;

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners read course and own chunks" ON public.knowledge_chunks
  FOR SELECT TO authenticated USING (owner_id IS NULL OR owner_id = auth.uid());

CREATE INDEX knowledge_chunks_document_idx ON public.knowledge_chunks (document_id);
CREATE INDEX knowledge_chunks_owner_idx ON public.knowledge_chunks (owner_id);
CREATE INDEX knowledge_chunks_tsv_idx ON public.knowledge_chunks USING gin (search_tsv);
CREATE INDEX knowledge_chunks_embedding_idx ON public.knowledge_chunks
  USING hnsw (embedding extensions.vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding extensions.vector(768),
  query_text text,
  match_count integer DEFAULT 6,
  include_course boolean DEFAULT true,
  include_mine boolean DEFAULT true
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  owner_id uuid,
  content text,
  source_label text,
  chapter_id text,
  section_index integer,
  page_number integer,
  similarity double precision,
  keyword_rank double precision,
  score double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  WITH params AS (
    SELECT LEAST(GREATEST(match_count, 1), 20) AS k,
           CASE WHEN coalesce(trim(query_text), '') = '' THEN NULL
                ELSE to_tsquery('english', query_text) END AS tsq
  ),
  visible AS (
    SELECT c.*
    FROM public.knowledge_chunks c
    WHERE (include_course AND c.owner_id IS NULL)
       OR (include_mine AND c.owner_id = auth.uid())
  ),
  semantic AS (
    SELECT v.id,
           1 - (v.embedding <=> query_embedding) AS similarity,
           row_number() OVER (ORDER BY v.embedding <=> query_embedding) AS rnk
    FROM visible v
    ORDER BY v.embedding <=> query_embedding
    LIMIT (SELECT k * 4 FROM params)
  ),
  keyword AS (
    SELECT v.id,
           ts_rank_cd(v.search_tsv, p.tsq) AS krank,
           row_number() OVER (ORDER BY ts_rank_cd(v.search_tsv, p.tsq) DESC) AS rnk
    FROM visible v, params p
    WHERE p.tsq IS NOT NULL AND v.search_tsv @@ p.tsq
    ORDER BY krank DESC
    LIMIT (SELECT k * 4 FROM params)
  )
  SELECT c.id, c.document_id, c.owner_id, c.content, c.source_label, c.chapter_id,
         c.section_index, c.page_number,
         coalesce(s.similarity, 0)::double precision AS similarity,
         coalesce(kw.krank, 0)::double precision AS keyword_rank,
         (coalesce(1.0 / (60 + s.rnk), 0) + coalesce(1.0 / (60 + kw.rnk), 0))::double precision AS score
  FROM semantic s
  FULL OUTER JOIN keyword kw ON kw.id = s.id
  JOIN public.knowledge_chunks c ON c.id = coalesce(s.id, kw.id)
  ORDER BY score DESC
  LIMIT (SELECT k FROM params);
$$;

REVOKE ALL ON FUNCTION public.match_knowledge_chunks(extensions.vector, text, integer, boolean, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_knowledge_chunks(extensions.vector, text, integer, boolean, boolean) TO authenticated, service_role;

CREATE POLICY "Learners upload own notes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'learner-notes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Learners read own notes" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'learner-notes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Learners delete own notes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'learner-notes' AND (storage.foldername(name))[1] = auth.uid()::text);