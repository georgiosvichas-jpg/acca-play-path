-- Enable realtime updates for user_profiles table
ALTER TABLE user_profiles REPLICA IDENTITY FULL;

-- Add user_profiles to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;