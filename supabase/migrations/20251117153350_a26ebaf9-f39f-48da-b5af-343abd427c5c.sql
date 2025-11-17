-- Fix search_path for update_question_reviews_updated_at function
DROP TRIGGER IF EXISTS update_question_reviews_updated_at_trigger ON question_reviews;
DROP FUNCTION IF EXISTS update_question_reviews_updated_at();

CREATE OR REPLACE FUNCTION update_question_reviews_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_question_reviews_updated_at_trigger
  BEFORE UPDATE ON question_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_question_reviews_updated_at();