-- Create security definer function to check opt-out status
CREATE OR REPLACE FUNCTION public.is_opted_out_of_leaderboard(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_opted_out_of_leaderboard, false)
  FROM public.user_profiles
  WHERE user_id = _user_id
$$;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all leaderboard snapshots" ON public.leaderboard_snapshots;

-- Create new policy that respects opt-out preferences
CREATE POLICY "Users can view non-opted-out leaderboard data"
ON public.leaderboard_snapshots
FOR SELECT
USING (NOT public.is_opted_out_of_leaderboard(user_id));