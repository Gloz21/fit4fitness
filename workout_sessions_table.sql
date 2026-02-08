-- Create the workout_sessions table for persisting workout history
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sessions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT workout_sessions_user_id_key UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own workout sessions
CREATE POLICY "Users can read own workout sessions" ON workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own workout sessions
CREATE POLICY "Users can insert own workout sessions" ON workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own workout sessions
CREATE POLICY "Users can update own workout sessions" ON workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own workout sessions
CREATE POLICY "Users can delete own workout sessions" ON workout_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
