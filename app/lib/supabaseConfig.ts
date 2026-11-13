import AsyncStorage from '@react-native-async-storage/async-storage';
import { processLock } from '@supabase/auth-js';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// The anon key is public by design. User data is protected by Row Level Security
// policies in Supabase (see supabase/migrations), not by keeping this key secret.
const supabaseUrl = 'https://vsakkuoklcmmandnjsnn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYWtrdW9rbGNtbWFuZG5qc25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNzQ4MTcsImV4cCI6MjA4MzY1MDgxN30.kuCQGuLhuTNqlVLCJ1zygsuH6ffqcarCThOadJk3OnM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Keep the login on the device so users stay signed in between launches
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // In-app lock: on web the default browser lock times out with an uncaught
    // "signal is aborted" error when several session checks start at once
    lock: processLock,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Only refresh the session while the app is open, as Supabase recommends for React Native
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
