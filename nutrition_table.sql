-- Create nutrition tracking table
CREATE TABLE IF NOT EXISTS nutrition (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  nutrition_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE nutrition ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access (you can make this more restrictive later)
CREATE POLICY "Allow all access to nutrition" 
  ON nutrition 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nutrition_user_id ON nutrition(user_id);
