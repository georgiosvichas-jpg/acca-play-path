-- Fix search_path for security
DROP FUNCTION IF EXISTS reset_daily_flashcard_counter();
DROP FUNCTION IF EXISTS reset_weekly_mock_counter();

CREATE OR REPLACE FUNCTION reset_daily_flashcard_counter()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles
  SET daily_flashcards_used = 0,
      last_flashcard_reset_date = CURRENT_DATE
  WHERE last_flashcard_reset_date < CURRENT_DATE OR last_flashcard_reset_date IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION reset_weekly_mock_counter()
RETURNS void
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles
  SET weekly_mocks_used = 0,
      last_mock_reset_date = CURRENT_DATE
  WHERE (EXTRACT(DOW FROM CURRENT_DATE) = 1 AND last_mock_reset_date < CURRENT_DATE)
     OR last_mock_reset_date IS NULL;
END;
$$;