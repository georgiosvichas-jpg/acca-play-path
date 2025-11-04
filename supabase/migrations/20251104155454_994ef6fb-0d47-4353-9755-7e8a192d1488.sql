-- Add study preference fields to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS exam_session TEXT,
ADD COLUMN IF NOT EXISTS study_hours INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS study_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
ADD COLUMN IF NOT EXISTS selected_papers TEXT[] DEFAULT '{}';

-- Create study_sessions table for scheduled study blocks
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paper_code TEXT NOT NULL,
  syllabus_unit_id UUID REFERENCES public.syllabus_units(id),
  session_date DATE NOT NULL,
  start_time TIME,
  duration_minutes INTEGER DEFAULT 60,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_sessions
CREATE POLICY "Users can view their own sessions"
ON public.study_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
ON public.study_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.study_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON public.study_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_study_sessions_updated_at
BEFORE UPDATE ON public.study_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();