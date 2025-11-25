-- Add Phase 2 question type support with correct existing type
-- Drop constraint
ALTER TABLE public.sb_questions DROP CONSTRAINT IF EXISTS sb_questions_type_check;

-- Add metadata column
ALTER TABLE public.sb_questions
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.sb_questions.metadata IS 'Stores additional data for complex question types: FILL_IN_BLANK, CALCULATION, MATCHING, SCENARIO_BASED';

-- Create index
CREATE INDEX IF NOT EXISTS idx_sb_questions_metadata ON public.sb_questions USING gin(metadata);

-- Add constraint with all types including existing 'mcq'
ALTER TABLE public.sb_questions
  ADD CONSTRAINT sb_questions_type_check 
  CHECK (type IN (
    'mcq',                -- Existing type (lowercase)
    'MCQ_SINGLE', 
    'MCQ_MULTI', 
    'NUMERIC', 
    'SHORT',
    'FILL_IN_BLANK',
    'CALCULATION',
    'MATCHING',
    'SCENARIO_BASED'
  ));