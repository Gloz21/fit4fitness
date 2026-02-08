import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your Supabase project credentials
// Get these from: https://supabase.com/dashboard/project/_/settings/api
const supabaseUrl = 'https://vsakkuoklcmmandnjsnn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYWtrdW9rbGNtbWFuZG5qc25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNzQ4MTcsImV4cCI6MjA4MzY1MDgxN30.kuCQGuLhuTNqlVLCJ1zygsuH6ffqcarCThOadJk3OnM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    }
  }
});
