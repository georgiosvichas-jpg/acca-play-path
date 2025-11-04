-- Create Papers table
CREATE TABLE public.papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Syllabus Units table
CREATE TABLE public.syllabus_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_code TEXT NOT NULL REFERENCES public.papers(paper_code) ON DELETE CASCADE,
  chapter TEXT NOT NULL,
  unit_title TEXT NOT NULL,
  learning_outcome TEXT,
  estimated_minutes INTEGER,
  priority TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Flashcards table
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_code TEXT NOT NULL REFERENCES public.papers(paper_code) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  xp INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Past Papers Meta table
CREATE TABLE public.past_papers_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_code TEXT NOT NULL REFERENCES public.papers(paper_code) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  session TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(paper_code, year, session)
);

-- Create User Progress table for tracking completed units
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paper_code TEXT NOT NULL REFERENCES public.papers(paper_code) ON DELETE CASCADE,
  syllabus_unit_id UUID REFERENCES public.syllabus_units(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, syllabus_unit_id)
);

-- Create User Profiles table with selected paper
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_paper TEXT REFERENCES public.papers(paper_code),
  total_xp INTEGER DEFAULT 0,
  study_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Flashcard Reviews table for spaced repetition
CREATE TABLE public.flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  correct_count INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, flashcard_id)
);

-- Enable RLS on all tables
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_papers_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Papers (public read)
CREATE POLICY "Papers are viewable by everyone"
  ON public.papers FOR SELECT
  USING (true);

-- RLS Policies for Syllabus Units (public read)
CREATE POLICY "Syllabus units are viewable by everyone"
  ON public.syllabus_units FOR SELECT
  USING (true);

-- RLS Policies for Flashcards (public read)
CREATE POLICY "Flashcards are viewable by everyone"
  ON public.flashcards FOR SELECT
  USING (true);

-- RLS Policies for Past Papers Meta (public read)
CREATE POLICY "Past papers meta are viewable by everyone"
  ON public.past_papers_meta FOR SELECT
  USING (true);

-- RLS Policies for User Progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for User Profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Flashcard Reviews
CREATE POLICY "Users can view their own reviews"
  ON public.flashcard_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews"
  ON public.flashcard_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.flashcard_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_syllabus_units_paper_code ON public.syllabus_units(paper_code);
CREATE INDEX idx_flashcards_paper_code ON public.flashcards(paper_code);
CREATE INDEX idx_flashcards_category ON public.flashcards(category);
CREATE INDEX idx_flashcards_difficulty ON public.flashcards(difficulty);
CREATE INDEX idx_past_papers_paper_code ON public.past_papers_meta(paper_code);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_paper_code ON public.user_progress(paper_code);
CREATE INDEX idx_flashcard_reviews_user_id ON public.flashcard_reviews(user_id);

-- Create function to update user profile updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();