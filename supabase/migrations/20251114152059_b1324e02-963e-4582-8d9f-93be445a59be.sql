-- Fix critical security issues with RLS policies

-- Fix sb_users table policies - CRITICAL: Replace 'true' with proper authentication
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.sb_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.sb_users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.sb_users;

-- The sb_users table needs to be accessible by the service role via edge functions
-- So we keep these policies but make them more restrictive
CREATE POLICY "Service role can manage all sb_users"
ON public.sb_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix sb_study_sessions table policies - CRITICAL: Replace 'true' with proper checks
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.sb_study_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sb_study_sessions;

CREATE POLICY "Service role can manage all sessions"
ON public.sb_study_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix leaderboard_snapshots INSERT policy - restrict to service role only
DROP POLICY IF EXISTS "System can insert leaderboard snapshots" ON public.leaderboard_snapshots;

CREATE POLICY "Only service role can insert leaderboard snapshots"
ON public.leaderboard_snapshots
FOR INSERT
TO service_role
WITH CHECK (true);