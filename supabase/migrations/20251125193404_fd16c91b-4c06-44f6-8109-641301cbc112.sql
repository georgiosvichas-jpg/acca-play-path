-- Fix search_path for topic_performance trigger function
DROP FUNCTION IF EXISTS update_topic_performance_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_topic_performance_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.accuracy_percentage = CASE 
    WHEN NEW.questions_attempted > 0 
    THEN ROUND((NEW.questions_correct::NUMERIC / NEW.questions_attempted::NUMERIC) * 100, 2)
    ELSE 0
  END;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_update_topic_performance
  BEFORE UPDATE ON public.topic_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_performance_updated_at();