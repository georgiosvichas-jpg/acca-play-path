-- Create study_paths table for storing AI-generated study plans
CREATE TABLE IF NOT EXISTS public.study_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exam_date DATE NOT NULL,
  weeks_duration INTEGER NOT NULL,
  path_data JSONB NOT NULL,
  progress JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_paths ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own study paths"
  ON public.study_paths
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study paths"
  ON public.study_paths
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study paths"
  ON public.study_paths
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study paths"
  ON public.study_paths
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_study_paths_user_active ON public.study_paths(user_id, is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_study_paths_updated_at
  BEFORE UPDATE ON public.study_paths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();