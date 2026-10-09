import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { authStore } from './authStore';
import { Exercise } from './exercises';
import { supabase } from './supabaseConfig';

type State = {
  customExercises: Exercise[];
};

let state: State = { customExercises: [] };
let hydrated = false;
let hydratedUserId: string | null = null;
let hydrating: Promise<State> | null = null;

// Kept on the device too: the Supabase `exercises` table may not exist, and the
// local copy means custom exercises survive restarts either way.
const localKey = (userId: string) => `exercises_${userId}`;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((fn) => fn());
};

const persist = async () => {
  const userId = authStore.getCurrentUserId();
  if (!userId) return;

  try {
    await AsyncStorage.setItem(localKey(userId), JSON.stringify(state.customExercises));
  } catch {
    // Local save is best effort
  }

  try {
    const { error } = await supabase
      .from('exercises')
      .upsert({
        user_id: userId,
        custom_exercises: state.customExercises,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
    
    if (error) {
      console.warn('exerciseStore persist failed', error);
    }
  } catch (error) {
    console.warn('exerciseStore persist failed', error);
  }
};

export const exerciseStore = {
  async hydrate(): Promise<State> {
    const userId = authStore.getCurrentUserId();
    if (hydrated && hydratedUserId === userId) return state;
    if (hydrating) return hydrating;

    hydrating = (async () => {
      state = { customExercises: [] };
      if (userId) {
        let local: Exercise[] | null = null;
        try {
          const saved = await AsyncStorage.getItem(localKey(userId));
          if (saved) local = JSON.parse(saved);
        } catch {
          // Ignore and fall back to Supabase
        }
        if (local) state = { customExercises: local };

        try {
          const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('user_id', userId)
            .single();
          if (!error && data?.custom_exercises) {
            state = { customExercises: data.custom_exercises };
          }
        } catch {
          // Offline or table missing: the local copy is used
        }
      }
      hydrated = true;
      hydratedUserId = userId;
      hydrating = null;
      notify();
      return state;
    })();
    return hydrating;
  },

  /** Saves after loading the existing list, so a save can't overwrite exercises that weren't loaded yet. */
  async saveExercise(exercise: Exercise) {
    await exerciseStore.hydrate();
    const existingIndex = state.customExercises.findIndex((ex) => ex.id === exercise.id);
    if (existingIndex >= 0) {
      state.customExercises[existingIndex] = exercise;
    } else {
      state.customExercises.push(exercise);
    }
    persist();
    notify();
  },

  /** Drops the in-memory list on logout (saved data is kept). */
  clear() {
    state = { customExercises: [] };
    hydrated = false;
    hydratedUserId = null;
    notify();
  },

  deleteExercise(exerciseId: string) {
    state.customExercises = state.customExercises.filter((ex) => ex.id !== exerciseId);
    persist();
    notify();
  },

  getExercise(exerciseId: string): Exercise | undefined {
    return state.customExercises.find((ex) => ex.id === exerciseId);
  },

  getCustomExercises(): Exercise[] {
    return [...state.customExercises];
  },

  getExercisesByCategory(category: Exercise['category']): Exercise[] {
    return state.customExercises.filter((ex) => ex.category === category);
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
    state = { customExercises: [] };
    hydrated = true;
    
    const userId = authStore.getCurrentUserId();
    if (userId) {
      try {
        await supabase
          .from('exercises')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('exerciseStore reset failed', error);
      }
    }
    notify();
  },

  // For compatibility - triggers re-hydration
  setUsername(_username: string | null) {
    hydrated = false;
  },
};

export function useExerciseStore(): State & { hydrated: boolean } {
  const [snapshot, setSnapshot] = useState<State>(exerciseStore.getState());
  const [hydrationReady, setHydrationReady] = useState<boolean>(
    exerciseStore.isHydrated()
  );

  useEffect(() => {
    let mounted = true;

    exerciseStore.hydrate().then((next) => {
      if (!mounted) return;
      setSnapshot({ ...next });
      setHydrationReady(true);
    });

    const unsubscribe = exerciseStore.subscribe(() => {
      const next = exerciseStore.getState();
      setSnapshot(next);
      if (!hydrationReady && exerciseStore.isHydrated()) {
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
