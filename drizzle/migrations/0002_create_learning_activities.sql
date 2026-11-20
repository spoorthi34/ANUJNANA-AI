CREATE TABLE public.learning_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  chapter_id text,
  section_index integer,
  score integer,
  total integer,
  duration_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT learning_activities_kind_check CHECK (kind IN ('section_read', 'quiz', 'game', 'story', 'video', 'study')),
  CONSTRAINT learning_activities_chapter_check CHECK (chapter_id IS NULL OR char_length(chapter_id) BETWEEN 1 AND 100),
  CONSTRAINT learning_activities_section_check CHECK (section_index IS NULL OR section_index BETWEEN 0 AND 50),
  CONSTRAINT learning_activities_score_check CHECK (score IS NULL OR score BETWEEN 0 AND 1000),
  CONSTRAINT learning_activities_total_check CHECK (total IS NULL OR total BETWEEN 0 AND 1000),
  CONSTRAINT learning_activities_duration_check CHECK (duration_seconds BETWEEN 0 AND 1800)
);

CREATE INDEX learning_activities_user_created_idx ON public.learning_activities (user_id, created_at);

GRANT SELECT, INSERT ON public.learning_activities TO authenticated;
GRANT ALL ON public.learning_activities TO service_role;

ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners read own activities"
  ON public.learning_activities FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Learners add own activities"
  ON public.learning_activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);