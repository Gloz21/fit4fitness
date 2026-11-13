import { Avatar } from '@/components/avatar';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccountModal from '../components/AccountModal';
import ExerciseLibraryModal from '../components/ExerciseLibraryModal';
import ImportWorkoutModal from '../components/ImportWorkoutModal';
import MacroBreakdown from '../components/MacroBreakdown';
import MacroWheel from '../components/MacroWheel';
import RealisticMuscleDiagram, { consolidateMuscleVolume } from '../components/RealisticMuscleDiagram';
import RecipeCard from '../components/RecipeCard';
import SorenessTracker from '../components/SorenessTracker';
import WorkoutBuilder from '../components/WorkoutBuilder';
import WorkoutCard from '../components/WorkoutCard';
import WorkoutExecutor, { WorkoutSession } from '../components/WorkoutExecutor';
import WorkoutSummary from '../components/WorkoutSummary';
import { authStore } from '../lib/authStore';
import { getTodaysFact } from '../lib/facts';
import { FoodItem, searchFoodDatabase } from '../lib/foodDatabase';
import { nutritionStore, roundCalories, roundMacro, useNutritionStore } from '../lib/nutritionStore';
import { getRecipesForGoal, Recipe } from '../lib/recipes';
import { recipeStore, useRecipeStore } from '../lib/recipeStore';
import SettingsModal from '../lib/SettingsModal';
import { convertLoad, displayToKg, formatBodyWeight, kgToDisplay, loadIn, useUnits, weightUnitFor, type WeightUnit } from '../lib/units';
import { getLevelFromXP, getLevelProgress, getXPToNextLevel, userStore, useUserStore } from '../lib/userStore';
import { getCategorizedWorkouts, getDailyChallengeWorkout, getRecommendedWorkouts, Workout } from '../lib/workouts';
import { useWorkoutSessionStore, workoutSessionStore } from '../lib/workoutSessionStore';
import { useWorkoutStore, workoutStore } from '../lib/workoutStore';
// Allowed exercise categories for display and filtering
import { exerciseCatalog } from '../lib/exercises';
import { exerciseStore } from '../lib/exerciseStore';
// Get all unique categories from the catalog
const allExerciseCategories = Array.from(new Set(exerciseCatalog.map(ex => ex.category)));
// Always include these categories
const alwaysInclude = ['cardio', 'athletic', 'power', 'agility', 'stretching'];
const allowedExerciseCategories = Array.from(new Set([...allExerciseCategories, ...alwaysInclude]));

// Utility to filter exercises by allowed categories
const filteredExerciseCatalog = exerciseCatalog.filter(ex => allowedExerciseCategories.includes(ex.category));

// For category display (e.g., in filter UI), always show all allowed categories, not just those present in the catalog
const displayExerciseCategories = allowedExerciseCategories;

export default function HomeScreen() {
    const [accountModalVisible, setAccountModalVisible] = useState(false);
    useEffect(() => {
      console.log('[HomeScreen] MOUNTED');
      return () => {
        console.log('[HomeScreen] UNMOUNTED');
      };
    }, []);
  const [activeTab, setActiveTab] = useState('home');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [dailyFact] = useState(getTodaysFact());
    const [customRecipeModalVisible, setCustomRecipeModalVisible] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeCalories, setNewRecipeCalories] = useState('');
  const [newRecipeProtein, setNewRecipeProtein] = useState('');
  const [newRecipeCarbs, setNewRecipeCarbs] = useState('');
  const [newRecipeFat, setNewRecipeFat] = useState('');
  const [workoutBuilderVisible, setWorkoutBuilderVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [libraryVisible, setLibraryVisible] = useState(false);
  const [builderHeading, setBuilderHeading] = useState<string | undefined>(undefined);
  const [builderNotice, setBuilderNotice] = useState<string | undefined>(undefined);

  // Your own workouts are edited in place. Built-in workouts are shared templates, so
  // editing one makes a personal copy in My Workouts and leaves the original unchanged.
  const openWorkoutEditor = (w: Workout) => {
    if (w.isCustom) {
      setBuilderHeading(undefined);
      setBuilderNotice(undefined);
      setEditingWorkout(w);
    } else {
      setBuilderHeading('Customize Workout');
      setBuilderNotice('Your changes save as your own copy in My Workouts. The original stays in the catalog.');
      setEditingWorkout({
        ...w,
        id: `custom-${Date.now()}`,
        isCustom: true,
        createdAt: Date.now(),
        exercises: w.exercises.map((e) => ({ ...e })),
      });
    }
    setWorkoutBuilderVisible(true);
  };
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workoutSummary, setWorkoutSummary] = useState<any | null>(null);
  const [viewingPastWorkout, setViewingPastWorkout] = useState<any | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [addedFastFood, setAddedFastFood] = useState<string | null>(null);
  const [progressSubTab, setProgressSubTab] = useState<'workouts' | 'prs' | 'overview'>('workouts');
  const [oneRepMaxes, setOneRepMaxes] = useState<{ [exercise: string]: number }>({});
  const [deleteConfirmWorkoutId, setDeleteConfirmWorkoutId] = useState<string | null>(null);
  const { goal, profile, hydrated: userHydrated } = useUserStore();
  const units = useUnits();
  const wUnit = weightUnitFor(units);
  const [oneRepDrafts, setOneRepDrafts] = useState<{ [exercise: string]: string }>({});
  const [showRecommended, setShowRecommended] = useState(true);
  const recommendedKey = `showRecommended_${authStore.getCurrentUserId() ?? 'guest'}`;
  useEffect(() => {
    AsyncStorage.getItem(recommendedKey)
      .then((saved) => {
        if (saved !== null) setShowRecommended(saved === 'true');
      })
      .catch(() => {});
  }, [recommendedKey]);
  const toggleRecommended = () => {
    setShowRecommended((prev) => {
      AsyncStorage.setItem(recommendedKey, String(!prev)).catch(() => {});
      return !prev;
    });
  };
  const nutrition = useNutritionStore();
  const nutritionHydrated = nutrition.hydrated;
  const { sessions: workoutSessions } = useWorkoutSessionStore();
  
  const username = authStore.getCurrentUserEmail()?.split('@')[0] || 'User';
  const avatarInitials = username.slice(0, 2).toUpperCase();
  
  // Load avatar customization
  const userId = authStore.getCurrentUserId();
  const [savedAvatar, setSavedAvatar] = useState<any>(null);
  
  // Load avatar on mount and when modal closes
  const loadAvatar = async () => {
    if (!userId) { setSavedAvatar(null); return; }
    try {
      const avatarStr = await AsyncStorage.getItem(`avatar_${userId}`);
      setSavedAvatar(avatarStr ? JSON.parse(avatarStr) : null);
    } catch {
      setSavedAvatar(null);
    }
  };
  
  useEffect(() => {
    loadAvatar();
  }, [userId]);

  // Hydrate stores on mount
  useEffect(() => {
    userStore.hydrate(true);
    nutritionStore.hydrate(true);
    recipeStore.hydrate();
    workoutStore.hydrate();
    workoutSessionStore.hydrate();
    exerciseStore.hydrate();
  }, []);

  // Load user-specific 1RM data when user changes
  useEffect(() => {
    const loadOneRepMaxes = async () => {
      const userId = authStore.getCurrentUserId();
      if (userId) {
        try {
          const saved = await AsyncStorage.getItem(`oneRepMaxes_${userId}`);
          setOneRepMaxes(saved ? JSON.parse(saved) : {});
        } catch {
          setOneRepMaxes({});
        }
      } else {
        setOneRepMaxes({});
      }
    };
    loadOneRepMaxes();
  }, [userHydrated]);

  const handleEditWeight = () => {
    if (profile?.weightKg) {
      setNewWeight(kgToDisplay(profile.weightKg, units).toFixed(1));
    } else {
      setNewWeight('');
    }
    setWeightModalVisible(true);
  };

  const handleSaveWeight = () => {
    const weight = parseFloat(newWeight);
    if (!isNaN(weight) && weight > 0 && profile) {
      const weightKg = displayToKg(weight, units);
      userStore.setProfile({
        ...profile,
        weightKg: weightKg,
      });
      setWeightModalVisible(false);
      setNewWeight('');
    }
  };

  const handleAddCustomRecipe = () => {
    const calories = parseFloat(newRecipeCalories);
    const protein = parseFloat(newRecipeProtein);
    const carbs = parseFloat(newRecipeCarbs);
    const fat = parseFloat(newRecipeFat);

    if (
      newRecipeName.trim() &&
      !isNaN(calories) &&
      !isNaN(protein) &&
      !isNaN(carbs) &&
      !isNaN(fat)
    ) {
      const customRecipe: Recipe = {
        id: Date.now().toString(),
        name: newRecipeName.trim(),
        description: 'Custom recipe',
        servings: 1,
        prepTime: '0 min',
        cookTime: '0 min',
        ingredients: [],
        instructions: [],
        calories,
        protein,
        carbs,
        fat,
        isCustom: true,
      };

      recipeStore.saveRecipe(customRecipe);
      setNewRecipeName('');
      setNewRecipeCalories('');
      setNewRecipeProtein('');
      setNewRecipeCarbs('');
      setNewRecipeFat('');
      setCustomRecipeModalVisible(false);
    }
  };

  const handleLogMeal = (recipe: Recipe) => {
    // Add the recipe as a meal with all macros
    nutritionStore.addMeal({
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
    });
    // Switch to nutrition tab to show the logged meal
    setActiveTab('nutrition');
  };

  const handleSaveWorkout = (workout: Workout) => {
    workoutStore.saveWorkout(workout);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setDeleteConfirmWorkoutId(workoutId);
  };

  const confirmDeleteWorkout = () => {
    if (deleteConfirmWorkoutId) {
      workoutStore.deleteWorkout(deleteConfirmWorkoutId);
      setDeleteConfirmWorkoutId(null);
    }
  };

  const handleWorkoutComplete = (session: WorkoutSession) => {
    // Calculate workout stats
    const sets = session.loggedSets || [];
    const totalVolume = sets.reduce((sum, s) => sum + loadIn(s.weight, s.unit as WeightUnit, 'imperial') * (s.reps || 1), 0) || 0;
    const totalTime = (session.endTime && session.startTime) ? Math.round((session.endTime - session.startTime) / 1000) : 0;
    // XP: 1 per set, +1 per 100 lbs volume, +1 per 2 min
    let xp = sets.length + Math.floor(totalVolume / 100) + Math.floor(totalTime / 120);
    
    // Add 500 XP bonus for completing the daily challenge
    const isDailyChallenge = session.workoutId === 'daily-challenge';
    if (isDailyChallenge) {
      xp += 500;
    }

    // Update user XP/level using the new scaling system
    const userProfile = userStore.getState().profile;
    if (userProfile) {
      const prevXP = userProfile.xp || 0;
      const newXP = prevXP + xp;
      const newLevel = getLevelFromXP(newXP);
      userStore.setProfile({
        ...userProfile,
        xp: newXP,
        level: newLevel,
      });
    }

    // Save workout session to history (do not add xp property directly)
    workoutSessionStore.saveSession({ ...session });

    // Show summary modal (pass xp separately)
    setWorkoutSummary({
      ...session,
      totalVolume,
      totalTime,
      xp,
    });
    setActiveWorkout(null);
    setActiveTab('home');
  };

  const workoutState = useWorkoutStore();
  const recipeState = useRecipeStore();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'nutrition':
        return <NutritionTab nutrition={nutrition} profile={profile} goal={goal} />;
      case 'workouts':
        const customWorkouts = workoutState.customWorkouts;
        const recommendedWorkouts = getRecommendedWorkouts(goal);
        const workoutCatalog = getCategorizedWorkouts();

        // Normalized category keys and display names
        const categoryDisplayNames: { [key: string]: string } = {
          athletic: 'Athletic / Sports',
          cardio: 'Cardio & Fat Loss',
          hypertrophy: 'Hypertrophy (Muscle Building)',
          strength: 'Strength Training',
          power: 'Power & Explosiveness',
          endurance: 'Endurance',
          agility: 'Agility & Speed',
          core: 'Core & Rotation',
          stretching: 'Stretching & PT',
        };

        const categoryDescriptions: { [key: string]: string } = {
          athletic: 'Explosive power, plyometrics, and sport-specific drills for peak performance.',
          cardio: 'Heart-pumping workouts to burn calories and boost endurance.',
          hypertrophy: 'Muscle-building routines with moderate weight and higher reps.',
          strength: 'Heavy compound lifts for maximal force and power.',
          power: 'Fast, explosive movements and Olympic lifts for speed.',
          endurance: 'High-volume circuits to build stamina and work capacity.',
          agility: 'Quick footwork, ladder drills, and change-of-direction training.',
          core: 'Stability, rotation, and anti-rotation for a bulletproof midsection.',
          stretching: 'Flexibility, mobility, and recovery for injury prevention.',
        };

        return (
          <ScrollView contentContainerStyle={styles.workoutsContent}>
            <Text style={styles.tabTitle}>Workouts</Text>

            {/* Create Your Own */}
            <View style={styles.workoutSection}>
              <Text style={styles.sectionTitle}>Create Your Own</Text>
              <TouchableOpacity
                style={styles.workoutOption}
                onPress={() => {
                  setEditingWorkout(null);
                  setWorkoutBuilderVisible(true);
                }}
              >
                <Text style={styles.workoutEmoji}>🛠️</Text>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle}>Custom Workout Builder</Text>
                  <Text style={styles.workoutDesc}>Build your perfect routine with exercises, sets, reps & rest times</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.workoutOption} onPress={() => setImportVisible(true)}>
                <Text style={styles.workoutEmoji}>📥</Text>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle}>Import a Workout</Text>
                  <Text style={styles.workoutDesc}>Paste text, use a Google Doc or Sheet link, or upload a .txt or .csv file</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.workoutOption} onPress={() => setLibraryVisible(true)}>
                <Text style={styles.workoutEmoji}>📚</Text>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle}>Exercise Library</Text>
                  <Text style={styles.workoutDesc}>Browse every exercise by category, see how to do it, and add your own</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Custom Workouts */}
            {customWorkouts.length > 0 && (
              <View style={styles.workoutSection}>
                <Text style={styles.sectionTitle}>My Workouts ({customWorkouts.length})</Text>
                {customWorkouts.map((workout: Workout) => (
                  <View key={workout.id} style={{ marginBottom: 12 }}>
                    <WorkoutCard
                      workout={workout}
                      onStart={() => setActiveWorkout(workout)}
                      onEdit={(w: Workout) => {
                        setEditingWorkout(w);
                        setWorkoutBuilderVisible(true);
                      }}
                      onDelete={handleDeleteWorkout}
                      isSaved={workoutState.savedWorkouts.some((w: Workout) => w.id === workout.id)}
                      onSave={() => workoutStore.saveWorkoutToFavorites(workout)}
                      onUnsave={() => workoutStore.unsaveWorkout(workout.id)}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Recommended for Your Goal */}
            <View style={styles.workoutSection}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Recommended for You</Text>
                <TouchableOpacity onPress={toggleRecommended} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.tipToggle}>{showRecommended ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              {showRecommended && (
              <>
              <Text style={styles.sectionSubtitle}>
                {goal === 'weight-loss' 
                  ? 'Cardio and endurance workouts to maximize fat burn'
                  : goal === 'muscle-gain'
                  ? 'Resistance training to build muscle mass'
                  : goal === 'performance'
                  ? 'Power, agility, and endurance for peak athletic performance'
                  : 'Workouts tailored to your fitness goals'}
              </Text>
              {recommendedWorkouts.map((workout) => (
                <View key={workout.id} style={{ marginBottom: 12 }}>
                  <WorkoutCard
                    workout={workout}
                    onStart={() => setActiveWorkout(workout)}
                    onEdit={openWorkoutEditor}
                    isSaved={workoutState.savedWorkouts.some((w: Workout) => w.id === workout.id)}
                    onSave={() => workoutStore.saveWorkoutToFavorites(workout)}
                    onUnsave={() => workoutStore.unsaveWorkout(workout.id)}
                  />
                </View>
              ))}
              </>
              )}
            </View>

            {/* Full Workout Catalog */}
            <View style={styles.workoutSection}>
              <Text style={styles.sectionTitle}>Complete Workout Catalog</Text>
              <Text style={styles.sectionSubtitle}>Tap a category to see its workouts</Text>
              {Object.entries(workoutCatalog).map(([categoryKey, workouts]) => {
                if (workouts.length === 0) return null;
                const isOpen = expandedCategory === categoryKey;
                const emojiMap: { [key: string]: string } = {
                  athletic: '🏆',
                  cardio: '🏃',
                  hypertrophy: '💪',
                  strength: '🏋️',
                  power: '⚡',
                  endurance: '🔄',
                  agility: '🤸',
                  core: '🔥',
                  stretching: '🧘',
                };
                return (
                  <View key={categoryKey} style={[styles.catalogItem, isOpen && styles.catalogItemOpen]}>
                    <TouchableOpacity
                      style={styles.catalogRow}
                      onPress={() => setExpandedCategory(isOpen ? null : categoryKey)}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isOpen }}
                    >
                      <View style={styles.catalogEmojiWrap}>
                        <Text style={styles.catalogEmoji}>{emojiMap[categoryKey] || '🎯'}</Text>
                      </View>
                      <View style={styles.catalogText}>
                        <Text style={[styles.catalogName, isOpen && styles.catalogNameOpen]}>
                          {categoryDisplayNames[categoryKey] || categoryKey}
                        </Text>
                        <Text style={styles.catalogCount}>
                          {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'}
                        </Text>
                        {categoryDescriptions[categoryKey] ? (
                          <Text style={styles.catalogDescription}>{categoryDescriptions[categoryKey]}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.catalogChevron}>{isOpen ? '▾' : '▸'}</Text>
                    </TouchableOpacity>
                    {isOpen && (
                      <View style={styles.catalogWorkouts}>
                        {workouts.map((workout) => (
                          <WorkoutCard
                            key={workout.id}
                            workout={workout}
                            onStart={() => setActiveWorkout(workout)}
                            onEdit={openWorkoutEditor}
                            isSaved={workoutState.savedWorkouts.some((w: Workout) => w.id === workout.id)}
                            onSave={() => workoutStore.saveWorkoutToFavorites(workout)}
                            onUnsave={() => workoutStore.unsaveWorkout(workout.id)}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        );
      case 'home':

        return (
          <ScrollView contentContainerStyle={styles.homeContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setAccountModalVisible(true)}>
                <Avatar data={savedAvatar} initials={avatarInitials} size={60} />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.fact}>Daily Fitness Fact</Text>
                <Text style={styles.factBody}>
                  {dailyFact}
                </Text>
              </View>
              <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
            {/* Account Modal (do not render here, only at root) */}

            {goal && (
              <View style={styles.goalCard}>
                <Text style={styles.goalLabel}>Your Goal</Text>
                <Text style={styles.goalValue}>{goal}</Text>
              </View>
            )}

            {profile.weightKg && (
              <View style={styles.weightCard}>
                <View style={styles.weightHeaderRow}>
                  <Text style={styles.weightCardTitle}>Weight Tracking</Text>
                </View>
                <TouchableOpacity onPress={handleEditWeight}>
                  <View style={styles.weightRow}>
                    <Text style={styles.weightLabel}>Current Weight</Text>
                    <Text style={styles.weightValue}>{formatBodyWeight(profile.weightKg, units)}</Text>
                  </View>
                </TouchableOpacity>
                {profile.targetWeightKg && (
                  <View style={styles.weightRow}>
                    <Text style={styles.weightLabel}>Target Weight</Text>
                    <Text style={styles.weightValue}>{formatBodyWeight(profile.targetWeightKg, units)}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Soreness Predictor */}
            {(() => {
              // Get nutrition data for soreness calculation
              const todayDate = new Date().toISOString().split('T')[0];
              const today: any = nutrition ? nutrition[todayDate] : null;
              const waterGlasses = Math.floor((today?.waterIntake || 0) / 250);
              const totalProtein = today?.totalProtein || 0;
              const sleepHours = today?.sleepHours || 0;
              
              // Calculate protein target (simplified)
              const weightLbs = (profile?.weightKg || 70) * 2.20462;
              const proteinTarget = Math.round(weightLbs * 0.9);
              
              // Calculate today's workout stats from session store
              const todayStart = new Date();
              todayStart.setHours(0, 0, 0, 0);
              const todayTimestamp = todayStart.getTime();
              
              const allSessions = workoutSessionStore.getSessions();
              const todaySessions = allSessions.filter(s => s.startTime && s.startTime >= todayTimestamp);
              
              // Calculate workout minutes today
              const workoutMinutesToday = todaySessions.reduce((total, session) => {
                if (session.startTime && session.endTime) {
                  return total + Math.round((session.endTime - session.startTime) / 60000);
                }
                return total;
              }, 0);
              
              // Calculate workout volume today (weight x reps for all sets)
              const workoutVolumeToday = todaySessions.reduce((total, session) => {
                const sessionVolume = (session.loggedSets || []).reduce((sum, set: any) => {
                  return sum + ((set.weight || 0) * (set.reps || 0));
                }, 0);
                return total + sessionVolume;
              }, 0);
              
              // Calculate workouts this week
              const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
              const workoutsThisWeek = allSessions.filter(s => s.startTime && s.startTime >= oneWeekAgo).length;
              
              return (
                <SorenessTracker
                  waterGlasses={waterGlasses}
                  proteinGrams={totalProtein}
                  proteinTarget={proteinTarget}
                  sleepHours={sleepHours}
                  workoutMinutesToday={workoutMinutesToday}
                  workoutsThisWeek={workoutsThisWeek}
                  workoutVolumeToday={workoutVolumeToday}
                />
              );
            })()}

            <View style={styles.challenges}>
              <Text style={styles.sectionTitle}>Today&apos;s Challenge</Text>
              {(() => {
                const dailyChallenge = getDailyChallengeWorkout();
                const exerciseList = dailyChallenge.exercises.map(e => `${e.sets}x${e.reps} ${e.exerciseName}`).join(', ');
                
                // Check if daily challenge was completed today (using reactive workoutSessions)
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const completedToday = workoutSessions.some(
                  (s) => s.workoutId === 'daily-challenge' && s.startTime >= todayStart.getTime()
                );
                
                return (
                  <View style={[styles.challengeCard, { flexDirection: 'row', alignItems: 'flex-start', position: 'relative' }]}> 
                    {completedToday && (
                      <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(76, 175, 80, 0.9)',
                        borderRadius: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                      }}>
                        <Text style={{ fontSize: 40, marginBottom: 8 }}>🎉</Text>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center' }}>COMPLETED!</Text>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginTop: 4 }}>+500 XP Earned</Text>
                        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>Come back tomorrow for a new challenge!</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.challengeTitle}>{dailyChallenge.title}</Text>
                      <Text style={styles.challengeDetail}>
                        {exerciseList.length > 60 ? exerciseList.substring(0, 60) + '...' : exerciseList} +500 XP
                      </Text>
                      <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => {
                          // Start the daily challenge as a workout
                          setActiveWorkout(dailyChallenge);
                        }}
                      >
                        <Text style={styles.startButtonText}>Start Challenge</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, marginLeft: 16, backgroundColor: '#f7f7f7', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e0e0e0' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>Daily Challenge</Text>
                      <Text style={{ color: '#444', fontSize: 14, marginBottom: 6 }}>
                        {dailyChallenge.title}
                      </Text>
                      <Text style={{ color: '#666', fontSize: 13 }}>
                        {dailyChallenge.exercises.map(e => `- ${e.sets}x${e.reps} ${e.exerciseName}`).join('\n')}
                        {'\n\n'}Complete this workout to earn +500 XP bonus!
                      </Text>
                    </View>
                  </View>
                );
              })()}
            </View>
          </ScrollView>
        );
      case 'recipes':
        const recommendedRecipes = getRecipesForGoal(goal);

        // Fast food catalog data (example)
        const fastFoodCatalog = [
          {
            restaurant: 'McDonald\'s',
            items: [
              { name: 'Grilled Chicken Sandwich', calories: 380, protein: 37, carbs: 44, fat: 7 },
              { name: 'Egg McMuffin', calories: 300, protein: 17, carbs: 30, fat: 12 },
              { name: 'Side Salad', calories: 15, protein: 1, carbs: 3, fat: 0 },
              { name: 'Double Quarter Pounder w/ Cheese', calories: 740, protein: 48, carbs: 43, fat: 42 },
              { name: 'McDouble (2x)', calories: 800, protein: 44, carbs: 66, fat: 36 },
              { name: 'Big Mac', calories: 590, protein: 25, carbs: 46, fat: 34 },
              // High protein ratio items for recomp (1:10)
              { name: 'Grilled Chicken Sandwich (no bun)', calories: 200, protein: 32, carbs: 6, fat: 5 },
              { name: '2x Egg White Delight McMuffin', calories: 560, protein: 56, carbs: 60, fat: 12 },
            ],
          },
          {
            restaurant: 'Chipotle',
            items: [
              { name: 'Chicken Salad Bowl', calories: 420, protein: 32, carbs: 18, fat: 22 },
              { name: 'Veggie Bowl', calories: 370, protein: 12, carbs: 54, fat: 13 },
              { name: 'Double Chicken Burrito', calories: 1100, protein: 72, carbs: 105, fat: 42 },
              { name: 'Steak Bowl w/ Rice & Beans', calories: 780, protein: 45, carbs: 68, fat: 32 },
              { name: 'Chicken Burrito Bowl (Large)', calories: 850, protein: 55, carbs: 72, fat: 35 },
              // High protein ratio items for recomp (1:10)
              { name: 'Double Chicken Bowl (no rice)', calories: 400, protein: 64, carbs: 14, fat: 14 },
              { name: 'Triple Chicken Salad Bowl', calories: 450, protein: 72, carbs: 12, fat: 15 },
              { name: 'Steak & Chicken Bowl (no rice)', calories: 380, protein: 52, carbs: 10, fat: 16 },
            ],
          },
          {
            restaurant: 'Subway',
            items: [
              { name: 'Turkey Breast 6\' Sub', calories: 280, protein: 18, carbs: 46, fat: 3 },
              { name: 'Veggie Delight 6\' Sub', calories: 230, protein: 8, carbs: 44, fat: 2 },
              { name: 'Footlong Steak & Cheese', calories: 780, protein: 52, carbs: 96, fat: 24 },
              { name: 'Footlong Chicken Teriyaki', calories: 720, protein: 58, carbs: 108, fat: 12 },
              { name: 'Footlong Italian BMT', calories: 820, protein: 40, carbs: 94, fat: 36 },
              // High protein ratio items for recomp (1:10)
              { name: 'Double Chicken Chopped Salad', calories: 280, protein: 36, carbs: 12, fat: 10 },
              { name: 'Rotisserie Chicken Protein Bowl', calories: 320, protein: 42, carbs: 8, fat: 14 },
            ],
          },
          {
            restaurant: 'Starbucks',
            items: [
              { name: 'Spinach, Feta & Egg White Wrap', calories: 290, protein: 20, carbs: 33, fat: 8 },
              { name: 'Protein Bistro Box', calories: 470, protein: 20, carbs: 40, fat: 23 },
              { name: 'Double Smoked Bacon Sandwich', calories: 500, protein: 30, carbs: 38, fat: 27 },
              { name: 'Turkey Bacon Sandwich + Protein Box', calories: 720, protein: 42, carbs: 62, fat: 32 },
              { name: 'Impossible Breakfast Sandwich + Oatmeal', calories: 630, protein: 32, carbs: 78, fat: 22 },
              // High protein ratio items for recomp (1:10)
              { name: 'Egg White & Roasted Red Pepper Sous Vide Bites (2x)', calories: 340, protein: 34, carbs: 22, fat: 12 },
              { name: 'Chicken & Quinoa Protein Bowl', calories: 380, protein: 40, carbs: 30, fat: 12 },
            ],
          },
          {
            restaurant: 'Chick-fil-A',
            items: [
              { name: 'Grilled Chicken Sandwich', calories: 320, protein: 28, carbs: 41, fat: 6 },
              { name: 'Spicy Deluxe Sandwich', calories: 550, protein: 33, carbs: 48, fat: 24 },
              { name: '12-count Grilled Nuggets + Fries', calories: 650, protein: 42, carbs: 56, fat: 28 },
              { name: 'Cobb Salad w/ Nuggets', calories: 780, protein: 54, carbs: 28, fat: 48 },
              // High protein ratio items for recomp (1:10)
              { name: '12-count Grilled Nuggets', calories: 200, protein: 38, carbs: 2, fat: 4 },
              { name: 'Grilled Market Salad + Grilled Filet', calories: 350, protein: 43, carbs: 18, fat: 12 },
              { name: 'Grilled Cool Wrap', calories: 350, protein: 37, carbs: 29, fat: 13 },
              { name: '2x Egg White Grill', calories: 580, protein: 62, carbs: 48, fat: 14 },
            ],
          },
          {
            restaurant: 'Wendy\'s',
            items: [
              { name: 'Grilled Chicken Wrap', calories: 350, protein: 24, carbs: 35, fat: 14 },
              { name: 'Dave\'s Double', calories: 850, protein: 48, carbs: 42, fat: 55 },
              { name: 'Baconator', calories: 950, protein: 57, carbs: 38, fat: 65 },
              { name: 'Jr. Bacon Cheeseburger (3x)', calories: 1080, protein: 51, carbs: 81, fat: 60 },
              // High protein ratio items for recomp (1:10)
              { name: 'Grilled Chicken Sandwich (no bun) + Side Salad', calories: 250, protein: 34, carbs: 8, fat: 8 },
              { name: 'Parmesan Caesar Salad + Grilled Chicken', calories: 340, protein: 40, carbs: 12, fat: 16 },
            ],
          },
        ];

        // Determine title and subtitle based on goal
        let goalTitle = 'Healthy Recipes';
        let goalSubtitle = 'Balanced meals for your fitness journey';

        if (goal?.toLowerCase().includes('recomposition')) {
          goalTitle = 'Body Recomposition Recipes';
          goalSubtitle = 'High-protein meals with at least 1g protein per 10 calories';
        } else if (goal === 'weight-loss') {
          goalTitle = 'Weight Loss Recipes';
          goalSubtitle = 'Low-calorie, high-protein meals to support your weight loss';
        } else if (goal === 'muscle-gain') {
          goalTitle = 'Muscle Building Recipes';
          goalSubtitle = 'High-calorie, protein-rich meals to fuel muscle growth';
        } else if (goal === 'performance' || goal?.toLowerCase().includes('athletic')) {
          goalTitle = 'Performance Fuel Recipes';
          goalSubtitle = 'High-energy meals to power your athletic performance';
        }

        // Filter fast food items based on goal
        let fastFoodFilter = (item: { calories: number; protein: number; carbs: number; fat: number }) => true;
        if (goal?.toLowerCase().includes('recomposition')) {
          // Body recomposition: at least 1g protein per 10 calories (1:10 ratio)
          fastFoodFilter = (item) => item.protein >= item.calories / 10;
        } else if (goal === 'weight-loss') {
          fastFoodFilter = (item) => item.calories <= 400;
        } else if (goal === 'muscle-gain') {
          // For muscle gain: prioritize high calorie AND high protein meals
          fastFoodFilter = (item) => item.protein >= 30 && item.calories >= 500;
        } else if (goal === 'performance' || goal?.toLowerCase().includes('athletic')) {
          fastFoodFilter = (item) => item.calories <= 600;
        } else if (goal === 'weight-gain' || goal?.toLowerCase().includes('gain')) {
          fastFoodFilter = (item) => item.calories >= 500;
        }

        return (
          <ScrollView contentContainerStyle={styles.recipesContent}>
            <Text style={styles.tabTitle}>Recipes</Text>

            {/* Create Custom Recipe Button */}
            <TouchableOpacity
              style={styles.addRecipeButton}
              onPress={() => setCustomRecipeModalVisible(true)}
            >
              <Text style={styles.addRecipeButtonText}>+ Create Recipe</Text>
            </TouchableOpacity>

            {/* Goal-Tailored Recipes */}
            <View style={styles.goalRecipeHeader}>
              <Text style={styles.sectionTitle}>{goalTitle}</Text>
              <Text style={styles.goalRecipeSubtitle}>{goalSubtitle}</Text>
            </View>
            <View style={styles.recipesGrid}>
              {recommendedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={recipeState.saved.some(r => r.id === recipe.id)}
                  onSave={() => recipeStore.saveRecipe(recipe)}
                  onUnsave={() => recipeStore.unsaveRecipe(recipe.id)}
                  onLogMeal={handleLogMeal}
                />
              ))}
            </View>

            {/* Fast Food Catalog Section */}
            <View style={styles.goalRecipeHeader}>
              <Text style={styles.sectionTitle}>Fast Food Catalog</Text>
              <Text style={styles.goalRecipeSubtitle}>Suggested meals from popular restaurants for your goal</Text>
            </View>
            <View style={styles.recipesGrid}>
              {fastFoodCatalog.map((chain) => (
                <View key={chain.restaurant} style={{ marginBottom: 18 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>{chain.restaurant}</Text>
                  {chain.items.filter(fastFoodFilter).map((item, idx) => {
                    const itemKey = `${chain.restaurant}-${item.name}`;
                    const isAdded = addedFastFood === itemKey;
                    return (
                      <View key={item.name + idx} style={{ backgroundColor: '#f7f7f7', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e0e0e0', flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: '600' }}>{item.name}</Text>
                          <Text style={{ fontSize: 13, color: '#666' }}>{item.calories} cal | P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g</Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => {
                            nutritionStore.addMeal({
                              name: `${chain.restaurant} - ${item.name}`,
                              calories: item.calories,
                              protein: item.protein,
                              carbs: item.carbs,
                              fat: item.fat,
                            });
                            setAddedFastFood(itemKey);
                            setTimeout(() => setAddedFastFood(null), 1500);
                          }}
                          style={{ 
                            backgroundColor: isAdded ? '#4CAF50' : '#00B8A9', 
                            paddingHorizontal: 10, 
                            paddingVertical: 6, 
                            borderRadius: 12, 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            marginLeft: 8,
                            transform: [{ scale: isAdded ? 1.05 : 1 }],
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                            {isAdded ? '✓ Added!' : '+ Log'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        );
      case 'progress':
        const workoutHistory = workoutSessionStore.getRecentSessions(50);
        const allWorkoutSessions = workoutSessionStore.getSessions();
        
        // Calculate total stats
        const totalWorkoutsCompleted = workoutHistory.length;
        const totalVolumeLifted = workoutHistory.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
        const totalTimeMinutes = workoutHistory.reduce((sum, s) => 
          sum + Math.round((s.totalDuration || 0) / 60000), 0
        );
        
        // Calculate PRs for each exercise
        const prs: { [exerciseName: string]: { weight: number; reps: number; unit: string; date: number } } = {};
        allWorkoutSessions.forEach((session) => {
          (session.loggedSets || []).forEach((set: any) => {
            const name = set.exerciseName || `Exercise ${set.exerciseIndex + 1}`;
            const setLbs = loadIn(set.weight, (set.unit as WeightUnit) || 'lbs', 'imperial');
            const prLbs = prs[name] ? loadIn(prs[name].weight, prs[name].unit as WeightUnit, 'imperial') : -1;
            if (setLbs > prLbs) {
              prs[name] = {
                weight: set.weight,
                reps: set.reps,
                unit: set.unit || 'lbs',
                date: session.startTime || Date.now(),
              };
            }
          });
        });
        const prEntries = Object.entries(prs).slice(0, 12);
        
        // Calculate weekly volume comparison (last 4 weeks)
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const weeklyVolumes = [
          { label: 'This Week', start: now - oneWeek, end: now },
          { label: 'Last Week', start: now - 2 * oneWeek, end: now - oneWeek },
          { label: '2 Weeks Ago', start: now - 3 * oneWeek, end: now - 2 * oneWeek },
          { label: '3 Weeks Ago', start: now - 4 * oneWeek, end: now - 3 * oneWeek },
        ].map(week => {
          const sessionsInWeek = allWorkoutSessions.filter(s => s.startTime >= week.start && s.startTime < week.end);
          const volume = sessionsInWeek.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
          const workoutCount = sessionsInWeek.length;
          return { ...week, volume, workoutCount };
        });
        const maxWeeklyVolume = Math.max(...weeklyVolumes.map(w => w.volume), 1);
        
        // Calculate volume by muscle group for body diagram (this week)
        const muscleVolumeMap: { [muscle: string]: number } = {};
        const thisWeekSessions = allWorkoutSessions.filter(s => s.startTime >= now - oneWeek);
        thisWeekSessions.forEach(session => {
          (session.loggedSets || []).forEach((set: any) => {
            const exerciseName = (set.exerciseName || '').toLowerCase();
            const exerciseId = set.exerciseId || '';
            
            // Find exercise with multiple matching strategies
            const exercise = exerciseCatalog.find(e => {
              // Exact ID match
              if (exerciseId && e.id === exerciseId) return true;
              // Exact name match (case insensitive)
              if (e.name.toLowerCase() === exerciseName) return true;
              // ID matches exercise name
              if (e.id.toLowerCase() === exerciseName) return true;
              // Partial name match (exercise name contains catalog name or vice versa)
              if (exerciseName.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(exerciseName)) return true;
              // Check if key words match (e.g., "bench press" in "BB Flat Bench Press")
              const nameWords = exerciseName.split(' ').filter((w: string) => w.length > 2);
              const catalogWords = e.name.toLowerCase().split(' ').filter((w: string) => w.length > 2);
              const matchingWords = nameWords.filter((w: string) => catalogWords.some((cw: string) => cw.includes(w) || w.includes(cw)));
              if (matchingWords.length >= 2) return true;
              return false;
            });
            
            if (exercise && exercise.muscleGroups) {
              const setVolume = (set.weight || 0) * (set.reps || 0);
              exercise.muscleGroups.forEach(muscle => {
                muscleVolumeMap[muscle] = (muscleVolumeMap[muscle] || 0) + setVolume;
              });
            }
          });
        });
        
        // Convert to highlighted muscles with intensity based on volume
        const maxMuscleVolume = Math.max(...Object.values(muscleVolumeMap), 1);
        const highlightedMuscles = Object.entries(muscleVolumeMap).map(([muscle, volume]) => ({
          name: muscle,
          intensity: Math.min(Math.max(volume / maxMuscleVolume, 0.2), 1) // 0.2 to 1 range
        }));
        
        // Common exercises for 1RM input
        const oneRmExercises = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row', 'Pull-ups'];
        
        const handleSaveOneRepMax = (exercise: string, value: string) => {
          const trimmed = value.trim();
          const userId = authStore.getCurrentUserId();
          
          // If empty or not a valid number, set to 0
          if (trimmed === '' || isNaN(parseFloat(trimmed))) {
            const updated = { ...oneRepMaxes, [exercise]: 0 };
            setOneRepMaxes(updated);
            if (userId) {
              AsyncStorage.setItem(`oneRepMaxes_${userId}`, JSON.stringify(updated)).catch(() => {});
            }
            return;
          }
          
          const weight = parseFloat(trimmed);
          if (weight >= 0) {
            const updated = { ...oneRepMaxes, [exercise]: loadIn(weight, wUnit, 'imperial') };
            setOneRepMaxes(updated);
            if (userId) {
              AsyncStorage.setItem(`oneRepMaxes_${userId}`, JSON.stringify(updated)).catch(() => {});
            }
          }
        };
        
        return (
          <View style={{ flex: 1 }}>
            {/* Header with Level/XP */}
            <View style={{ backgroundColor: '#00B8A9', paddingTop: 12, paddingBottom: 16, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 12 }}>Progress</Text>
              {profile && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>Lvl {getLevelFromXP(profile.xp || 0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, height: 8 }}>
                      <View style={{ backgroundColor: '#FFD700', borderRadius: 6, height: 8, width: `${getLevelProgress(profile.xp || 0) * 100}%` }} />
                    </View>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>{getXPToNextLevel(profile.xp || 0)} XP to next level</Text>
                  </View>
                </View>
              )}
            </View>
            
            {/* Sub-tab Navigation */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: progressSubTab === 'workouts' ? '#00B8A9' : 'transparent' }}
                onPress={() => setProgressSubTab('workouts')}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: progressSubTab === 'workouts' ? '#00B8A9' : '#666' }}>📋 Workouts</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: progressSubTab === 'prs' ? '#00B8A9' : 'transparent' }}
                onPress={() => setProgressSubTab('prs')}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: progressSubTab === 'prs' ? '#00B8A9' : '#666' }}>🏆 PRs & Maxes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: progressSubTab === 'overview' ? '#00B8A9' : 'transparent' }}
                onPress={() => setProgressSubTab('overview')}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: progressSubTab === 'overview' ? '#00B8A9' : '#666' }}>📊 Overview</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
              {/* Workouts Tab */}
              {progressSubTab === 'workouts' && (
                <>
                  {workoutHistory.length > 0 ? (
                    <>
                      <Text style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>{totalWorkoutsCompleted} workouts completed • {Math.round(loadIn(totalVolumeLifted, 'lbs', units)).toLocaleString()} {wUnit} total volume</Text>
                      {workoutHistory.map((session, index) => {
                        const sets = session.loggedSets || [];
                        const duration = Math.round((session.totalDuration || 0) / 60000);
                        const date = session.startTime 
                          ? new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                          : 'Unknown';
                        const time = session.startTime
                          ? new Date(session.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                          : '';
                        
                        return (
                          <TouchableOpacity 
                            key={`${session.workoutId}-${index}`} 
                            style={{ 
                              backgroundColor: '#fff', 
                              borderRadius: 12, 
                              padding: 16, 
                              marginBottom: 12,
                              borderWidth: 1,
                              borderColor: '#E0E0E0',
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.05,
                              shadowRadius: 2,
                            }}
                            onPress={() => setViewingPastWorkout(session)}
                          >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '700', fontSize: 16, color: '#333' }}>{session.workoutTitle || 'Workout'}</Text>
                                <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{date} at {time}</Text>
                              </View>
                              <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#4CAF50' }}>{Math.round(loadIn(session.totalVolume || 0, 'lbs', units)).toLocaleString()} {wUnit}</Text>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
                              <View style={{ flexDirection: 'row', gap: 16 }}>
                                <Text style={{ fontSize: 13, color: '#666' }}>🏋️ {sets.length} sets</Text>
                                <Text style={{ fontSize: 13, color: '#666' }}>⏱️ {duration} min</Text>
                              </View>
                              <Text style={{ fontSize: 16, color: '#999' }}>›</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </>
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyIcon}>📋</Text>
                      <Text style={styles.emptyTitle}>No workouts yet</Text>
                      <Text style={styles.emptyDesc}>Complete a workout to see it here!</Text>
                    </View>
                  )}
                </>
              )}
              
              {/* PRs & Maxes Tab */}
              {progressSubTab === 'prs' && (
                <>
                  {/* 1 Rep Maxes Section */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 }}>💪 1 Rep Maxes</Text>
                    <Text style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Enter your estimated or tested 1RM for each lift</Text>
                    {oneRmExercises.map(exercise => (
                      <View key={exercise} style={{ 
                        backgroundColor: '#fff', 
                        borderRadius: 12, 
                        padding: 14, 
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#333', flex: 1 }}>{exercise}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <TextInput
                            style={{ 
                              backgroundColor: '#F5F5F5', 
                              borderRadius: 8, 
                              paddingHorizontal: 12, 
                              paddingVertical: 8, 
                              width: 80, 
                              fontSize: 16, 
                              fontWeight: '700',
                              textAlign: 'center',
                              color: '#333'
                            }}
                            keyboardType="numeric"
                            placeholder="--"
                            placeholderTextColor="#999"
                            value={
                              oneRepDrafts[exercise] ??
                              (oneRepMaxes[exercise] ? String(Math.round(loadIn(oneRepMaxes[exercise], 'lbs', units) * 10) / 10) : '')
                            }
                            onChangeText={(val) => {
                              setOneRepDrafts((d) => ({ ...d, [exercise]: val }));
                              handleSaveOneRepMax(exercise, val);
                            }}
                            onEndEditing={() => setOneRepDrafts(({ [exercise]: _, ...rest }) => rest)}
                          />
                          <Text style={{ fontSize: 14, color: '#666' }}>{wUnit}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  {/* Workout PRs Section */}
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 }}>🏆 Workout PRs</Text>
                    <Text style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Best weight lifted for each exercise (from workouts)</Text>
                    {prEntries.length > 0 ? (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {prEntries.map(([exerciseName, pr]) => (
                          <View key={exerciseName} style={{ 
                            backgroundColor: '#FFF8E1', 
                            borderRadius: 12, 
                            padding: 14, 
                            width: '48%',
                            borderWidth: 1,
                            borderColor: '#FFE082'
                          }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 6 }} numberOfLines={1}>{exerciseName}</Text>
                            <Text style={{ fontSize: 22, fontWeight: '800', color: '#F59E0B' }}>{convertLoad(pr.weight, pr.unit as WeightUnit, wUnit)} {wUnit}</Text>
                            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{pr.reps} reps • {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, color: '#666' }}>Complete workouts to track your PRs</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
              
              {/* Weekly Overview Tab */}
              {progressSubTab === 'overview' && (
                <>
                  {/* Weekly Volume Comparison */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 }}>📈 Weekly Volume</Text>
                    <Text style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Compare your training volume week over week</Text>
                    {weeklyVolumes.map((week, idx) => (
                      <View key={week.label} style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: idx === 0 ? '#00B8A9' : '#666' }}>{week.label}</Text>
                          <Text style={{ fontSize: 13, color: '#888' }}>{week.workoutCount} workouts</Text>
                        </View>
                        <View style={{ backgroundColor: '#E0E0E0', borderRadius: 8, height: 28 }}>
                          <View style={{ 
                            backgroundColor: idx === 0 ? '#00B8A9' : '#90CAF9', 
                            borderRadius: 8, 
                            height: 28, 
                            width: `${Math.max((week.volume / maxWeeklyVolume) * 100, 2)}%`,
                            justifyContent: 'center',
                            paddingLeft: 10
                          }}>
                            {week.volume > 0 && (
                              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{Math.round(loadIn(week.volume, 'lbs', units)).toLocaleString()} {wUnit}</Text>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  {/* Body Volume Heat Map */}
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 }}>🔥 Muscle Volume Map</Text>
                    <Text style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Muscles trained this week - darker = more volume</Text>
                    <View style={{ backgroundColor: '#F5F5F5', borderRadius: 16, padding: 20, alignItems: 'center' }}>
                      {/* Color Key */}
                      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16, gap: 4 }}>
                        <Text style={{ fontSize: 11, color: '#666', marginRight: 8 }}>Volume:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <View style={{ width: 20, height: 12, backgroundColor: '#B2EBF2', borderRadius: 3 }} />
                          <Text style={{ fontSize: 10, color: '#666' }}>Low</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 8 }}>
                          <View style={{ width: 20, height: 12, backgroundColor: '#26C6DA', borderRadius: 3 }} />
                          <Text style={{ fontSize: 10, color: '#666' }}>Med</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 8 }}>
                          <View style={{ width: 20, height: 12, backgroundColor: '#00838F', borderRadius: 3 }} />
                          <Text style={{ fontSize: 10, color: '#666' }}>High</Text>
                        </View>
                      </View>
                      
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
                        <RealisticMuscleDiagram 
                          musclesWithVolume={Object.entries(muscleVolumeMap).map(([name, volume]) => ({ name, volume }))}
                          width={90}
                          height={140}
                          side="front"
                        />
                        <RealisticMuscleDiagram 
                          musclesWithVolume={Object.entries(muscleVolumeMap).map(([name, volume]) => ({ name, volume }))}
                          width={90}
                          height={140}
                          side="back"
                        />
                      </View>
                      
                      {/* Muscle Volume List */}
                      {(() => {
                        const consolidatedVolume = consolidateMuscleVolume(muscleVolumeMap);
                        return Object.keys(consolidatedVolume).length > 0 ? (
                        <View style={{ width: '100%', marginTop: 16 }}>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8, textAlign: 'center' }}>Volume by Muscle Group</Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
                            {Object.entries(consolidatedVolume).sort((a, b) => b[1] - a[1]).map(([muscle, volume]) => {
                              const maxVol = Math.max(...Object.values(consolidatedVolume));
                              const normalizedVol = volume / maxVol;
                              let bgColor = '#B2EBF2'; // Low
                              if (normalizedVol >= 0.66) bgColor = '#00838F'; // High
                              else if (normalizedVol >= 0.33) bgColor = '#26C6DA'; // Med
                              const textColor = normalizedVol >= 0.66 ? '#fff' : '#333';
                              
                              return (
                                <View key={muscle} style={{ 
                                  backgroundColor: bgColor, 
                                  paddingHorizontal: 10, 
                                  paddingVertical: 6, 
                                  borderRadius: 12,
                                }}>
                                  <Text style={{ fontSize: 11, color: textColor, fontWeight: '600' }}>{muscle}: {Math.round(volume).toLocaleString()}</Text>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      ) : (
                        <Text style={{ fontSize: 13, color: '#888', marginTop: 16, textAlign: 'center' }}>Complete workouts to see which muscles you've trained</Text>
                      );
                      })()}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        );
      case 'saved':
        const savedRecipes: Recipe[] = recipeState.saved;
        const savedWorkouts: Workout[] = workoutState.savedWorkouts;
        
        return (
          <ScrollView contentContainerStyle={styles.savedContent}>
            <Text style={styles.tabTitle}>Saved</Text>
            
            {/* Saved Workouts */}
            {savedWorkouts.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.sectionTitle}>💾 Saved Workouts</Text>
                {savedWorkouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onStart={() => setActiveWorkout(workout)}
                    onEdit={openWorkoutEditor}
                    isSaved={true}
                    onUnsave={() => workoutStore.unsaveWorkout(workout.id)}
                  />
                ))}
              </View>
            )}
            
            {/* Saved Recipes */}
            {savedRecipes.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.sectionTitle}>🍳 Saved Recipes</Text>
                <View style={styles.recipesGrid}>
                  {savedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      isSaved={true}
                      onSave={() => {}}
                      onUnsave={() => recipeStore.unsaveRecipe(recipe.id)}
                      onLogMeal={handleLogMeal}
                    />
                  ))}
                </View>
              </View>
            )}
            
            {/* Empty State */}
            {savedRecipes.length === 0 && savedWorkouts.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📌</Text>
                <Text style={styles.emptyTitle}>No saved items yet</Text>
                <Text style={styles.emptyDesc}>Save workouts and recipes to find them here!</Text>
              </View>
            )}
          </ScrollView>
        );
      case 'games':
        return (
          <ScrollView contentContainerStyle={styles.gamesContent}>
            <Text style={styles.tabTitle}>Games</Text>
            
            <View style={styles.gameSection}>
              <Link href="/games/trivia" asChild>
                <TouchableOpacity style={styles.gameCard}>
                  <Text style={styles.gameEmoji}>🎯</Text>
                  <Text style={styles.gameTitle}>Fitness Trivia</Text>
                  <Text style={styles.gameDesc}>Test your fitness knowledge</Text>
                  <Text style={styles.gameMeta}>⏱️ 5 min • ⭐ 3.8</Text>
                </TouchableOpacity>
              </Link>

              <Link href="/games/bingo" asChild>
                <TouchableOpacity style={styles.gameCard}>
                  <Text style={styles.gameEmoji}>🎪</Text>
                  <Text style={styles.gameTitle}>Fitness Bingo</Text>
                  <Text style={styles.gameDesc}>Complete exercises to win</Text>
                  <Text style={styles.gameMeta}>⏱️ 20 min • ⭐ 4.2</Text>
                </TouchableOpacity>
              </Link>

              <Link href="/games/jeopardy" asChild>
                <TouchableOpacity style={styles.gameCard}>
                  <Text style={styles.gameEmoji}>🎬</Text>
                  <Text style={styles.gameTitle}>Jeopardy Challenge</Text>
                  <Text style={styles.gameDesc}>Pick amounts, answer questions</Text>
                  <Text style={styles.gameMeta}>⏱️ 10 min • ⭐ 4.5</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  // Render loading indicator if stores are not hydrated
  if (!userHydrated || !nutritionHydrated) {
    return (
      <ThemedView style={styles.screen}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#888' }}>Loading your data...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E8E8E8' }} edges={['top']}>
    <ThemedView style={styles.screen}>
      {renderTabContent()}

      <View style={styles.bottomNav}>
        <TabButton
          label="📊"
          tab="progress"
          active={activeTab === 'progress'}
          onPress={() => setActiveTab('progress')}
        />
        <TabButton
          label="🍎"
          tab="nutrition"
          active={activeTab === 'nutrition'}
          onPress={() => setActiveTab('nutrition')}
        />
        <TabButton
          label="💪"
          tab="workouts"
          active={activeTab === 'workouts'}
          onPress={() => setActiveTab('workouts')}
        />
        <TabButton
          label="🏠"
          tab="home"
          active={activeTab === 'home'}
          onPress={() => setActiveTab('home')}
          center
        />
        <TabButton
          label="🍽️"
          tab="recipes"
          active={activeTab === 'recipes'}
          onPress={() => setActiveTab('recipes')}
        />
        <TabButton
          label="📌"
          tab="saved"
          active={activeTab === 'saved'}
          onPress={() => setActiveTab('saved')}
        />
        <TabButton
          label="🎮"
          tab="games"
          active={activeTab === 'games'}
          onPress={() => setActiveTab('games')}
        />
      </View>

      {/* Account Modal at root */}
      <AccountModal visible={accountModalVisible} onClose={() => { setAccountModalVisible(false); loadAvatar(); }} />

      {/* Workout Summary Modal - Enhanced */}
      <Modal
        visible={!!workoutSummary}
        transparent
        animationType="slide"
        onRequestClose={() => setWorkoutSummary(null)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}> 
          <View style={[styles.modalContent, { width: '90%', maxWidth: 360, alignItems: 'center', padding: 24 }]}> 
            {/* Header */}
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🎉</Text>
            <Text style={[styles.modalTitle, { fontSize: 22, marginBottom: 4 }]}>Workout Complete!</Text>
            {workoutSummary && (
              <>
                <Text style={{ fontSize: 15, color: '#666', marginBottom: 20 }}>{workoutSummary.workoutTitle}</Text>
                
                {/* XP Banner */}
                <View style={{ backgroundColor: '#FFD700', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 32, marginBottom: 4 }}>⭐</Text>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A1A1A' }}>+{workoutSummary.xp} XP</Text>
                  <Text style={{ fontSize: 12, color: '#333', marginTop: 4 }}>Added to your profile!</Text>
                </View>
                
                {/* Stats Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
                  <View style={{ width: '48%', backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginBottom: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#00B8A9' }}>
                      {Math.floor(workoutSummary.totalTime / 60)}:{(workoutSummary.totalTime % 60).toString().padStart(2, '0')}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Duration</Text>
                  </View>
                  <View style={{ width: '48%', backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginBottom: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#00B8A9' }}>{workoutSummary.loggedSets?.length || 0}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Sets Logged</Text>
                  </View>
                  <View style={{ width: '48%', backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#00B8A9' }}>{Math.round(loadIn(workoutSummary.totalVolume, 'lbs', units))}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Total Volume ({wUnit})</Text>
                  </View>
                  <View style={{ width: '48%', backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#00B8A9' }}>
                      {workoutSummary.loggedSets?.length > 0 
                        ? Math.round(workoutSummary.loggedSets.reduce((sum: number, s: any) => sum + s.reps, 0) / workoutSummary.loggedSets.length) 
                        : 0}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Avg Reps/Set</Text>
                  </View>
                </View>
                
                {/* Level Progress (if applicable) */}
                {profile?.level && (
                  <View style={{ backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12, width: '100%', marginBottom: 16 }}>
                    <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#1976D2' }}>
                      🏆 Level {profile.level} • {profile.xp || 0} Total XP
                    </Text>
                  </View>
                )}
              </>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { marginTop: 8, width: '100%', paddingVertical: 14 }]}
              onPress={() => setWorkoutSummary(null)}
            >
              <Text style={[styles.saveButtonText, { fontSize: 16 }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Past Workout Details Modal */}
      <Modal
        visible={!!viewingPastWorkout}
        transparent
        animationType="slide"
        onRequestClose={() => setViewingPastWorkout(null)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}> 
          <View style={[styles.modalContent, { 
            width: '100%', 
            height: '90%', 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            padding: 0 
          }]}>
            {viewingPastWorkout && (
              <WorkoutSummary
                workoutTitle={viewingPastWorkout.workoutTitle}
                loggedSets={viewingPastWorkout.loggedSets || []}
                totalDuration={viewingPastWorkout.totalDuration || 0}
                onFinish={() => setViewingPastWorkout(null)}
                isHistoryView={true}
                workoutDate={viewingPastWorkout.startTime ? new Date(viewingPastWorkout.startTime) : undefined}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={weightModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setWeightModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Edit Current Weight</Text>
            <TextInput
              style={styles.modalInput}
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="decimal-pad"
              placeholder={`Enter weight (${wUnit})`}
              placeholderTextColor="#999"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setWeightModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveWeight}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Workout Confirmation Modal */}
      <Modal
        visible={deleteConfirmWorkoutId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmWorkoutId(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDeleteConfirmWorkoutId(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>🗑️</Text>
            <Text style={styles.modalTitle}>Delete Workout?</Text>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
              This workout will be permanently deleted. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteConfirmWorkoutId(null)}
              >
                <Text style={styles.cancelButtonText}>Keep It</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FF6B6B' }]}
                onPress={confirmDeleteWorkout}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={customRecipeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomRecipeModalVisible(false)}
      >
        <View style={styles.recipeModalOverlay}>
          <ScrollView contentContainerStyle={styles.recipeModalContent}>
            <Text style={styles.modalTitle}>Create Custom Recipe</Text>

            <Text style={styles.inputLabel}>Recipe Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newRecipeName}
              onChangeText={setNewRecipeName}
              placeholder="e.g., Chocolate Protein Shake"
              placeholderTextColor="#999"
              autoFocus
            />

            <Text style={styles.inputLabel}>Calories</Text>
            <TextInput
              style={styles.modalInput}
              value={newRecipeCalories}
              onChangeText={setNewRecipeCalories}
              keyboardType="decimal-pad"
              placeholder="e.g., 350"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Protein (g)</Text>
            <TextInput
              style={styles.modalInput}
              value={newRecipeProtein}
              onChangeText={setNewRecipeProtein}
              keyboardType="decimal-pad"
              placeholder="e.g., 25"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Carbs (g)</Text>
            <TextInput
              style={styles.modalInput}
              value={newRecipeCarbs}
              onChangeText={setNewRecipeCarbs}
              keyboardType="decimal-pad"
              placeholder="e.g., 40"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Fat (g)</Text>
            <TextInput
              style={styles.modalInput}
              value={newRecipeFat}
              onChangeText={setNewRecipeFat}
              keyboardType="decimal-pad"
              placeholder="e.g., 8"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCustomRecipeModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddCustomRecipe}
              >
                <Text style={styles.saveButtonText}>Create Recipe</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <WorkoutBuilder
        visible={workoutBuilderVisible}
        initialWorkout={editingWorkout || undefined}
        heading={builderHeading}
        notice={builderNotice}
        onSave={handleSaveWorkout}
        onClose={() => {
          setWorkoutBuilderVisible(false);
          setEditingWorkout(null);
          setBuilderHeading(undefined);
          setBuilderNotice(undefined);
        }}
      />

      <ExerciseLibraryModal visible={libraryVisible} onClose={() => setLibraryVisible(false)} />

      <ImportWorkoutModal
        visible={importVisible}
        onClose={() => setImportVisible(false)}
        onImport={(draft) => {
          setImportVisible(false);
          // iOS can't present a modal while another is still dismissing
          setTimeout(() => {
            setBuilderHeading('Review Imported Workout');
            setBuilderNotice(
              draft.exercises.some((e) => e.exerciseId.startsWith('import-'))
                ? 'Exercises that weren’t in the library will be added to your exercises when you save.'
                : undefined
            );
            setEditingWorkout(draft);
            setWorkoutBuilderVisible(true);
          }, 400);
        }}
      />

      {activeWorkout && (
        <WorkoutExecutor
          workout={activeWorkout}
          onComplete={(session) => {
            console.log('[HomeScreen] onComplete called from WorkoutExecutor', session);
            handleWorkoutComplete(session);
          }}
          onCancel={() => {
            console.log('[HomeScreen] onCancel called from WorkoutExecutor');
            setActiveWorkout(null);
          }}
        />
      )}

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </ThemedView>
    </SafeAreaView>
  );
}

interface NutritionTabProps {
  nutrition: any;
  profile: any;
  goal?: string;
}

function NutritionTab({ nutrition, profile, goal }: NutritionTabProps) {
  const units = useUnits();
  // "Why it matters" tips start visible; each one can be hidden and is remembered per user
  const [tipsVisible, setTipsVisible] = useState({ water: true, sleep: true });
  const tipsKey = `nutritionTips_${authStore.getCurrentUserId() ?? 'guest'}`;
  useEffect(() => {
    AsyncStorage.getItem(tipsKey)
      .then((saved) => {
        if (saved) setTipsVisible((prev) => ({ ...prev, ...JSON.parse(saved) }));
      })
      .catch(() => {});
  }, [tipsKey]);
  const toggleTip = (tip: 'water' | 'sleep') => {
    setTipsVisible((prev) => {
      const next = { ...prev, [tip]: !prev[tip] };
      AsyncStorage.setItem(tipsKey, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };
  const [addingMeal, setAddingMeal] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealFat, setMealFat] = useState('');
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [newSleep, setNewSleep] = useState('');
  const [macroHelpVisible, setMacroHelpVisible] = useState(false);
  const [foodSuggestions, setFoodSuggestions] = useState<FoodItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // XP Animation state
  const [showWaterXP, setShowWaterXP] = useState(false);
  const [showSleepXP, setShowSleepXP] = useState(false);
  const [sleepXPAmount, setSleepXPAmount] = useState(0);
  const waterXPAnim = useRef(new Animated.Value(0)).current;
  const sleepXPAnim = useRef(new Animated.Value(0)).current;

  const calorieTarget = profile?.calorieTarget || 2000;
  const todayDate = new Date().toISOString().split('T')[0];
  const today: any = nutrition ? nutrition[todayDate] : null;
  const waterIntake = today?.waterIntake || 0;
  const sleepHours = today?.sleepHours || 0;
  const meals = today?.meals || [];
  const totalCalories = today?.totalCalories || 0;
  const totalProtein = today?.totalProtein || 0;
  const totalCarbs = today?.totalCarbs || 0;
  const totalFat = today?.totalFat || 0;
  
  // Get user info for personalized macros
  const weightLbs = (profile?.weightKg || 70) * 2.20462;
  const activity = profile?.activity || 'Moderate';
  const gender = profile?.gender || 'Other';
  const goalType = goal || 'Maintain weight';
  
  // PERSONALIZED PROTEIN CALCULATION
  // Based on activity level and goal
  let proteinMultiplier = 0.8; // Base: 0.8g per lb for sedentary
  
  if (activity === 'Very Active' || activity === 'Extremely Active') {
    proteinMultiplier = 1.2; // Athletes need more
  } else if (activity === 'Active') {
    proteinMultiplier = 1.0;
  } else if (activity === 'Moderate') {
    proteinMultiplier = 0.9;
  }
  
  // Adjust for goal
  if (goalType === 'Build muscle') {
    proteinMultiplier += 0.2; // Extra protein for muscle building
  } else if (goalType === 'Lose fat') {
    proteinMultiplier += 0.1; // Higher protein helps preserve muscle during cut
  } else if (goalType.toLowerCase().includes('recomposition')) {
    proteinMultiplier = 1.0; // 1g per pound for body recomposition
  }
  
  const proteinTarget = Math.round(weightLbs * proteinMultiplier);
  const proteinCalories = proteinTarget * 4;
  
  // PERSONALIZED FAT CALCULATION
  // Women need slightly more fat for hormones, athletes need moderate fat
  let fatPercentage = 0.25; // 25% of calories from fat (baseline)
  
  if (gender === 'Female') {
    fatPercentage = 0.30; // Women need 30% for hormonal health
  } else if (gender === 'Male') {
    fatPercentage = 0.25; // Men can do well with 25%
  }
  
  // Adjust for activity - very active people can reduce fat slightly to increase carbs
  if (activity === 'Very Active' || activity === 'Extremely Active') {
    fatPercentage = Math.max(0.20, fatPercentage - 0.05);
  }
  
  const fatCalories = Math.round(calorieTarget * fatPercentage);
  const fatTarget = Math.round(fatCalories / 9);
  
  // PERSONALIZED CARBS CALCULATION
  // Fill remaining calories - athletes get more carbs for fuel
  const remainingCalories = calorieTarget - proteinCalories - fatCalories;
  const carbsTarget = Math.round(remainingCalories / 4);
  
  // Macro reasons with personalization
  const activityLabel = activity === 'Extremely Active' || activity === 'Very Active' ? 'high activity level (athlete)' : 
                        activity === 'Active' ? 'active lifestyle' : 
                        activity === 'Moderate' ? 'moderate activity' : 'activity level';
  
  const perBodyWeight = units === 'metric' ? `${(proteinMultiplier * 2.20462).toFixed(1)}g per kg` : `${proteinMultiplier.toFixed(1)}g per lb`;
  const proteinReason = `${proteinTarget}g (${perBodyWeight}) - Personalized for ${activityLabel} and ${goalType.toLowerCase()} goal. ${
    goalType === 'Build muscle' ? 'Higher protein supports muscle growth.' : 
    goalType === 'Lose fat' ? 'Higher protein preserves muscle during fat loss.' : 
    'Adequate protein maintains muscle mass.'
  }`;
  
  const carbsReason = `${carbsTarget}g - Fills remaining calories after protein and fat. ${
    activity === 'Very Active' || activity === 'Extremely Active' ? 'High carbs fuel your intense training and recovery.' :
    activity === 'Active' ? 'Moderate carbs support your active lifestyle.' :
    'Balanced carbs provide steady energy throughout the day.'
  }`;
  
  const fatReason = `${fatTarget}g (${Math.round(fatPercentage * 100)}% of calories) - ${
    gender === 'Female' ? 'Higher fat supports hormonal health for women.' :
    gender === 'Male' ? 'Adequate fat for testosterone and hormone production.' :
    'Supports hormone production and nutrient absorption.'
  }`;
  
  // Dynamic calorie explanation for macro help modal
  let calorieReason = '';
  const weightKg = profile?.weightKg;
  const targetWeightKg = profile?.targetWeightKg;
  const daysToTarget = profile?.daysToTarget || profile?.targetDays;
  // Calculate maintenance (TDEE)
  let tdee = 0;
  if (weightKg && profile?.heightCm && profile?.age && profile?.gender && profile?.activity) {
    let bmr = 0;
    if (profile.gender === 'Female') {
      bmr = 10 * weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
    } else {
      bmr = 10 * weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
    }
    let activityMultiplier = 1.2;
    switch (profile.activity) {
      case 'Sedentary': activityMultiplier = 1.2; break;
      case 'Light (1–3x/week)': activityMultiplier = 1.375; break;
      case 'Moderate (3–5x/week)': activityMultiplier = 1.55; break;
      case 'Very Active (5–7x/week)': activityMultiplier = 1.725; break;
    }
    tdee = bmr * activityMultiplier;
  }
  let calDelta = 0;
  let calDeltaType = '';
  if (goalType.toLowerCase().includes('lose') && tdee && calorieTarget < tdee) {
    calDelta = Math.round(tdee - calorieTarget);
    calDeltaType = 'deficit';
    calorieReason = `This is a calorie deficit of ${calDelta} cal/day. For weight loss, you need to eat less than your body burns. Stick to this deficit to lose weight safely.`;
  } else if ((goalType.toLowerCase().includes('gain') || goalType.toLowerCase().includes('build')) && tdee && calorieTarget > tdee) {
    calDelta = Math.round(calorieTarget - tdee);
    calDeltaType = 'surplus';
    calorieReason = `This is a calorie surplus of ${calDelta} cal/day. For weight gain, you need to eat more than your body burns. Stick to this surplus to gain weight or muscle.`;
  } else if (tdee && Math.abs(calorieTarget - tdee) < 10) {
    calDelta = 0;
    calDeltaType = 'maintenance';
    calorieReason = `This is your maintenance calories—eating this amount will keep your weight stable.`;
  } else if (profile?.targetWeightKg && daysToTarget && tdee) {
    calDelta = Math.round(calorieTarget - tdee);
    calDeltaType = calDelta > 0 ? 'surplus' : calDelta < 0 ? 'deficit' : 'maintenance';
    calorieReason = `Custom target based on your goal to ${goalType.toLowerCase()} (${Math.abs(calDelta)} cal ${calDeltaType === 'maintenance' ? '' : calDeltaType}).`;
  } else {
    calorieReason = `Standard target for ${goalType.toLowerCase()}`;
  }



  const handleAddWater = () => {
    nutritionStore.addWater(250); // 250ml per glass
    
    // Award 10 XP for each glass of water
    const userProfile = userStore.getState().profile;
    if (userProfile) {
      const prevXP = userProfile.xp || 0;
      const prevLevel = userProfile.level || 1;
      const newXP = prevXP + 10;
      const newLevel = prevLevel + Math.floor(newXP / 100) - Math.floor(prevXP / 100);
      userStore.setProfile({
        ...userProfile,
        xp: newXP,
        level: newLevel,
      });
    }
    
    // Show XP animation
    setShowWaterXP(true);
    waterXPAnim.setValue(0);
    Animated.sequence([
      Animated.timing(waterXPAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(waterXPAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowWaterXP(false));
  };

  const handleMealNameChange = (text: string) => {
    setMealName(text);
    if (text.length >= 2) {
      const suggestions = searchFoodDatabase(text);
      setFoodSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setFoodSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setMealName(food.name);
    setMealCalories(food.calories.toString());
    setMealProtein(food.protein.toString());
    setMealCarbs(food.carbs.toString());
    setMealFat(food.fat.toString());
    setShowSuggestions(false);
    setFoodSuggestions([]);
  };

  const handleAddMeal = () => {
    if (mealName.trim() && mealCalories.trim()) {
      nutritionStore.addMeal({
        name: mealName.trim(),
        calories: Math.round(parseFloat(mealCalories)) || 0,
        protein: parseFloat(mealProtein) || 0,
        carbs: parseFloat(mealCarbs) || 0,
        fat: parseFloat(mealFat) || 0,
      });
      setMealName('');
      setMealCalories('');
      setMealProtein('');
      setMealCarbs('');
      setMealFat('');
      setAddingMeal(false);
      setShowSuggestions(false);
      setFoodSuggestions([]);
    }
  };

  const handleRemoveMeal = (index: number) => {
    nutritionStore.removeMeal(index);
  };

  const handleSleep = (hours: string) => {
    if (hours.trim()) {
      nutritionStore.logSleep(parseFloat(hours) || 0);
    }
  };

  const handleEditSleep = () => {
    setNewSleep(sleepHours?.toString() || '');
    setSleepModalVisible(true);
  };

  const handleSaveSleep = () => {
    const sleep = parseFloat(newSleep);
    if (!isNaN(sleep) && sleep >= 0) {
      nutritionStore.logSleep(sleep);
      
      // Award 10 XP per hour of sleep
      const userProfile = userStore.getState().profile;
      const xpEarned = Math.round(sleep * 10);
      if (userProfile) {
        const prevXP = userProfile.xp || 0;
        const prevLevel = userProfile.level || 1;
        const newXP = prevXP + xpEarned;
        const newLevel = prevLevel + Math.floor(newXP / 100) - Math.floor(prevXP / 100);
        userStore.setProfile({
          ...userProfile,
          xp: newXP,
          level: newLevel,
        });
      }
      
      setSleepModalVisible(false);
      setNewSleep('');
      
      // Show XP animation
      setSleepXPAmount(xpEarned);
      setShowSleepXP(true);
      sleepXPAnim.setValue(0);
      Animated.sequence([
        Animated.timing(sleepXPAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(sleepXPAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowSleepXP(false));
    }
  };

  const handleResetWater = () => {
    nutritionStore.resetWater();
  };

  const handleResetSleep = () => {
    nutritionStore.resetSleep();
  };

  const glassesCount = Math.floor(waterIntake / 250);
  const waterPercentage = Math.min((glassesCount / 8) * 100, 100);

  const handleUpdateCalories = (newCalories: number) => {
    nutritionStore.updateCalories(newCalories);
  };

  const handleUpdateProtein = (newProtein: number) => {
    nutritionStore.updateProtein(newProtein);
  };

  const handleUpdateCarbs = (newCarbs: number) => {
    nutritionStore.updateCarbs(newCarbs);
  };

  const handleUpdateFat = (newFat: number) => {
    nutritionStore.updateFat(newFat);
  };

  const handleResetCalories = () => {
    nutritionStore.updateCalories(0);
  };

  const handleResetProtein = () => {
    nutritionStore.updateProtein(0);
  };

  const handleResetCarbs = () => {
    nutritionStore.updateCarbs(0);
  };

  const handleResetFat = () => {
    nutritionStore.updateFat(0);
  };

  return (
    <ScrollView contentContainerStyle={styles.nutritionContent}>
      <Text style={styles.tabTitle}>Nutrition Tracker</Text>

      {/* Macro Wheels */}
      <View style={styles.macroWheelsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Macros</Text>
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={() => setMacroHelpVisible(true)}
          >
            <Text style={styles.helpButtonText}>ℹ️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>Tap any wheel to edit manually</Text>
        <View style={styles.wheelsGrid}>
          <MacroWheel
            label="Calories"
            value={totalCalories}
            target={calorieTarget}
            unit="cal"
            color="#00B8A9"
            onUpdate={handleUpdateCalories}
            onReset={handleResetCalories}
          />
          <MacroWheel
            label="Protein"
            value={totalProtein}
            target={proteinTarget}
            unit="g"
            color="#FF6B6B"
            onUpdate={handleUpdateProtein}
            onReset={handleResetProtein}
          />
        </View>
        <View style={styles.wheelsGrid}>
          <MacroWheel
            label="Carbs"
            value={totalCarbs}
            target={carbsTarget}
            unit="g"
            color="#4ECDC4"
            onUpdate={handleUpdateCarbs}
            onReset={handleResetCarbs}
          />
          <MacroWheel
            label="Fat"
            value={totalFat}
            target={fatTarget}
            unit="g"
            color="#FFE66D"
            onUpdate={handleUpdateFat}
            onReset={handleResetFat}
          />
        </View>
      </View>

      {/* Macro Breakdown */}
      <MacroBreakdown
        protein={totalProtein}
        carbs={totalCarbs}
        fat={totalFat}
        calories={totalCalories}
      />

      {/* Water Tracker */}
      <View style={styles.trackerSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Water Intake</Text>
          <TouchableOpacity onPress={() => toggleTip('water')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.tipToggle}>{tipsVisible.water ? 'Hide' : 'Why it matters'}</Text>
          </TouchableOpacity>
        </View>
        {tipsVisible.water && (
          <View style={styles.waterInfoBox}>
            <Text style={styles.infoText}>💧 <Text style={styles.infoBold}>Why Water Matters:</Text> Proper hydration boosts metabolism, aids digestion, and enhances workout performance. Aim for 8 glasses daily—adjust based on activity level and climate.</Text>
          </View>
        )}
        <View style={styles.trackerRow}>
          <View style={styles.trackerDisplay}>
            <Text style={styles.trackerValue}>{glassesCount}</Text>
            <Text style={styles.trackerLabel}>glasses</Text>
          </View>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddWater}>
              <Text style={styles.addButtonText}>+ Add 1</Text>
            </TouchableOpacity>
            {showWaterXP && (
              <Animated.View
                style={[
                  styles.xpAnimation,
                  {
                    opacity: waterXPAnim,
                    transform: [{
                      translateY: waterXPAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -30],
                      }),
                    }],
                  },
                ]}
              >
                <Text style={styles.xpAnimationText}>+10 XP 💧</Text>
              </Animated.View>
            )}
          </View>
          <TouchableOpacity style={[styles.addButton, styles.resetButton]} onPress={handleResetWater}>
            <Text style={styles.addButtonText}>↺ Reset</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.waterGoalBar}>
          <View style={[styles.waterGoalFill, { width: `${waterPercentage}%` }]} />
        </View>
        <Text style={styles.goalText}>Goal: 8 glasses / day</Text>
      </View>

      {/* Sleep Tracker */}
      <View style={styles.trackerSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Sleep Last Night</Text>
          <TouchableOpacity onPress={() => toggleTip('sleep')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.tipToggle}>{tipsVisible.sleep ? 'Hide' : 'Why it matters'}</Text>
          </TouchableOpacity>
        </View>
        {tipsVisible.sleep && (
          <View style={styles.sleepInfoBox}>
            <Text style={styles.infoText}>😴 <Text style={styles.infoBold}>Why Sleep Matters:</Text> Quality sleep supports muscle recovery, reduces cravings, and optimizes hormone balance. Most adults need 7-9 hours nightly for peak fitness performance.</Text>
          </View>
        )}
        <View style={styles.trackerRow}>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity onPress={handleEditSleep} style={styles.trackerDisplay}>
              <Text style={styles.trackerValue}>{sleepHours || '-'}</Text>
              <Text style={styles.trackerLabel}>hours</Text>
            </TouchableOpacity>
            {showSleepXP && (
              <Animated.View
                style={[
                  styles.xpAnimation,
                  {
                    opacity: sleepXPAnim,
                    transform: [{
                      translateY: sleepXPAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -30],
                      }),
                    }],
                  },
                ]}
              >
                <Text style={styles.xpAnimationText}>+{sleepXPAmount} XP 😴</Text>
              </Animated.View>
            )}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleEditSleep}>
            <Text style={styles.addButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addButton, styles.resetButton]} onPress={handleResetSleep}>
            <Text style={styles.addButtonText}>↺ Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Meals */}
      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>
        {meals.length > 0 ? (
          meals.map((meal: any, index: number) => (
            <View key={index} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealItem}>{meal.name}</Text>
                  <Text style={styles.mealCal}>
                    {roundCalories(meal.calories)} cal • P: {roundMacro(meal.protein || 0)}g • C: {roundMacro(meal.carbs || 0)}g • F: {roundMacro(meal.fat || 0)}g
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveMeal(index)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyMealsText}>No meals logged yet</Text>
        )}

        {!addingMeal ? (
          <TouchableOpacity style={styles.addMealButton} onPress={() => setAddingMeal(true)}>
            <Text style={styles.addMealButtonText}>+ Add Meal</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addMealForm}>
            <View>
              <TextInput
                style={styles.mealInput}
                placeholder="Meal name (e.g., banana, chicken)"
                placeholderTextColor="#CCC"
                value={mealName}
                onChangeText={handleMealNameChange}
                onFocus={() => {
                  if (foodSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />
              {showSuggestions && foodSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView 
                    style={styles.suggestionsList}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {foodSuggestions.map((food, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handleSelectFood(food)}
                      >
                        <View style={styles.suggestionContent}>
                          <Text style={styles.suggestionName}>{food.name}</Text>
                          <Text style={styles.suggestionServing}>{food.serving}</Text>
                          <Text style={styles.suggestionMacros}>
                            {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            <TextInput
              style={styles.mealInput}
              placeholder="Calories"
              placeholderTextColor="#CCC"
              keyboardType="number-pad"
              value={mealCalories}
              onChangeText={setMealCalories}
            />
            <TextInput
              style={styles.mealInput}
              placeholder="Protein (g)"
              placeholderTextColor="#CCC"
              keyboardType="decimal-pad"
              value={mealProtein}
              onChangeText={setMealProtein}
            />
            <TextInput
              style={styles.mealInput}
              placeholder="Carbs (g)"
              placeholderTextColor="#CCC"
              keyboardType="decimal-pad"
              value={mealCarbs}
              onChangeText={setMealCarbs}
            />
            <TextInput
              style={styles.mealInput}
              placeholder="Fat (g)"
              placeholderTextColor="#CCC"
              keyboardType="decimal-pad"
              value={mealFat}
              onChangeText={setMealFat}
            />
            <View style={styles.mealFormButtons}>
              <TouchableOpacity style={styles.saveMealButton} onPress={handleAddMeal}>
                <Text style={styles.saveMealButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelMealButton} onPress={() => {
                setMealName('');
                setMealCalories('');
                setMealProtein('');
                setMealCarbs('');
                setMealFat('');
                setAddingMeal(false);
                setShowSuggestions(false);
                setFoodSuggestions([]);
              }}>
                <Text style={styles.cancelMealButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Modal
        visible={sleepModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSleepModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSleepModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Edit Sleep Hours</Text>
            <TextInput
              style={styles.modalInput}
              value={newSleep}
              onChangeText={setNewSleep}
              keyboardType="decimal-pad"
              placeholder="Enter hours (e.g., 8.5)"
              placeholderTextColor="#999"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSleepModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveSleep}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Macro Help Modal */}
      <Modal
        visible={macroHelpVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMacroHelpVisible(false)}
      >
        <View style={styles.helpModalOverlay}>
          <View style={styles.helpModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.helpModalTitle}>Your Macro Targets Explained</Text>
            
            <View style={styles.helpSection}>
              <Text style={styles.helpSectionTitle}>
                🔥 Calories: {calorieTarget}
                {calDeltaType && calDeltaType !== 'maintenance' && (
                  <Text style={{ color: calDeltaType === 'deficit' ? '#E67E22' : '#00B8A9', fontWeight: 'bold' }}>  ({Math.abs(calDelta)} cal {calDeltaType})</Text>
                )}
              </Text>
              <Text style={styles.helpSectionText}>{calorieReason}</Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpSectionTitle}>🥩 Protein: {proteinTarget}g</Text>
              <Text style={styles.helpSectionText}>{proteinReason}</Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpSectionTitle}>🍞 Carbs: {carbsTarget}g</Text>
              <Text style={styles.helpSectionText}>{carbsReason}</Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpSectionTitle}>🥑 Fat: {fatTarget}g</Text>
              <Text style={styles.helpSectionText}>{fatReason}</Text>
            </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.helpCloseButton}
              onPress={() => setMacroHelpVisible(false)}
            >
              <Text style={styles.helpCloseButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function TabButton({
  label,
  tab,
  active,
  onPress,
  center,
}: {
  label: string;
  tab: string;
  active: boolean;
  onPress: () => void;
  center?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        center && styles.tabButtonCenter,
        active && styles.tabButtonActive,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.tabLabel, center && styles.tabLabelLarge]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    waterInfoBox: {
      backgroundColor: '#e6f7ff',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#b3e0ff',
    },
    sleepInfoBox: {
      backgroundColor: '#f3e6ff',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#d1b3ff',
    },
    infoText: {
      fontSize: 13,
      color: '#444',
      lineHeight: 18,
    },
    xpAnimation: {
      position: 'absolute',
      top: -20,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 100,
    },
    xpAnimationText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#00B8A9',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
  screen: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  homeContent: {
    padding: 24,
    paddingBottom: 120,
    gap: 16,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00B8A9',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  fact: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B8A9',
    letterSpacing: 0.3,
  },
  factBody: {
    fontSize: 13,
    color: '#4A4A4A',
    lineHeight: 18,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  settingsIcon: {
    fontSize: 20,
  },
  goalCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#00B8A9',
    gap: 4,
  },

  goalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B8A9',
  },

  goalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  weightCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCC',
    gap: 12,
  },

  weightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  weightCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  unitToggle: {
    backgroundColor: '#00B8A9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  unitToggleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  weightLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },

  weightValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  challenges: {
    gap: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  catalogItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  catalogItemOpen: {
    borderColor: '#00B8A9',
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  catalogEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FBFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogEmoji: {
    fontSize: 22,
  },
  catalogText: {
    flex: 1,
    gap: 2,
  },
  catalogName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  catalogNameOpen: {
    color: '#00B8A9',
  },
  catalogCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B8A9',
  },
  catalogDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginTop: 2,
  },
  catalogChevron: {
    fontSize: 18,
    color: '#999',
  },
  catalogWorkouts: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    backgroundColor: '#F7F9F9',
    borderTopWidth: 1,
    borderTopColor: '#E8F0EF',
    paddingTop: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipToggle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00B8A9',
  },

  challengeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#CCC',
  },

  challengeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  challengeDetail: {
    fontSize: 13,
    color: '#4A4A4A',
    lineHeight: 18,
  },

  startButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },

  startButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Nutrition tab
  nutritionContent: {
    padding: 24,
    paddingBottom: 120,
    gap: 24,
  },
  tabTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  macroWheelsSection: {
    gap: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    fontSize: 18,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: -8,
    marginBottom: 8,
  },
  pastWorkoutsList: {
    gap: 10,
    marginTop: 8,
  },
  pastWorkoutCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  pastWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  pastWorkoutName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  pastWorkoutDate: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
  },
  pastWorkoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pastWorkoutStat: {
    alignItems: 'center',
  },
  pastWorkoutStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00B8A9',
  },
  pastWorkoutStatLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
  },
  prsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  prCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#FFE5B4',
  },
  prExerciseName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  prWeight: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D4A500',
  },
  prReps: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  prDate: {
    fontSize: 10,
    color: '#AAA',
    marginTop: 4,
  },
  weeklyProgressContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 12,
  },
  weeklyProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weeklyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    width: 75,
  },
  weeklyBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  weeklyBar: {
    height: '100%',
    borderRadius: 6,
    minWidth: 4,
  },
  weeklyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 75,
    justifyContent: 'flex-end',
    gap: 6,
  },
  weeklyVolume: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  weeklyWorkouts: {
    fontSize: 10,
    color: '#888',
    fontWeight: '500',
  },
  macroInfoBox: {
    backgroundColor: '#F0FFFE',
    borderLeftWidth: 4,
    borderLeftColor: '#00B8A9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBold: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  macroTargetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  macroTargetLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  macroTargetReason: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
  },
  macroTargetInfoSmall: {
    flex: 1,
    backgroundColor: '#FFE5E5',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  macroTargetLabelSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  macroTargetReasonSmall: {
    fontSize: 11,
    color: '#555',
    lineHeight: 14,
  },
  wheelsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  macroSection: {
    gap: 12,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    gap: 8,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  macroTarget: {
    fontSize: 11,
    color: '#4A4A4A',
  },
  macroBar: {
    height: 6,
    backgroundColor: '#00B8A9',
    borderRadius: 3,
  },
  calorieText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  calorieCard: {
    backgroundColor: '#F0FFFE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#00B8A9',
    alignItems: 'center',
    gap: 8,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00B8A9',
  },
  calorieGoal: {
    fontSize: 14,
    color: '#888',
  },
  trackerSection: {
    gap: 12,
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trackerDisplay: {
    flex: 1,
    backgroundColor: '#F0FFFE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00B8A9',
  },
  trackerValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00B8A9',
  },
  trackerLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  sleepInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    fontSize: 14,
    color: '#1A1A1A',
  },
  addButton: {
    backgroundColor: '#00B8A9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
  },
  logButton: {
    backgroundColor: '#00B8A9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  waterGoalBar: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  waterGoalFill: {
    height: '100%',
    backgroundColor: '#00B8A9',
  },
  sleepQuality: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  qualityEmoji: {
    fontSize: 14,
    color: '#00B8A9',
  },
  goalText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  mealsSection: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
  mealItem: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 4,
  },
  mealCal: {
    fontSize: 12,
    color: '#4A4A4A',
    marginTop: 4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  emptyMealsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 16,
  },
  addMealButton: {
    backgroundColor: '#00B8A9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addMealButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  addMealForm: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCC',
    gap: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 300,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionContent: {
    gap: 4,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  suggestionServing: {
    fontSize: 12,
    color: '#666',
  },
  suggestionMacros: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  mealInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    fontSize: 14,
    color: '#1A1A1A',
  },
  mealFormButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveMealButton: {
    flex: 1,
    backgroundColor: '#00B8A9',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveMealButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  cancelMealButton: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelMealButtonText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 12,
  },

  // Workouts tab
  workoutsContent: {
    padding: 24,
    paddingBottom: 120,
    gap: 24,
  },
  workoutSection: {
    gap: 12,
    marginBottom: 16,
  },
  categorySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B8A9',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  workoutOption: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    gap: 12,
  },
  workoutEmoji: {
    fontSize: 32,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  workoutDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  difficultyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    gap: 12,
  },
  difficultyEmoji: {
    fontSize: 28,
  },
  difficultyInfo: {
    flex: 1,
  },
  difficultyLevel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  difficultyDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  featuredCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#00B8A9',
    gap: 8,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  featuredMeta: {
    fontSize: 13,
    color: '#4A4A4A',
  },
  featuredExercises: {
    fontSize: 13,
    color: '#888',
  },

  // Saved tab
  savedContent: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 300,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Recipes tab
  recipesContent: {
    padding: 24,
    paddingBottom: 120,
  },
  goalRecipeHeader: {
    marginBottom: 16,
  },
  goalRecipeSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  recipesGrid: {
    gap: 16,
    marginBottom: 24,
  },
  addRecipeButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  addRecipeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  recipeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  recipeModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingTop: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 8,
  },

  // Games tab
  gamesContent: {
    padding: 24,
    paddingBottom: 120,
    gap: 24,
  },
  gameSection: {
    gap: 12,
  },
  gameCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCC',
    gap: 8,
  },
  gameEmoji: {
    fontSize: 32,
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  gameDesc: {
    fontSize: 12,
    color: '#4A4A4A',
  },
  gameMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#CCC',
    paddingBottom: 34,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabButtonCenter: {
    marginVertical: -8,
  },
  tabButtonActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 24,
  },
  tabLabelLarge: {
    fontSize: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#00B8A9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: '#00B8A9',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,  0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  helpModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding:  24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  helpModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  helpSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00B8A9',
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  helpSectionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  helpCloseButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  helpCloseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
