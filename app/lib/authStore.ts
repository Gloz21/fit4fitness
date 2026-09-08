import React from 'react';
import { supabase } from './supabaseConfig';

// Convert username to a fake email for Supabase Auth
// Users type a username, we internally use username@fit4fitness.app
function usernameToEmail(username: string): string {
  return `${username.toLowerCase().trim()}@fit4fitness.app`;
}

// Extract username from fake email
function emailToUsername(email: string): string {
  return email.replace('@fit4fitness.app', '');
}

interface AuthState {
  currentUsername: string | null;
  loading: boolean;
  hydrated: boolean;
}

let authState: AuthState = {
  currentUsername: null,
  loading: true,
  hydrated: false,
};

const listeners: Set<(state: AuthState) => void> = new Set();

export const authStore = {
  async hydrate() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        authState = {
          currentUsername: emailToUsername(session.user.email),
          loading: false,
          hydrated: true,
        };
      } else {
        authState = {
          currentUsername: null,
          loading: false,
          hydrated: true,
        };
      }
      this.notify();
    } catch (error) {
      authState = {
        currentUsername: null,
        loading: false,
        hydrated: true,
      };
      this.notify();
    }
  },

  async signup(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const email = usernameToEmail(username);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        // Make error messages user-friendly
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Username already exists.' };
        }
        return { success: false, error: error.message };
      }
      
      if (!data.user) {
        return { success: false, error: 'Sign up failed. Please try again.' };
      }
      
      const normalizedUsername = username.toLowerCase().trim();
      authState = {
        currentUsername: normalizedUsername,
        loading: false,
        hydrated: true,
      };
      this.notify();
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign up failed.' };
    }
  },

  async signin(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const email = usernameToEmail(username);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Incorrect username or password.' };
        }
        return { success: false, error: error.message };
      }
      
      if (!data.user) {
        return { success: false, error: 'Sign in failed. Please try again.' };
      }
      
      const normalizedUsername = username.toLowerCase().trim();
      authState = {
        currentUsername: normalizedUsername,
        loading: false,
        hydrated: true,
      };
      this.notify();
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign in failed.' };
    }
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      authState = {
        currentUsername: null,
        loading: false,
        hydrated: true,
      };
      this.notify();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const username = authState.currentUsername;
      if (!username) {
        return { success: false, error: 'Not logged in.' };
      }

      // Verify current password by trying to sign in
      const email = usernameToEmail(username);
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      
      if (verifyError) {
        return { success: false, error: 'Current password is incorrect.' };
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) {
        return { success: false, error: updateError.message || 'Password change failed.' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password change failed.' };
    }
  },

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const username = authState.currentUsername;
      if (!username) {
        return { success: false, error: 'Not logged in.' };
      }

      // Delete user data from all Supabase tables
      const userId = username;
      await Promise.allSettled([
        supabase.from('user_profiles').delete().eq('user_id', userId),
        supabase.from('nutrition').delete().eq('user_id', userId),
        supabase.from('workouts').delete().eq('user_id', userId),
        supabase.from('workout_sessions').delete().eq('user_id', userId),
        supabase.from('exercises').delete().eq('user_id', userId),
        supabase.from('saved_recipes').delete().eq('user_id', userId),
      ]);

      // Sign out the user
      await supabase.auth.signOut();

      authState = {
        currentUsername: null,
        loading: false,
        hydrated: true,
      };
      this.notify();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Account deletion failed.' };
    }
  },

  isLoggedIn(): boolean {
    return authState.currentUsername !== null;
  },

  getCurrentUsername(): string | null {
    return authState.currentUsername;
  },

  getCurrentUserEmail(): string | null {
    return authState.currentUsername;
  },

  getCurrentUserId(): string | null {
    return authState.currentUsername;
  },

  getState(): AuthState {
    return { ...authState };
  },

  subscribe(listener: (state: AuthState) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify() {
    listeners.forEach((listener) => listener({ ...authState }));
  },

  cleanup() {
    // No cleanup needed
  },
};

// Hook for React components
export function useAuthStore() {
  const [state, setState] = React.useState(authState);

  React.useEffect(() => {
    authStore.hydrate();
  }, []);

  React.useEffect(() => {
    return authStore.subscribe((newState) => setState(newState));
  }, []);

  return state;
}
