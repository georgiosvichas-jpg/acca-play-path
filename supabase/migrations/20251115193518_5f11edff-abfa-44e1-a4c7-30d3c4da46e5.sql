-- Fix mutable search_path in database functions by recreating them with SET search_path

-- Drop and recreate update_sb_users_updated_at with fixed search_path
DROP FUNCTION IF EXISTS public.update_sb_users_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_sb_users_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Recreate trigger for sb_users table
DROP TRIGGER IF EXISTS update_sb_users_updated_at ON public.sb_users;
CREATE TRIGGER update_sb_users_updated_at
BEFORE UPDATE ON public.sb_users
FOR EACH ROW
EXECUTE FUNCTION public.update_sb_users_updated_at();