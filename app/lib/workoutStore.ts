import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { authStore } from './authStore';
import { supabase } from './supabaseConfig';
import { Workout } from './workouts';

type State = {
  customWorkouts: Workout[];
  savedWorkouts: Workout[];
};

let state: State = { customWorkouts: [], savedWorkouts: [] };
let hydrated = false;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((fn) => fn());
};

const persist = async () => {
  const userId = authStore.getCurrentUserId();
  if (!userId) return;
  
  // Always save to AsyncStorage as immediate fallback
  const localKey = `fitlearn:workouts:${userId}`;
  try {
    await AsyncStorage.setItem(localKey, JSON.stringify({
      customWorkouts: state.customWorkouts,
      savedWorkouts: state.savedWorkouts,
    }));
  } catch (e) {
    console.warn('workoutStore AsyncStorage persist failed', e);
  }
  
  // Also try to save to Supabase
  try {
    const { error } = await supabase
      .from('workouts')
      .upsert({
        user_id: userId,
        custom_workouts: state.customWorkouts,
        saved_workouts: state.savedWorkouts,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.warn('workoutStore supabase persist failed', error);
    }
  } catch (error) {
    console.warn('workoutStore supabase persist failed', error);
  }
};

export const workoutStore = {
  async hydrate(force = false): Promise<State> {
    if (hydrated && !force) return state;
    
    const userId = authStore.getCurrentUserId();
    if (!userId) {
      hydrated = true;
      return state;
    }
    
    const localKey = `fitlearn:workouts:${userId}`;
    let loadedFromLocal = false;
    
    // Try AsyncStorage first (faster)
    try {
      const localData = await AsyncStorage.getItem(localKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        state = {
          customWorkouts: parsed.customWorkouts || [],
          savedWorkouts: parsed.savedWorkouts || [],
        };
        loadedFromLocal = true;
      }
    } catch (e) {
      console.warn('workoutStore AsyncStorage hydrate failed', e);
    }
    
    // Also try Supabase (source of truth if available)
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.warn('workoutStore supabase hydrate failed', error);
      } else if (data) {
        state = {
          customWorkouts: data.custom_workouts || [],
          savedWorkouts: data.saved_workouts || [],
        };
        // Update AsyncStorage with Supabase data
        await AsyncStorage.setItem(localKey, JSON.stringify({
          customWorkouts: state.customWorkouts,
          savedWorkouts: state.savedWorkouts,
        }));
      } else if (!loadedFromLocal) {
        state = { customWorkouts: [], savedWorkouts: [] };
      }
    } catch (error) {
      console.warn('workoutStore supabase hydrate failed', error);
      // If Supabase fails but we have local data, keep using it
    }
    
    hydrated = true;
    notify();
    return state;
  },

  async forceHydrate(): Promise<State> {
    hydrated = false;
    return this.hydrate();
  },

  saveWorkout(workout: Workout) {
    const existingIndex = state.customWorkouts.findIndex((w) => w.id === workout.id);
    if (existingIndex >= 0) {
      // Create new array to trigger React updates
      state.customWorkouts = [
        ...state.customWorkouts.slice(0, existingIndex),
        workout,
        ...state.customWorkouts.slice(existingIndex + 1),
      ];
    } else {
      state.customWorkouts = [...state.customWorkouts, workout];
    }
    persist();
    notify();
  },
  // Save workout to a specific category (for categorized display)
  saveWorkoutToCategory(workout: Workout, category: WorkoutCategory) {
    if (!state.categorizedWorkouts) {
      state.categorizedWorkouts = {};
    }
    if (!state.categorizedWorkouts[category]) {
      state.categorizedWorkouts[category] = [];
    }
    // Avoid duplicates
    if (!state.categorizedWorkouts[category].find((w) => w.id === workout.id)) {
      state.categorizedWorkouts[category].push(workout);
      persist();
      notify();
    }
  },

  deleteWorkout(workoutId: string) {
    state.customWorkouts = state.customWorkouts.filter((w) => w.id !== workoutId);
    persist();
    notify();
  },

  getWorkout(workoutId: string): Workout | undefined {
    return state.customWorkouts.find((w) => w.id === workoutId);
  },

  getCustomWorkouts(): Workout[] {
    return [...state.customWorkouts];
  },

  saveWorkoutToFavorites(workout: Workout) {
    if (!state.savedWorkouts.find((w) => w.id === workout.id)) {
      state.savedWorkouts.push(workout);
      persist();
      notify();
    }
  },

  unsaveWorkout(workoutId: string) {
    state.savedWorkouts = state.savedWorkouts.filter((w) => w.id !== workoutId);
    persist();
    notify();
  },

  isWorkoutSaved(workoutId: string): boolean {
    return state.savedWorkouts.some((w) => w.id === workoutId);
  },

  getSavedWorkouts(): Workout[] {
    return [...state.savedWorkouts];
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
    state = { customWorkouts: [], savedWorkouts: [] };
    hydrated = true;
    
    const userId = authStore.getCurrentUserId();
    if (userId) {
      try {
        await supabase
          .from('workouts')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('workoutStore reset failed', error);
      }
    }
    notify();
  },

  // For compatibility - triggers re-hydration
  setUsername(_username: string | null) {
    hydrated = false;
  },
};

export function useWorkoutStore(): State & { hydrated: boolean } {
  const [snapshot, setSnapshot] = useState<State>(workoutStore.getState());
  const [hydrationReady, setHydrationReady] = useState<boolean>(
    workoutStore.isHydrated()
  );

  useEffect(() => {
    let mounted = true;

    workoutStore.hydrate().then((next) => {
      if (!mounted) return;
      setSnapshot({ ...next });
      setHydrationReady(true);
    });

    const unsubscribe = workoutStore.subscribe(() => {
      const next = workoutStore.getState();
      setSnapshot(next);
      if (!hydrationReady && workoutStore.isHydrated()) {
        setHydrationReady(true);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return Object.assign({}, snapshot, { hydrated: hydrationReady });
}
