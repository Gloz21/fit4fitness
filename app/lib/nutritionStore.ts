import { useEffect, useState } from 'react';
import { authStore } from './authStore';
import { supabase } from './supabaseConfig';

export type Meal = {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  timestamp?: number;
};

export type NutritionDay = {
  date: string;
  waterIntake: number;
  sleepHours: number;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

type State = {
  [date: string]: NutritionDay;
};

let state: State = {};
let hydrated = false;
const listeners = new Set<() => void>();
let persistTimeout: NodeJS.Timeout | null = null;

// Decimal math adds tiny errors (1.6 + 1.6 + 1.6 = 4.800000000000001), so every
// total is rounded: calories to whole numbers, macros to one decimal place.
export const roundCalories = (n: number) => Math.round(Number(n) || 0);
export const roundMacro = (n: number) => Math.round((Number(n) || 0) * 10) / 10;

const cleanTotals = (day: NutritionDay) => {
  day.totalCalories = Math.max(0, roundCalories(day.totalCalories));
  day.totalProtein = Math.max(0, roundMacro(day.totalProtein));
  day.totalCarbs = Math.max(0, roundMacro(day.totalCarbs));
  day.totalFat = Math.max(0, roundMacro(day.totalFat));
};

const cleanMeal = (meal: Meal): Meal => ({
  ...meal,
  calories: roundCalories(meal.calories),
  protein: roundMacro(meal.protein || 0),
  carbs: roundMacro(meal.carbs || 0),
  fat: roundMacro(meal.fat || 0),
});

const notify = () => {
  listeners.forEach((fn) => fn());
};

const persist = async () => {
  // Runs before notify() in every update, so the screen only ever sees rounded totals
  Object.values(state).forEach(cleanTotals);
  const userId = authStore.getCurrentUserId();
  if (!userId) {
    console.log('⚠️ persist: no userId, skipping');
    return;
  }
  
  // Clear any pending persist
  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }
  
  // Debounce persist calls to avoid race conditions
  persistTimeout = setTimeout(async () => {
    const today = getTodayDate();
    const todayData = state[today];
    const dataToSave = `Cal: ${todayData?.totalCalories || 0}, P: ${todayData?.totalProtein || 0}g, C: ${todayData?.totalCarbs || 0}g, F: ${todayData?.totalFat || 0}g`;
    
    console.log('💾 persist: Starting save to Supabase...', JSON.stringify(state, null, 2));
    try {
      const { error } = await supabase
        .from('nutrition')
        .upsert({
          user_id: userId,
          nutrition_data: state,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('❌ Nutrition persist failed:', error);
      } else {
        console.log('✅ Nutrition persist successful');
      }
    } catch (error) {
      console.error('❌ Nutrition persist exception:', error);
    }
  }, 500); // Wait 500ms before persisting to batch updates
};

const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const ensureTodayExists = () => {
  const today = getTodayDate();
  if (!state[today]) {
    state[today] = {
      date: today,
      waterIntake: 0,
      sleepHours: 0,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    };
  }
};

export const nutritionStore = {
  async hydrate(force = false) {
    console.log('🔄 nutrition hydrate: force=', force, 'hydrated=', hydrated);
    
    if (hydrated && !force) {
      console.log('⚠️ nutrition hydrate: skipping (already hydrated)');
      return state;
    }
    
    const userId = authStore.getCurrentUserId();
    if (!userId) {
      hydrated = true;
      return state;
    }
    
    try {
      const { data, error } = await supabase
        .from('nutrition')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Nutrition hydrate failed:', error);
      } else if (data && data.nutrition_data) {
        state = data.nutrition_data;
        
        // Migration: add totalCalories if missing (from old data structure)
        Object.keys(state).forEach((date) => {
          if (state[date].totalCalories === undefined) {
            // Calculate from meals if it exists in old format
            const caloriesFromMeals = state[date].meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
            state[date].totalCalories = caloriesFromMeals;
            console.log(`📦 Migrated ${date}: totalCalories = ${caloriesFromMeals}`);
          }
          // Fix totals saved before rounding was added (e.g. 4.800000000000001)
          state[date].meals = (state[date].meals || []).map(cleanMeal);
          cleanTotals(state[date]);
        });
      } else {
        // Reset state for new user
        state = {};
      }
    } catch (error) {
      console.error('Nutrition hydrate exception:', error);
    }
    
    hydrated = true;
    ensureTodayExists();
    notify();
    return state;
  },

  addWater(ml: number, date?: string) {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) {
      state[targetDate] = {
        date: targetDate,
        waterIntake: 0,
        sleepHours: 0,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    }
    state[targetDate].waterIntake += ml;

    // Award 10 XP for each glass (250ml) of water added
    try {
      const { userStore } = require('./userStore');
      const userProfile = userStore.getState().profile;
      if (userProfile) {
        const prevXP = userProfile.xp || 0;
        const prevLevel = userProfile.level || 1;
        // Calculate how many glasses were added
        const glassesAdded = Math.floor(ml / 250);
        if (glassesAdded > 0) {
          const xpToAdd = glassesAdded * 10;
          const newXP = prevXP + xpToAdd;
          const newLevel = prevLevel + Math.floor(newXP / 100) - Math.floor(prevXP / 100);
          userStore.setProfile({
            ...userProfile,
            xp: newXP,
            level: newLevel,
          });
        }
      }
    } catch (e) {
      // Fail silently if userStore is not available
    }

    persist();
    notify();
  },

  logSleep(hours: number, date?: string) {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) {
      state[targetDate] = {
        date: targetDate,
        waterIntake: 0,
        sleepHours: 0,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    }
    state[targetDate].sleepHours = hours;
    persist();
    notify();
  },

  addMeal(meal: Meal, date?: string) {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) {
      state[targetDate] = {
        date: targetDate,
        waterIntake: 0,
        sleepHours: 0,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    }
    meal = cleanMeal(meal);
    const mealWithTimestamp = {
      ...meal,
      timestamp: meal.timestamp || Date.now(),
    };
    state[targetDate].meals.push(mealWithTimestamp);
    state[targetDate].totalCalories += meal.calories || 0;
    state[targetDate].totalProtein += meal.protein || 0;
    state[targetDate].totalCarbs += meal.carbs || 0;
    state[targetDate].totalFat += meal.fat || 0;
    persist();
    notify();
  },

  removeMeal(mealIndex: number, date?: string) {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) return;

    const meal = state[targetDate].meals[mealIndex];
    if (meal) {
      state[targetDate].totalCalories = Math.max(0, (state[targetDate].totalCalories || 0) - (meal.calories || 0));
      state[targetDate].totalProtein = Math.max(0, (state[targetDate].totalProtein || 0) - (meal.protein || 0));
      state[targetDate].totalCarbs = Math.max(0, (state[targetDate].totalCarbs || 0) - (meal.carbs || 0));
      state[targetDate].totalFat = Math.max(0, (state[targetDate].totalFat || 0) - (meal.fat || 0));
      state[targetDate].meals.splice(mealIndex, 1);
      persist();
      notify();
    }
  },

  updateMeal(mealIndex: number, meal: Meal, date?: string) {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) return;

    const oldMeal = state[targetDate].meals[mealIndex];
    meal = cleanMeal(meal);
    if (oldMeal) {
      state[targetDate].totalProtein -= oldMeal.protein || 0;
      state[targetDate].totalCarbs -= oldMeal.carbs || 0;
      state[targetDate].totalFat -= oldMeal.fat || 0;

      state[targetDate].meals[mealIndex] = {
        ...meal,
        timestamp: meal.timestamp || oldMeal.timestamp,
      };

      state[targetDate].totalProtein += meal.protein || 0;
      state[targetDate].totalCarbs += meal.carbs || 0;
      state[targetDate].totalFat += meal.fat || 0;
      persist();
      notify();
    }
  },

  getMealTotal(date?: string): number {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) return 0;
    return state[targetDate].meals.reduce((sum, meal) => sum + meal.calories, 0);
  },

  getWaterIntake(date?: string): number {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) return 0;
    return state[targetDate].waterIntake;
  },

  getSleepHours(date?: string): number {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) return 0;
    return state[targetDate].sleepHours;
  },

  getDayData(date?: string): NutritionDay | null {
    const targetDate = date || getTodayDate();
    return state[targetDate] || null;
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

  updateManualMacros(calories: number, protein: number, carbs: number, fat: number, date?: string) {
    const targetDate = date || getTodayDate();
    ensureTodayExists();
    
    // Store macros directly - no meals array needed for manual tracking
    state[targetDate].totalCalories = calories;
    state[targetDate].totalProtein = protein;
    state[targetDate].totalCarbs = carbs;
    state[targetDate].totalFat = fat;
    
    console.log(`💾 Saving macros for ${targetDate}:`, { calories, protein, carbs, fat });
    persist();
    notify();
  },

  updateCalories(calories: number, date?: string) {
    const targetDate = date || getTodayDate();
    ensureTodayExists();
    state[targetDate].totalCalories = calories;
    persist();
    notify();
  },

  updateProtein(protein: number, date?: string) {
    const targetDate = date || getTodayDate();
    ensureTodayExists();
    state[targetDate].totalProtein = protein;
    persist();
    notify();
  },

  updateCarbs(carbs: number, date?: string) {
    const targetDate = date || getTodayDate();
    ensureTodayExists();
    state[targetDate].totalCarbs = carbs;
    persist();
    notify();
  },

  updateFat(fat: number, date?: string) {
    const targetDate = date || getTodayDate();
    ensureTodayExists();
    state[targetDate].totalFat = fat;
    persist();
    notify();
  },

  resetMacros(date?: string) {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) return;
    
    // Remove manual entry if it exists
    const manualIndex = state[targetDate].meals.findIndex(m => m.name === 'Manual Entry');
    if (manualIndex >= 0) {
      const meal = state[targetDate].meals[manualIndex];
      state[targetDate].totalProtein -= meal.protein || 0;
      state[targetDate].totalCarbs -= meal.carbs || 0;
      state[targetDate].totalFat -= meal.fat || 0;
      state[targetDate].meals.splice(manualIndex, 1);
    }
    
    persist();
    notify();
  },

  resetWater(date?: string) {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) return;
    state[targetDate].waterIntake = 0;
    persist();
    notify();
  },

  resetSleep(date?: string) {
    const targetDate = date || getTodayDate();
    if (!state[targetDate]) return;
    state[targetDate].sleepHours = 0;
    persist();
    notify();
  },

  async reset() {
    state = {};
    hydrated = false;
    ensureTodayExists();
    
    const userId = authStore.getCurrentUserId();
    if (userId) {
      try {
        await supabase
          .from('nutrition')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('nutritionStore reset failed', error);
      }
    }
    notify();
  },

  invalidate() {
    hydrated = false;
  },

  // For compatibility - triggers re-hydration
  setUsername(_username: string | null) {
    hydrated = false;
  },
};

export function useNutritionStore(): State & { hydrated: boolean } {
  const [snapshot, setSnapshot] = useState<State>(nutritionStore.getState());
  const [hydrationReady, setHydrationReady] = useState<boolean>(
    nutritionStore.isHydrated()
  );

  useEffect(() => {
    let mounted = true;

    nutritionStore.hydrate(true).then((next) => {
      if (!mounted) return;
      setSnapshot({ ...next });
      setHydrationReady(true);
    });

    const unsubscribe = nutritionStore.subscribe(() => {
      const next = nutritionStore.getState();
      setSnapshot(next);
      if (!hydrationReady && nutritionStore.isHydrated()) {
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
