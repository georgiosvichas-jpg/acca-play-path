-- Add missing columns to study_sessions table for enhanced XP tracking
ALTER TABLE public.study_sessions 
ADD COLUMN IF NOT EXISTS session_type TEXT,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS raw_log JSONB;