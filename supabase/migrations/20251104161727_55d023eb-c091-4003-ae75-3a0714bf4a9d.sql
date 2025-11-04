-- Create xp_events table to log all XP awards
CREATE TABLE public.xp_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  xp_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for xp_events
CREATE POLICY "Users can view their own XP events"
ON public.xp_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP events"
ON public.xp_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL,
  icon TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone"
ON public.badges
FOR SELECT
USING (true);

-- Create user_badges table to track earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
ON public.user_badges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add level field to user_profiles if not exists
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Insert initial badge data
INSERT INTO public.badges (badge_name, description, criteria_type, criteria_value, icon, tier) VALUES
('Onboarding Complete', 'Completed the onboarding process', 'onboarding', 1, 'BookOpen', 'bronze'),
('Consistent Learner', 'Reached 100 XP', 'xp_total', 100, 'Award', 'bronze'),
('ACCA Rising Star', 'Reached 500 XP', 'xp_total', 500, 'Star', 'gold'),
('First Session', 'Created your first study session', 'sessions_created', 1, 'Calendar', 'bronze'),
('Session Master', 'Completed 10 study sessions', 'sessions_completed', 10, 'CheckCircle2', 'silver'),
('Flashcard Pro', 'Completed 100 flashcards', 'flashcards_completed', 100, 'Brain', 'silver'),
('Perfect Score', 'Achieved 100% accuracy in a flashcard session', 'perfect_session', 1, 'Trophy', 'gold'),
('Streak Champion', 'Maintained a 7-day study streak', 'streak', 7, 'Flame', 'gold');