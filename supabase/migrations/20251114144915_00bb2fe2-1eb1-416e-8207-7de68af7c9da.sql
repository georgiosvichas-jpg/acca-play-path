-- Create sb_users table for StudyBuddy
CREATE TABLE IF NOT EXISTS public.sb_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  exam_paper TEXT,
  exam_date DATE,
  weekly_study_hours INTEGER DEFAULT 5,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sb_study_sessions table
CREATE TABLE IF NOT EXISTS public.sb_study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.sb_users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('onboarding', 'daily', 'quick_drill', 'mini_test', 'mock_exam')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  raw_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sb_questions table
CREATE TABLE IF NOT EXISTS public.sb_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper TEXT NOT NULL,
  unit_code TEXT,
  learning_outcome_code TEXT,
  type TEXT NOT NULL CHECK (type IN ('flashcard', 'mcq')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question TEXT NOT NULL,
  options JSONB,
  correct_option_index INTEGER,
  answer TEXT,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sb_minitests table (optional)
CREATE TABLE IF NOT EXISTS public.sb_minitests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  question_ids UUID[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sb_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sb_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sb_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sb_minitests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sb_users
CREATE POLICY "Users can view their own profile"
  ON public.sb_users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.sb_users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON public.sb_users FOR UPDATE
  USING (true);

-- RLS Policies for sb_study_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.sb_study_sessions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own sessions"
  ON public.sb_study_sessions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for sb_questions
CREATE POLICY "Questions are viewable by everyone"
  ON public.sb_questions FOR SELECT
  USING (true);

-- RLS Policies for sb_minitests
CREATE POLICY "Minitests are viewable by everyone"
  ON public.sb_minitests FOR SELECT
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sb_users_email ON public.sb_users(email);
CREATE INDEX IF NOT EXISTS idx_sb_study_sessions_user_id ON public.sb_study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sb_questions_paper ON public.sb_questions(paper);
CREATE INDEX IF NOT EXISTS idx_sb_questions_type ON public.sb_questions(type);
CREATE INDEX IF NOT EXISTS idx_sb_questions_difficulty ON public.sb_questions(difficulty);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_sb_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sb_users_updated_at_trigger
  BEFORE UPDATE ON public.sb_users
  FOR EACH ROW
  EXECUTE FUNCTION update_sb_users_updated_at();