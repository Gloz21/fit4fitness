import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { WorkoutSession } from '../components/WorkoutExecutor';
import { authStore } from './authStore';
import { supabase } from './supabaseConfig';

type State = {
  sessions: WorkoutSession[];
};

let state: State = { sessions: [] };
let hydrated = false;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((fn) => fn());
};

const persist = async () => {
  const userId = authStore.getCurrentUserId();
  if (!userId) {
    // Fallback to AsyncStorage if no user
    try {
      await AsyncStorage.setItem('fitlearn:workoutsessions:guest', JSON.stringify(state));
    } catch (error) {
      console.warn('workoutSessionStore AsyncStorage persist failed', error);
    }
    return;
  }
  
  try {
    const { error } = await supabase
      .from('workout_sessions')
      .upsert({
        user_id: userId,
        sessions: state.sessions,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.warn('workoutSessionStore persist failed', error);
      // Fallback to AsyncStorage
      await AsyncStorage.setItem(`fitlearn:workoutsessions:${userId}`, JSON.stringify(state));
    }
  } catch (error) {
    console.warn('workoutSessionStore persist failed', error);
    // Fallback to AsyncStorage
    const userId = authStore.getCurrentUserId();
    await AsyncStorage.setItem(`fitlearn:workoutsessions:${userId || 'guest'}`, JSON.stringify(state));
  }
};

export const workoutSessionStore = {
  async hydrate(): Promise<State> {
    if (hydrated) return state;
    
    const userId = authStore.getCurrentUserId();
    
    if (!userId) {
      // Try AsyncStorage for guest
      try {
        const raw = await AsyncStorage.getItem('fitlearn:workoutsessions:guest');
        if (raw) {
          state = JSON.parse(raw) as State;
        }
      } catch (error) {
        console.warn('workoutSessionStore AsyncStorage hydrate failed', error);
      }
      hydrated = true;
      notify();
      return state;
    }
    
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.warn('workoutSessionStore hydrate failed', error);
        // Try AsyncStorage fallback
        const raw = await AsyncStorage.getItem(`fitlearn:workoutsessions:${userId}`);
        if (raw) {
          state = JSON.parse(raw) as State;
        }
      } else if (data) {
        state = { sessions: data.sessions || [] };
      }
    } catch (error) {
      console.warn('workoutSessionStore hydrate failed', error);
      // Try AsyncStorage fallback
      const raw = await AsyncStorage.getItem(`fitlearn:workoutsessions:${userId}`);
      if (raw) {
        state = JSON.parse(raw) as State;
      }
    }
    
    hydrated = true;
    notify();
    return state;
  },

  saveSession(session: WorkoutSession) {
    state.sessions.unshift(session); // Add to beginning for chronological order
    persist();
    notify();
  },

  getSessions(): WorkoutSession[] {
    return [...state.sessions];
  },

  getSessionsByWorkout(workoutId: string): WorkoutSession[] {
    return state.sessions.filter((s) => s.workoutId === workoutId);
  },

  getRecentSessions(limit: number = 10): WorkoutSession[] {
    return state.sessions.slice(0, limit);
  },

  getState(): State {
    return { ...state };
  },

  isHydrated() {
    return hydrated;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async reset() {
    state = { sessions: [] };
    hydrated = true;
    const userId = authStore.getCurrentUserId();
    
    try {
      if (userId) {
        await supabase
          .from('workout_sessions')
          .delete()
          .eq('user_id', userId);
        await AsyncStorage.removeItem(`fitlearn:workoutsessions:${userId}`);
      } else {
        await AsyncStorage.removeItem('fitlearn:workoutsessions:guest');
      }
    } catch (error) {
      console.warn('workoutSessionStore reset failed', error);
    }
    notify();
  },
};

export function useWorkoutSessionStore(): State & { hydrated: boolean } {
  const [snapshot, setSnapshot] = useState<State>(workoutSessionStore.getState());
  const [hydrationReady, setHydrationReady] = useState<boolean>(
    workoutSessionStore.isHydrated()
  );

  useEffect(() => {
    let mounted = true;

    workoutSessionStore.hydrate().then((next) => {
      if (!mounted) return;
      setSnapshot({ ...next });
      setHydrationReady(true);
    });

    const unsubscribe = workoutSessionStore.subscribe(() => {
      const next = workoutSessionStore.getState();
      setSnapshot(next);
      if (!hydrationReady && workoutSessionStore.isHydrated()) {
        setHydrationReady(true);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [hydrationReady]);

  return Object.assign({}, snapshot, { hydrated: hydrationReady });
}
