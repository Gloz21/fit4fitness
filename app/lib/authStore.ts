import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

// Use AsyncStorage for both web and native (works on all platforms)
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Ignore
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};

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
      const username = await storage.getItem('currentUsername');
      authState = {
        currentUsername: username,
        loading: false,
        hydrated: true,
      };
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
      // Check if username already exists
      const existingUsers = await storage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : {};
      
      const normalizedUsername = username.toLowerCase().trim();
      
      if (users[normalizedUsername]) {
        return { success: false, error: 'Username already exists.' };
      }
      
      // Store new user with normalized username
      users[normalizedUsername] = password;
      await storage.setItem('users', JSON.stringify(users));
      await storage.setItem('currentUsername', normalizedUsername);
      
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
      const existingUsers = await storage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : {};
      
      const normalizedUsername = username.toLowerCase().trim();
      
      // Check if user exists
      if (!users[normalizedUsername]) {
        return { success: false, error: 'User not found. Please sign up first.' };
      }
      
      // Check password
      if (users[normalizedUsername] !== password) {
        return { success: false, error: 'Invalid password.' };
      }
      
      await storage.setItem('currentUsername', normalizedUsername);
      
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
      await storage.removeItem('currentUsername');
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

      const existingUsers = await storage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : {};

      // Verify current password
      if (!users[username] || users[username] !== currentPassword) {
        return { success: false, error: 'Current password is incorrect.' };
      }

      // Update password
      users[username] = newPassword;
      await storage.setItem('users', JSON.stringify(users));

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password change failed.' };
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
    // No cleanup needed for AsyncStorage
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
