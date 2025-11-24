-- Add missing columns to syllabus_units table
ALTER TABLE public.syllabus_units
ADD COLUMN IF NOT EXISTS unit_code TEXT,
ADD COLUMN IF NOT EXISTS parent_unit_code TEXT,
ADD COLUMN IF NOT EXISTS unit_level TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create unique constraint on paper_code + unit_code
CREATE UNIQUE INDEX IF NOT EXISTS syllabus_units_paper_unit_code_key 
ON public.syllabus_units(paper_code, unit_code);

-- Rename unit_title to unit_name for consistency (or keep both)
ALTER TABLE public.syllabus_units 
ADD COLUMN IF NOT EXISTS unit_name TEXT;

-- Rename estimated_minutes to estimated_study_minutes for consistency
ALTER TABLE public.syllabus_units 
ADD COLUMN IF NOT EXISTS estimated_study_minutes INTEGER;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_syllabus_units_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS syllabus_units_updated_at_trigger ON public.syllabus_units;
CREATE TRIGGER syllabus_units_updated_at_trigger
  BEFORE UPDATE ON public.syllabus_units
  FOR EACH ROW
  EXECUTE FUNCTION update_syllabus_units_updated_at();

-- Create mock_config table
CREATE TABLE IF NOT EXISTS public.mock_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_code TEXT NOT NULL UNIQUE,
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  pass_mark_percentage INTEGER NOT NULL DEFAULT 50,
  sections_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_mock_config_paper FOREIGN KEY (paper_code) REFERENCES public.papers(paper_code)
);

-- Enable RLS on mock_config
ALTER TABLE public.mock_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mock_config (read by everyone, write by admins)
CREATE POLICY "Mock config viewable by everyone"
  ON public.mock_config FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify mock config"
  ON public.mock_config FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for mock_config updated_at
CREATE OR REPLACE FUNCTION update_mock_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mock_config_updated_at_trigger
  BEFORE UPDATE ON public.mock_config
  FOR EACH ROW
  EXECUTE FUNCTION update_mock_config_updated_at();