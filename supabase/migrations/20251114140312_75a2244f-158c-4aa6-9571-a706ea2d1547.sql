-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop the problematic policy on flags_anti_abuse
DROP POLICY IF EXISTS "Users can view their own flags" ON public.flags_anti_abuse;

-- Create admin-only policy for viewing abuse flags
CREATE POLICY "Only admins can view abuse flags"
ON public.flags_anti_abuse
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin-only policy for updating abuse flags
CREATE POLICY "Only admins can update abuse flags"
ON public.flags_anti_abuse
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin-only policy for deleting abuse flags
CREATE POLICY "Only admins can delete abuse flags"
ON public.flags_anti_abuse
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));