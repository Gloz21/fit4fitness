import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { authStore } from './authStore';
import { supabase } from './supabaseConfig';

// Level system helpers - each level requires (level * 100) XP
// Level 2 = 200 XP, Level 3 = 300 XP, etc.
// Total XP for level N = 100 * (1 + 2 + ... + N) = 100 * N * (N + 1) / 2

// Calculate cumulative XP needed to reach a given level
export const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // Sum of 200 + 300 + ... + (level * 100) = 100 * (2 + 3 + ... + level)
  // = 100 * ((level * (level + 1) / 2) - 1)
  return 100 * ((level * (level + 1)) / 2 - 1);
};

// Calculate what level you are at given total XP
export const getLevelFromXP = (totalXP: number): number => {
  // Solve: 100 * ((level * (level + 1)) / 2 - 1) <= totalXP
  // Simplify: level^2 + level - 2 <= totalXP / 50
  // Use quadratic formula: level = (-1 + sqrt(1 + 4 * (totalXP/50 + 2))) / 2
  if (totalXP < 200) return 1; // Need 200 XP for level 2
  const discriminant = 1 + 4 * (totalXP / 50 + 2);
  const level = Math.floor((-1 + Math.sqrt(discriminant)) / 2);
  return Math.max(1, level);
};

// Get XP needed to reach next level from current level
export const getXPNeededForNextLevel = (currentLevel: number): number => {
  return (currentLevel + 1) * 100;
};

// Get progress towards next level (0 to 1)
export const getLevelProgress = (totalXP: number): number => {
  const currentLevel = getLevelFromXP(totalXP);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  return Math.min(xpInCurrentLevel / xpNeededForNext, 1);
};

// Get XP remaining to reach next level
export const getXPToNextLevel = (totalXP: number): number => {
  const currentLevel = getLevelFromXP(totalXP);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  return xpForNextLevel - totalXP;
};

export type UserProfile = {
  age?: number;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  gender?: string;
  activity?: string;
  targetDays?: number;
  goal?: string;
  calorieTarget?: number;
  xp?: number;
  level?: number;
};

type State = {
  goal?: string;
  profile: UserProfile;
  onboardingComplete?: boolean;
};

let state: State = {
  goal: undefined,
  profile: {},
  onboardingComplete: false,
};

let hydrated = false;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((fn) => fn());
};

// Helper to save to AsyncStorage as backup
const saveToAsyncStorage = async (userId: string) => {
  try {
    await AsyncStorage.setItem(`user_${userId}_profile`, JSON.stringify({
      goal: state.goal,
      profile: state.profile,
      onboardingComplete: state.onboardingComplete,
    }));
  } catch (e) {
    // Ignore storage errors
  }
};

// Helper to load from AsyncStorage
const loadFromAsyncStorage = async (userId: string): Promise<State | null> => {
  try {
    const stored = await AsyncStorage.getItem(`user_${userId}_profile`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore storage errors
  }
  return null;
};

const persist = async () => {
  const userId = authStore.getCurrentUserId();
  
  if (!userId) {
    return;
  }
  
  // Always save to AsyncStorage as backup
  await saveToAsyncStorage(userId);
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        goal: state.goal,
        profile: state.profile,
        onboarding_complete: state.onboardingComplete,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error('userStore persist failed:', error);
    }
  } catch (error: any) {
    console.error('userStore persist exception:', error);
  }
};

export const calculateBMR = (
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string
): number => {
  if (gender === 'Female') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  // Male or Other
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
};

export const getActivityMultiplier = (activity: string): number => {
  switch (activity) {
    case 'Sedentary':
      return 1.2;
    case 'Light (1–3x/week)':
      return 1.375;
    case 'Moderate (3–5x/week)':
      return 1.55;
    case 'Very Active (5–7x/week)':
      return 1.725;
    default:
      return 1.2;
  }
};

export const getGoalAdjustment = (goal: string): number => {
  switch (goal) {
    case 'weight-loss':
      return -500;
    case 'muscle-gain':
      return 300;
    case 'performance':
      return 0;
    case 'recomposition':
      return -200;
    default:
      return 0;
  }
};

export const calculateCalories = (
  weightKg?: number,
  heightCm?: number,
  age?: number,
  gender?: string,
  activity?: string,
  goal?: string,
  targetWeightKg?: number,
  targetDays?: number
): number => {
  if (!weightKg || !heightCm || !age || !gender || !activity) {
    return 2000;
  }

  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const activityMultiplier = getActivityMultiplier(activity);
  const tdee = bmr * activityMultiplier;
  
  let goalAdjustment = goal ? getGoalAdjustment(goal) : 0;
  
  // If target weight and days are provided, calculate a more precise adjustment
  if (targetWeightKg && targetDays && targetWeightKg !== weightKg) {
    const weightDifferenceKg = targetWeightKg - weightKg;
    // 1 kg of body weight ≈ 7700 calories
    const totalCalorieDifference = weightDifferenceKg * 7700;
    // Daily calorie adjustment needed
    const dailyAdjustment = totalCalorieDifference / targetDays;
    
    // Use the calculated adjustment instead of the fixed goal adjustment
    goalAdjustment = Math.round(dailyAdjustment);
    
    // Safety limits: don't go below -1000 or above +500 cal/day
    goalAdjustment = Math.max(-1000, Math.min(500, goalAdjustment));
  }
  
  const calorieTarget = Math.max(1200, tdee + goalAdjustment);

  return Math.round(calorieTarget);
};

export const userStore = {
  async hydrate(force = false): Promise<State> {
    if (hydrated && !force) {
      return state;
    }
    
    const userId = authStore.getCurrentUserId();
    if (!userId) {
      hydrated = true;
      return state;
    }
    
    // First, try to load from AsyncStorage (faster and always available)
    const localData = await loadFromAsyncStorage(userId);
    if (localData && (localData.onboardingComplete || localData.goal)) {
      state = {
        goal: localData.goal,
        profile: localData.profile || {},
        onboardingComplete: localData.onboardingComplete || false,
      };
      hydrated = true;
      notify();
      // Don't return yet - still try to get fresh data from Supabase
    }
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // Error but not "no rows" - use localStorage data if we have it
        if (!localData) {
          state = { goal: undefined, profile: {}, onboardingComplete: false };
        }
      } else if (data) {
        state = {
          goal: data.goal,
          profile: data.profile || {},
          onboardingComplete: data.onboarding_complete || false,
        };
        // Update AsyncStorage with fresh data
        await saveToAsyncStorage(userId);
      } else if (!localData) {
        // No Supabase data and no localStorage data - new user
        state = { goal: undefined, profile: {}, onboardingComplete: false };
      }
    } catch (error) {
      // Supabase failed, but we may have localStorage data already loaded
      if (!localData) {
        state = { goal: undefined, profile: {}, onboardingComplete: false };
      }
    }
    
    hydrated = true;
    notify();
    return state;
  },

  setGoal(goal: string) {
    state = { ...state, goal };
    persist();
    notify();
  },

  setProfile(profile: UserProfile) {
    // Calculate calorie target if we have all required fields
    const updatedProfile = { ...state.profile, ...profile };
    if (
      updatedProfile.weightKg &&
      updatedProfile.heightCm &&
      updatedProfile.age &&
      updatedProfile.gender &&
      updatedProfile.activity
    ) {
      updatedProfile.calorieTarget = calculateCalories(
        updatedProfile.weightKg,
        updatedProfile.heightCm,
        updatedProfile.age,
        updatedProfile.gender,
        updatedProfile.activity,
        state.goal,
        updatedProfile.targetWeightKg,
        updatedProfile.targetDays
      );
    }
    state = { ...state, profile: updatedProfile };
    persist();
    notify();
  },

  completeOnboarding() {
    state = { ...state, onboardingComplete: true };
    persist();
    notify();
  },

  getState(): State {
    return {
      goal: state.goal,
      profile: { ...state.profile },
      onboardingComplete: state.onboardingComplete,
    };
  },

  isHydrated() {
    return hydrated;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async reset() {
    state = { goal: undefined, profile: {}, onboardingComplete: false };
    hydrated = true;
    
    const userId = authStore.getCurrentUserId();
    if (userId) {
      try {
        await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('userStore reset failed', error);
      }
    }
    notify();
  },

  // For compatibility - triggers re-hydration
  setUsername(_username: string | null) {
    hydrated = false;
  },
  
  // Force re-hydration on next access
  invalidate() {
    hydrated = false;
  },
};

export function useUserStore(): State & { hydrated: boolean } {
  const [snapshot, setSnapshot] = useState<State>(userStore.getState());
  const [hydrationReady, setHydrationReady] = useState<boolean>(userStore.isHydrated());

  useEffect(() => {
    let mounted = true;

    userStore.hydrate().then((next) => {
      if (!mounted) return;
      setSnapshot({ ...next, profile: { ...next.profile } });
      setHydrationReady(true);
    });

    const unsubscribe = userStore.subscribe(() => {
      const next = userStore.getState();
      setSnapshot(next);
      if (!hydrationReady && userStore.isHydrated()) {
        setHydrationReady(true);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...snapshot, hydrated: hydrationReady };
}
