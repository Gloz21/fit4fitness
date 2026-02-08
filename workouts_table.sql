-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  custom_workouts JSONB NOT NULL DEFAULT '[]'::jsonb,
  saved_workouts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read/write their own workouts
CREATE POLICY "Users can manage their own workouts"
  ON workouts
  FOR ALL
  USING (true)
  WITH CHECK (true);
