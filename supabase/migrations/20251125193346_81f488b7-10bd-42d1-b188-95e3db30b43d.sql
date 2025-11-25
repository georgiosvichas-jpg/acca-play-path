-- Create bookmarks table for saving questions across all study features
CREATE TABLE IF NOT EXISTS public.question_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL,
  source_type TEXT NOT NULL, -- 'practice', 'mock', 'spaced_repetition', 'mini_test'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bookmarks"
  ON public.question_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON public.question_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.question_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
  ON public.question_bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_question_bookmarks_user_id ON public.question_bookmarks(user_id);
CREATE INDEX idx_question_bookmarks_question_id ON public.question_bookmarks(question_id);

-- Create weak areas tracking table
CREATE TABLE IF NOT EXISTS public.topic_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  paper_code TEXT NOT NULL,
  unit_code TEXT,
  topic_name TEXT NOT NULL,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  accuracy_percentage NUMERIC DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, paper_code, unit_code, topic_name)
);

-- Enable RLS
ALTER TABLE public.topic_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own topic performance"
  ON public.topic_performance
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own topic performance"
  ON public.topic_performance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topic performance"
  ON public.topic_performance
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for weak areas queries
CREATE INDEX idx_topic_performance_user_paper ON public.topic_performance(user_id, paper_code);
CREATE INDEX idx_topic_performance_accuracy ON public.topic_performance(user_id, accuracy_percentage);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_topic_performance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.accuracy_percentage = CASE 
    WHEN NEW.questions_attempted > 0 
    THEN ROUND((NEW.questions_correct::NUMERIC / NEW.questions_attempted::NUMERIC) * 100, 2)
    ELSE 0
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_topic_performance
  BEFORE UPDATE ON public.topic_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_performance_updated_at();