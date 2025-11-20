-- Add AI coach daily message tracking to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS daily_coach_messages_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_coach_reset_date date DEFAULT CURRENT_DATE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_coach_usage 
ON public.user_profiles(user_id, last_coach_reset_date);

COMMENT ON COLUMN public.user_profiles.daily_coach_messages_used IS 'Number of AI coach messages used today';
COMMENT ON COLUMN public.user_profiles.last_coach_reset_date IS 'Last date when coach message counter was reset';