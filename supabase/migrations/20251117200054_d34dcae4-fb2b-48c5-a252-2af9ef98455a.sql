-- Add usage tracking columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS daily_flashcards_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_flashcard_reset_date DATE,
ADD COLUMN IF NOT EXISTS weekly_mocks_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_mock_reset_date DATE,
ADD COLUMN IF NOT EXISTS total_mocks_completed INTEGER DEFAULT 0;

-- Create function to reset daily flashcard counter
CREATE OR REPLACE FUNCTION reset_daily_flashcard_counter()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET daily_flashcards_used = 0,
      last_flashcard_reset_date = CURRENT_DATE
  WHERE last_flashcard_reset_date < CURRENT_DATE OR last_flashcard_reset_date IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset weekly mock counter (every Monday)
CREATE OR REPLACE FUNCTION reset_weekly_mock_counter()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET weekly_mocks_used = 0,
      last_mock_reset_date = CURRENT_DATE
  WHERE (EXTRACT(DOW FROM CURRENT_DATE) = 1 AND last_mock_reset_date < CURRENT_DATE)
     OR last_mock_reset_date IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;