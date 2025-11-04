-- Phase 1: Leaderboard Database Schema

-- Add leaderboard fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS is_opted_out_of_leaderboard BOOLEAN DEFAULT false;

-- Create leaderboard_snapshots table
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  xp_total INTEGER NOT NULL DEFAULT 0,
  xp_7d INTEGER NOT NULL DEFAULT 0,
  xp_30d INTEGER NOT NULL DEFAULT 0,
  rank_global INTEGER,
  rank_country INTEGER,
  rank_paper INTEGER,
  percentile_global DECIMAL(5,2),
  percentile_country DECIMAL(5,2),
  percentile_paper DECIMAL(5,2),
  paper_code TEXT,
  captured_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, captured_on, paper_code)
);

-- Create flags_anti_abuse table
CREATE TABLE IF NOT EXISTS public.flags_anti_abuse (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details JSONB,
  flagged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Enable RLS
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flags_anti_abuse ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leaderboard_snapshots
CREATE POLICY "Users can view all leaderboard snapshots"
ON public.leaderboard_snapshots
FOR SELECT
USING (true);

CREATE POLICY "System can insert leaderboard snapshots"
ON public.leaderboard_snapshots
FOR INSERT
WITH CHECK (true);

-- RLS Policies for flags_anti_abuse
CREATE POLICY "Users can view their own flags"
ON public.flags_anti_abuse
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert flags"
ON public.flags_anti_abuse
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_xp_events_user_created ON public.xp_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_captured ON public.leaderboard_snapshots(captured_on DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_user_date ON public.leaderboard_snapshots(user_id, captured_on DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_rank_global ON public.leaderboard_snapshots(rank_global) WHERE rank_global IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_xp ON public.user_profiles(total_xp DESC) WHERE is_opted_out_of_leaderboard = false;
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON public.user_profiles(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flags_anti_abuse_user ON public.flags_anti_abuse(user_id, resolved);

-- Function to get user's leaderboard rank (real-time estimate)
CREATE OR REPLACE FUNCTION public.get_user_leaderboard_rank(p_user_id UUID)
RETURNS TABLE (
  rank_global INTEGER,
  rank_country INTEGER,
  percentile_global DECIMAL(5,2),
  percentile_country DECIMAL(5,2)
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp INTEGER;
  v_country TEXT;
  v_total_users INTEGER;
  v_total_country_users INTEGER;
BEGIN
  -- Get user's XP and country
  SELECT total_xp, country INTO v_xp, v_country
  FROM user_profiles
  WHERE user_id = p_user_id;

  IF v_xp IS NULL OR v_xp < 10 THEN
    RETURN QUERY SELECT NULL::INTEGER, NULL::INTEGER, NULL::DECIMAL, NULL::DECIMAL;
    RETURN;
  END IF;

  -- Calculate global rank
  SELECT COUNT(*) + 1 INTO rank_global
  FROM user_profiles
  WHERE total_xp > v_xp
    AND is_opted_out_of_leaderboard = false
    AND total_xp >= 10;

  -- Calculate total eligible users
  SELECT COUNT(*) INTO v_total_users
  FROM user_profiles
  WHERE total_xp >= 10
    AND is_opted_out_of_leaderboard = false;

  -- Calculate percentile
  IF v_total_users > 0 THEN
    percentile_global := ROUND(100.0 * (v_total_users - rank_global) / v_total_users, 2);
  END IF;

  -- Calculate country rank if country is set
  IF v_country IS NOT NULL THEN
    SELECT COUNT(*) + 1 INTO rank_country
    FROM user_profiles
    WHERE total_xp > v_xp
      AND country = v_country
      AND is_opted_out_of_leaderboard = false
      AND total_xp >= 10;

    SELECT COUNT(*) INTO v_total_country_users
    FROM user_profiles
    WHERE total_xp >= 10
      AND country = v_country
      AND is_opted_out_of_leaderboard = false;

    IF v_total_country_users > 0 THEN
      percentile_country := ROUND(100.0 * (v_total_country_users - rank_country) / v_total_country_users, 2);
    END IF;
  END IF;

  RETURN QUERY SELECT rank_global, rank_country, percentile_global, percentile_country;
END;
$$;