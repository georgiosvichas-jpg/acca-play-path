-- Add papers column to study_paths table for multi-paper support
ALTER TABLE study_paths ADD COLUMN papers TEXT[] DEFAULT '{}';

-- Update path_data structure to support actionable task objects
-- Tasks will now have format: { text, type, paper, unit, link }
COMMENT ON COLUMN study_paths.path_data IS 'JSON structure containing study plan with actionable task objects including type, paper, unit, and navigation links';