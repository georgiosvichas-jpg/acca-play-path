-- Add 'elite' to the plan_type enum
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'elite';

-- The enum now supports: 'free', 'per_paper', 'pro', 'elite'
-- Note: We're keeping 'per_paper' for backwards compatibility with existing data