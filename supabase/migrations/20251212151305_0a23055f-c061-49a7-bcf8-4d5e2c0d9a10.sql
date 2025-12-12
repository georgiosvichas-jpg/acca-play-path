-- Create function for truly random question sampling
CREATE OR REPLACE FUNCTION get_random_questions(
  p_paper TEXT,
  p_size INT,
  p_unit_code TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_difficulty TEXT DEFAULT NULL
) RETURNS SETOF sb_questions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM sb_questions
  WHERE paper = p_paper
    AND (p_unit_code IS NULL OR unit_code = p_unit_code)
    AND (p_type IS NULL OR type = p_type)
    AND (p_difficulty IS NULL OR difficulty = p_difficulty)
    AND is_active = true
  ORDER BY random()
  LIMIT p_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;