-- Add new columns to mock_config table for multi-variant support
ALTER TABLE public.mock_config
ADD COLUMN mock_id TEXT,
ADD COLUMN title TEXT,
ADD COLUMN easy_ratio NUMERIC,
ADD COLUMN medium_ratio NUMERIC,
ADD COLUMN hard_ratio NUMERIC,
ADD COLUMN unit_scope TEXT[],
ADD COLUMN description TEXT;

-- Populate existing rows with default values to prevent data loss
UPDATE public.mock_config
SET mock_id = paper_code || '_MOCK_1',
    title = 'Standard Mock Exam',
    easy_ratio = 30,
    medium_ratio = 50,
    hard_ratio = 20,
    description = 'Standard mock exam configuration'
WHERE mock_id IS NULL;

-- Make mock_id NOT NULL and unique (primary lookup key)
ALTER TABLE public.mock_config
ALTER COLUMN mock_id SET NOT NULL,
ADD CONSTRAINT mock_config_mock_id_unique UNIQUE (mock_id);

-- Drop and recreate foreign key without one-to-one constraint
-- This allows multiple mocks per paper
ALTER TABLE public.mock_config
DROP CONSTRAINT IF EXISTS fk_mock_config_paper;

ALTER TABLE public.mock_config
ADD CONSTRAINT fk_mock_config_paper
FOREIGN KEY (paper_code)
REFERENCES public.papers(paper_code)
ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_mock_config_mock_id ON public.mock_config(mock_id);
CREATE INDEX idx_mock_config_paper_code ON public.mock_config(paper_code);