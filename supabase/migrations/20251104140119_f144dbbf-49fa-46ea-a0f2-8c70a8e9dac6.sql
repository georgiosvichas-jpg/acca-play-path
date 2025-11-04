-- Create plan type enum
CREATE TYPE public.plan_type AS ENUM ('free', 'per_paper', 'pro');

-- Add subscription tracking columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN plan_type public.plan_type DEFAULT 'free',
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN subscription_status TEXT,
ADD COLUMN subscription_product_id TEXT,
ADD COLUMN subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN unlocked_papers TEXT[] DEFAULT '{}';

-- Add indexes for faster lookups
CREATE INDEX idx_user_profiles_stripe_customer ON public.user_profiles(stripe_customer_id);
CREATE INDEX idx_user_profiles_plan_type ON public.user_profiles(plan_type);