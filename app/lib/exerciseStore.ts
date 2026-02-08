import { useEffect, useState } from 'react';
import { authStore } from './authStore';
import { Exercise } from './exercises';
import { supabase } from './supabaseConfig';

type State = {
  customExercises: Exercise[];
};

let state: State = { customExercises: [] };
let hydrated = false;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((fn) => fn());
};

const persist = async () => {
  const userId = authStore.getCurrentUserId();
  if (!userId) return;
  
  try {
    const { error } = await supabase
      .from('exercises')
      .upsert({
        user_id: userId,
        custom_exercises: state.customExercises,
        updated_at: new Date().toISOString(),
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
    if (hydrated) return state;
    
    const userId = authStore.getCurrentUserId();
    if (!userId) {
      hydrated = true;
      return state;
    }
    
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.warn('exerciseStore hydrate failed', error);
      } else if (data) {
        state = {
          customExercises: data.custom_exercises || [],
        };
      } else {
        state = { customExercises: [] };
      }
    } catch (error) {
      console.warn('exerciseStore hydrate failed', error);
    }
    
    hydrated = true;
    notify();
    return state;
  },

  saveExercise(exercise: Exercise) {
    const existingIndex = state.customExercises.findIndex((ex) => ex.id === exercise.id);
    if (existingIndex >= 0) {
      state.customExercises[existingIndex] = exercise;
    } else {
      state.customExercises.push(exercise);
    }
    persist();
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
