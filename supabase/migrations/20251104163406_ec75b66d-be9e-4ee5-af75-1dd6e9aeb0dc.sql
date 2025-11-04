-- Update flashcards table to match CSV schema
ALTER TABLE public.flashcards
ADD COLUMN IF NOT EXISTS paper_name TEXT,
ADD COLUMN IF NOT EXISTS unit_title TEXT,
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'Mini-problem',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_flashcards_paper ON public.flashcards(paper_code);
CREATE INDEX IF NOT EXISTS idx_flashcards_difficulty ON public.flashcards(difficulty);
CREATE INDEX IF NOT EXISTS idx_flashcards_unit ON public.flashcards(unit_title);

-- Add trigger for updated_at
CREATE TRIGGER update_flashcards_updated_at
BEFORE UPDATE ON public.flashcards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();