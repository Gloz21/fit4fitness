import { useEffect, useState } from 'react';
import { authStore } from './authStore';
import { Recipe } from './recipes';
import { supabase } from './supabaseConfig';

type State = {
  saved: Recipe[];
};

let state: State = { saved: [] };
let hydrated = false;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((fn) => fn());
};

const persist = async () => {
  const userId = authStore.getCurrentUserEmail();
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('saved_recipes')
      .upsert({
        user_id: userId,
        recipes: state.saved,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Failed to save recipes to Supabase:', error);
    }
  } catch (error) {
    console.warn('recipeStore persist failed', error);
  }
};

export const recipeStore = {
  async hydrate(): Promise<State> {
    if (hydrated) return state;
    
    const userId = authStore.getCurrentUserEmail();
    if (!userId) {
      hydrated = true;
      return state;
    }

    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipes')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load recipes from Supabase:', error);
      }

      if (data && data.recipes) {
        state = { saved: data.recipes as Recipe[] };
      } else {
        state = { saved: [] };
      }
    } catch (error) {
      console.warn('recipeStore hydrate failed', error);
      state = { saved: [] };
    }

    hydrated = true;
    notify();
    return state;
  },

  forceHydrate() {
    hydrated = false;
    return this.hydrate();
  },

  saveRecipe(recipe: Recipe) {
    if (!state.saved.find((r) => r.id === recipe.id)) {
      state.saved.push(recipe);
      persist();
      notify();
    }
  },

  unsaveRecipe(recipeId: string) {
    state.saved = state.saved.filter((r) => r.id !== recipeId);
    persist();
    notify();
  },

  isRecipeSaved(recipeId: string): boolean {
    return state.saved.some((r) => r.id === recipeId);
  },

  getSavedRecipes(): Recipe[] {
    return [...state.saved];
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
    state = { saved: [] };
    hydrated = true;
    
    const userId = authStore.getCurrentUserEmail();
    if (userId) {
      try {
        await supabase
          .from('saved_recipes')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('recipeStore reset failed', error);
      }
    }
    notify();
  },
};

export function useRecipeStore(): State & { hydrated: boolean } {
  const [snapshot, setSnapshot] = useState<State>(recipeStore.getState());
  const [hydrationReady, setHydrationReady] = useState<boolean>(
    recipeStore.isHydrated()
  );

  useEffect(() => {
    let mounted = true;

    recipeStore.hydrate().then((next) => {
      if (!mounted) return;
      setSnapshot({ ...next });
      setHydrationReady(true);
    });

    const unsubscribe = recipeStore.subscribe(() => {
      const next = recipeStore.getState();
      setSnapshot(next);
      if (!hydrationReady && recipeStore.isHydrated()) {
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
