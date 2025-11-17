-- Insert achievement badges for study milestones
INSERT INTO badges (badge_name, description, criteria_type, criteria_value, icon, tier) VALUES
  ('10 Day Streak', 'Maintained a 10-day study streak', 'streak', 10, 'Flame', 'bronze'),
  ('100 Questions Mastered', 'Answered 100 questions correctly', 'questions_correct', 100, 'Brain', 'silver'),
  ('Unit Master - BT', 'Achieved 90% accuracy in any BT unit', 'unit_accuracy', 90, 'Trophy', 'gold'),
  ('30 Day Warrior', 'Maintained a 30-day study streak', 'streak', 30, 'Flame', 'silver'),
  ('500 Questions Expert', 'Answered 500 questions correctly', 'questions_correct', 500, 'Brain', 'gold'),
  ('Perfectionist', 'Achieved 100% accuracy in a quiz', 'perfect_quiz', 1, 'Star', 'gold')
ON CONFLICT (badge_name) DO NOTHING;