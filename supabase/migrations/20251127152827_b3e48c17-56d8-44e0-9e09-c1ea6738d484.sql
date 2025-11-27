-- Allow multiple mock_config rows per paper by removing unique constraint on paper_code
ALTER TABLE public.mock_config DROP CONSTRAINT IF EXISTS mock_config_paper_code_key;