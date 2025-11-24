-- Add missing columns to sb_questions for FA import
ALTER TABLE sb_questions 
ADD COLUMN IF NOT EXISTS external_id text,
ADD COLUMN IF NOT EXISTS estimated_time_seconds integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS tags jsonb,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create unique index on (paper, external_id) for upserts
CREATE UNIQUE INDEX IF NOT EXISTS sb_questions_paper_external_id_unique 
ON sb_questions(paper, external_id);

-- Add comment for clarity
COMMENT ON COLUMN sb_questions.external_id IS 'Unique identifier per paper for upserts (e.g. FA_Q001)';