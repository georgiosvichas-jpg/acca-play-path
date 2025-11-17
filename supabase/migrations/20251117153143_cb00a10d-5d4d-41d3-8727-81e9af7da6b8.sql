-- Create table for spaced repetition tracking
CREATE TABLE IF NOT EXISTS question_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL,
  last_reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_review_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 1,
  repetitions INTEGER NOT NULL DEFAULT 0,
  times_seen INTEGER NOT NULL DEFAULT 1,
  times_correct INTEGER NOT NULL DEFAULT 0,
  times_incorrect INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE question_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reviews"
  ON question_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews"
  ON question_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON question_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON question_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_question_reviews_user_next_review 
  ON question_reviews(user_id, next_review_at);

CREATE INDEX idx_question_reviews_user_question 
  ON question_reviews(user_id, question_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_question_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_reviews_updated_at_trigger
  BEFORE UPDATE ON question_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_question_reviews_updated_at();