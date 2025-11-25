-- Add reminder preferences to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email_reminders_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS browser_notifications_enabled BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.email_reminders_enabled IS 'Whether user wants to receive daily email reminders for study tasks';
COMMENT ON COLUMN user_profiles.browser_notifications_enabled IS 'Whether user has enabled browser notifications for study reminders';