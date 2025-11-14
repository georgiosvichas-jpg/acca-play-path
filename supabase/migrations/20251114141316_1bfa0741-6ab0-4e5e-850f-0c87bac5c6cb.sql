-- Fix abuse flags INSERT policy to prevent spam
-- Only admins can create abuse flags
DROP POLICY IF EXISTS "System can insert flags" ON public.flags_anti_abuse;

CREATE POLICY "Only admins can create abuse flags"
ON public.flags_anti_abuse
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));