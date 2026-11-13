import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ModalSafeArea } from '@/components/modal-safe-area';

import { Exercise, exerciseCatalog } from '../lib/exercises';
import { exerciseStore } from '../lib/exerciseStore';
import { soundStore } from '../lib/soundStore';
import { convertLoad, loadIn, useUnits, weightUnitFor, type WeightUnit } from '../lib/units';
import { useUserStore } from '../lib/userStore';
import type { Workout } from '../lib/workouts';
import { workoutSessionStore } from '../lib/workoutSessionStore';
import RealisticMuscleDiagram from './RealisticMuscleDiagram';
import WorkoutSummary from './WorkoutSummary';

type LoggedSet = {
  exerciseIndex: number;
  exerciseName: string;
  exerciseId?: string;
  setNumber: number;
  reps: number;
  weight: number;
  unit: string;
};

export type WorkoutSession = {
  workoutId: string;
  workoutTitle: string;
  startTime: number;
  endTime?: number;
  totalDuration: number;
  loggedSets: LoggedSet[];
  totalVolume: number;
};

type WorkoutExecutorProps = {
  workout: Workout;
  onComplete: (session: WorkoutSession) => void;
  onCancel: () => void;
};

// A superset/block is a run of consecutive exercises where each one links to the
// next (supersetWith === index + 1). Returns the first and last index of that run.
function getSupersetGroup(exercises: Workout['exercises'], index: number): { start: number; end: number } {
  let start = index;
  while (start > 0 && exercises[start - 1].supersetWith === start) start--;
  let end = index;
  while (end < exercises.length - 1 && exercises[end].supersetWith === end + 1) end++;
  return { start, end };
}

// Utility to format milliseconds as mm:ss
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function WorkoutExecutor({ workout, onComplete, onCancel }: WorkoutExecutorProps) {
    console.log('[WorkoutExecutor] MOUNTED', workout?.title || workout?.id);
  
  // State declarations FIRST - before any functions that use them
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [loggedReps, setLoggedReps] = useState('');
  const [loggedWeight, setLoggedWeight] = useState('');
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);
  const units = useUnits();
  const wUnit = weightUnitFor(units);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [restActive, setRestActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number | null>(null);
  const [lastSessionSets, setLastSessionSets] = useState<LoggedSet[] | null>(null);
  const prefillAppliedRef = useRef<{ [key: string]: boolean }>({});
  const { profile } = useUserStore();
  
  // Current exercise derived from state
  const currentExercise = workout.exercises[currentExerciseIndex];

  // Superset/block: exercises in a group are done back-to-back, one set each, then rest
  const group = getSupersetGroup(workout.exercises, currentExerciseIndex);
  const inGroup = group.end > group.start;
  const groupSize = group.end - group.start + 1;
  const groupPosition = currentExerciseIndex - group.start + 1;
  const groupSets = Math.max(...workout.exercises.slice(group.start, group.end + 1).map((e) => e.sets));
  const nextInRound = (() => {
    if (!inGroup) return null;
    for (let i = currentExerciseIndex + 1; i <= group.end; i++) {
      if (workout.exercises[i].sets >= currentSetNumber) return i;
    }
    return null;
  })();
  // Is there any set left after this one? (no rest needed after the very last set)
  const hasMoreWork = inGroup
    ? nextInRound !== null || currentSetNumber < groupSets || group.end < workout.exercises.length - 1
    : currentSetNumber < (currentExercise?.sets ?? 0) || currentExerciseIndex < workout.exercises.length - 1;
  const restAfterSet = inGroup
    ? workout.exercises[group.end].restSeconds || currentExercise.restSeconds || 0
    : currentExercise?.restSeconds || 0;



  // Advance to next set or exercise - handles supersets/blocks of any size
  function advanceSetOrExercise() {
    if (inGroup) {
      if (nextInRound !== null) {
        // Next exercise in this round, same set number
        setCurrentExerciseIndex(nextInRound);
      } else if (currentSetNumber < groupSets) {
        // Round finished: start the next round at the first exercise that still has sets left
        const nextSet = currentSetNumber + 1;
        let first = group.start;
        while (first < group.end && workout.exercises[first].sets < nextSet) first++;
        setCurrentExerciseIndex(first);
        setCurrentSetNumber(nextSet);
      } else if (group.end + 1 < workout.exercises.length) {
        setCurrentExerciseIndex(group.end + 1);
        setCurrentSetNumber(1);
      } else {
        setShowSummary(true);
      }
    } else {
      // Normal advancement (not a superset)
      setCurrentSetNumber((prevSetNumber) => {
        const exercise = workout.exercises[currentExerciseIndex];
        if (prevSetNumber < exercise.sets) {
          return prevSetNumber + 1;
        } else {
          // Need to advance exercise
          setCurrentExerciseIndex((prevExIndex) => {
            if (prevExIndex < workout.exercises.length - 1) {
              return prevExIndex + 1;
            } else {
              setShowSummary(true);
              return prevExIndex;
            }
          });
          return 1; // Reset to set 1 for new exercise
        }
      });
    }
  }

  // Handler to log a set
  function handleLogSet() {
    const reps = parseInt(loggedReps, 10);
    const weight = parseFloat(loggedWeight);
    if (isNaN(reps) || reps <= 0) {
      Alert.alert('Invalid Reps', 'Please enter a valid number of reps.');
      return;
    }
    if (isNaN(weight) || weight < 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }
    // Play button click sound
    soundStore.playButtonClick();
    // Add set to loggedSets
    setLoggedSets((prev) => [
      ...prev,
      {
        exerciseIndex: currentExerciseIndex,
        exerciseName: currentExercise.exerciseName,
        exerciseId: currentExercise.exerciseId,
        setNumber: currentSetNumber,
        reps,
        weight,
        unit: wUnit,
      },
    ]);
    setLoggedReps('');
    setLoggedWeight('');
    
    // Within a superset/block, go straight to the next exercise (no rest)
    if (nextInRound !== null) {
      advanceSetOrExercise();
      return;
    }

    if (restAfterSet > 0 && hasMoreWork) {
      setRestTimeRemaining(restAfterSet);
      setRestActive(true);
    } else {
      advanceSetOrExercise();
    }
  }

  // Rest timer effect
  useEffect(() => {
    if (!restActive || restTimeRemaining === null) return;
    if (restTimeRemaining <= 0) {
      setRestActive(false);
      setRestTimeRemaining(null);
      // Play timer complete sound when rest ends
      soundStore.playTimerComplete();
      advanceSetOrExercise();
      return;
    }
    // Play countdown tick for last 3 seconds
    if (restTimeRemaining <= 3) {
      soundStore.playCountdownTick();
    }
    const interval = setInterval(() => {
      setRestTimeRemaining((t) => (t !== null ? t - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [restActive, restTimeRemaining]);

  // Handler to skip rest
  function handleSkipRest() {
    soundStore.playButtonClick();
    setRestActive(false);
    setRestTimeRemaining(null);
    advanceSetOrExercise();
  }

  // Handler to finish the workout and call onComplete
  function handleFinishWorkout() {
    // Play workout complete sound
    soundStore.playWorkoutComplete();
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    // Total volume is stored in lbs so history and XP stay comparable across unit changes
    const totalVolume = loggedSets.reduce((sum, set) => sum + set.reps * loadIn(set.weight, set.unit as WeightUnit, 'imperial'), 0);
    const session: WorkoutSession = {
      workoutId: workout.id,
      workoutTitle: workout.title,
      startTime,
      endTime,
      totalDuration,
      loggedSets,
      totalVolume,
    };
    // Call onComplete with the session data
    onComplete(session);
  }
  // Handler to skip the current set and move to the next
  function handleSkipSet() {
    soundStore.playButtonClick();
    // Rest after the set unless the next exercise in a superset/block comes right away
    if (nextInRound === null && restAfterSet > 0 && hasMoreWork) {
      setRestTimeRemaining(restAfterSet);
      setRestActive(true);
      setLoggedReps('');
      setLoggedWeight('');
      return;
    }
    // Use advanceSetOrExercise for consistent behavior
    advanceSetOrExercise();
    setLoggedReps('');
    setLoggedWeight('');
  }

  // Timer effect: update elapsedTime every second while workout is active
  useEffect(() => {
    if (showSummary) return; // Stop timer when summary is shown
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [showSummary, startTime]);

  // Reset timer and prefill state when workout changes (new workout or restart)
  useEffect(() => {
    setStartTime(Date.now());
    setElapsedTime(0);
    prefillAppliedRef.current = {};
  }, [workout.id]);
  // Fetch last session sets for this workout on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      await workoutSessionStore.hydrate();
      const sessions = workoutSessionStore.getSessionsByWorkout(workout.id);
      if (sessions && sessions.length > 0) {
        // Use the most recent session (first in array)
        const last = sessions[0];
        if (mounted) setLastSessionSets(last.loggedSets);
      }
    })();
    return () => { mounted = false; };
  }, [workout.id]);

  // Pre-fill logic: when exercise/set changes, if not already applied, pre-fill from last session
  useEffect(() => {
    if (!lastSessionSets) return;
    const key = `${currentExerciseIndex}-${currentSetNumber}`;
    // Always reset prefill for this set if user navigates to a new set
    if (!prefillAppliedRef.current[key]) {
      // Find last set for this exercise/set
      const last = lastSessionSets.find(
        (s) => s.exerciseIndex === currentExerciseIndex && s.setNumber === currentSetNumber
      );
      if (last) {
        setLoggedReps(last.reps.toString());
        setLoggedWeight(convertLoad(last.weight, (last.unit as WeightUnit) || 'lbs', wUnit).toString());
      } else {
        setLoggedReps('');
        setLoggedWeight('');
      }
      prefillAppliedRef.current[key] = true;
    }
  }, [currentExerciseIndex, currentSetNumber, lastSessionSets]);

  // Find full exercise info from catalog
  const exerciseInfo: Exercise | undefined = [...exerciseCatalog, ...exerciseStore.getCustomExercises()].find(
    (ex) => ex.name.toLowerCase() === currentExercise.exerciseName.toLowerCase() || ex.id === currentExercise.exerciseId
  );

  // Show/hide exercise info box
  const [showInfoBox, setShowInfoBox] = useState(true);

  // Play background music when workout starts
  useEffect(() => {
    soundStore.playBackgroundMusic();
    return () => {
      soundStore.stopBackgroundMusic();
    };
  }, []);

  // Overview modal state
  const [showOverview, setShowOverview] = useState(false);
  
  // End workout confirmation modal state (for web compatibility)
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  
  // Cancel workout confirmation modal state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Calculate current stats for overview
  const getCurrentStats = () => {
    const volumeLbs = loggedSets.reduce((sum, set) => sum + set.reps * loadIn(set.weight, set.unit as WeightUnit, 'imperial'), 0);
    const totalVolume = loadIn(volumeLbs, 'lbs', units);
    const totalSets = loggedSets.length;
    const totalReps = loggedSets.reduce((sum, set) => sum + set.reps, 0);
    const timeSeconds = Math.round(elapsedTime / 1000);
    // XP preview: 1 per set + 1 per 100 lbs volume + 1 per 2 min
    const xpPreview = totalSets + Math.floor(volumeLbs / 100) + Math.floor(timeSeconds / 120);
    return { totalVolume, totalSets, totalReps, timeSeconds, xpPreview };
  };
  
  // End Workout Confirmation Modal (web-compatible replacement for Alert)
  const renderEndConfirmModal = () => (
    <Modal visible={showEndConfirm} animationType="fade" transparent onRequestClose={() => setShowEndConfirm(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', maxWidth: 320 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>End Workout Early?</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
            You've completed {loggedSets.length} sets. Save your progress?
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: '#E0E0E0', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => setShowEndConfirm(false)}
            >
              <Text style={{ fontWeight: '600', color: '#333' }}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: '#00B8A9', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => {
                setShowEndConfirm(false);
                setShowSummary(true);
              }}
            >
              <Text style={{ fontWeight: '600', color: '#fff' }}>End & Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Cancel Workout Confirmation Modal (exits without saving)
  const renderCancelConfirmModal = () => (
    <Modal visible={showCancelConfirm} animationType="fade" transparent onRequestClose={() => setShowCancelConfirm(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', maxWidth: 320 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>Cancel Workout?</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
            Your progress will NOT be saved. This workout won't appear in your history.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: '#E0E0E0', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => setShowCancelConfirm(false)}
            >
              <Text style={{ fontWeight: '600', color: '#333' }}>Keep Going</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: '#FF6B6B', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => {
                console.log('[WorkoutExecutor] Cancel confirmed, calling onCancel');
                setShowCancelConfirm(false);
                onCancel();
              }}
            >
              <Text style={{ fontWeight: '600', color: '#fff' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Overview Modal: shows all exercises, sets, reps, and progress
  const renderOverviewModal = () => {
    const stats = getCurrentStats();
    const completedExercises = workout.exercises.filter((_, idx) => 
      loggedSets.filter(s => s.exerciseIndex === idx).length === workout.exercises[idx].sets
    ).length;
    
    return (
      <Modal visible={showOverview} animationType="slide" transparent onRequestClose={() => setShowOverview(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '92%', maxHeight: '85%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>📊 Workout Overview</Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' }}>{workout.title}</Text>
            
            {/* Current Stats Banner */}
            <View style={{ backgroundColor: '#F0FFF0', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#C8E6C9' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00B8A9' }}>{formatTime(elapsedTime)}</Text>
                  <Text style={{ fontSize: 11, color: '#666' }}>Time</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00B8A9' }}>{stats.totalSets}</Text>
                  <Text style={{ fontSize: 11, color: '#666' }}>Sets</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00B8A9' }}>{stats.totalVolume.toFixed(0)}</Text>
                  <Text style={{ fontSize: 11, color: '#666' }}>Volume ({wUnit})</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFD700' }}>+{stats.xpPreview}</Text>
                  <Text style={{ fontSize: 11, color: '#666' }}>XP</Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#E8E8E8', borderRadius: 4, height: 6, marginTop: 4 }}>
                <View style={{ backgroundColor: '#00B8A9', borderRadius: 4, height: 6, width: `${(completedExercises / workout.exercises.length) * 100}%` }} />
              </View>
              <Text style={{ fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4 }}>
                {completedExercises}/{workout.exercises.length} exercises complete
              </Text>
            </View>
            
            {/* Exercise List */}
            <ScrollView style={{ maxHeight: 300 }}>
              {workout.exercises.map((ex: any, idx: number) => {
                const setsLogged = loggedSets.filter(s => s.exerciseIndex === idx);
                const isComplete = setsLogged.length === ex.sets;
                const isCurrent = idx === currentExerciseIndex;
                const g = getSupersetGroup(workout.exercises, idx);
                const inG = g.end > g.start;
                const hasSupersetWith = inG && idx < g.end; // more exercises below in this block
                const isSupersetPartner = inG && idx > g.start; // exercises above in this block
                return (
                  <View key={idx} style={{ 
                    marginBottom: hasSupersetWith ? 0 : 12, 
                    padding: 12, 
                    backgroundColor: isCurrent ? '#E3F2FD' : (isComplete ? '#E8F5E9' : '#F5F5F5'),
                    borderRadius: hasSupersetWith ? 0 : 10,
                    borderTopLeftRadius: isSupersetPartner ? 0 : 10,
                    borderTopRightRadius: isSupersetPartner ? 0 : 10,
                    borderBottomLeftRadius: hasSupersetWith ? 0 : 10,
                    borderBottomRightRadius: hasSupersetWith ? 0 : 10,
                    borderLeftWidth: 4,
                    borderLeftColor: hasSupersetWith || isSupersetPartner ? '#FF6B35' : (isCurrent ? '#2196F3' : (isComplete ? '#4CAF50' : '#E0E0E0'))
                  }}>
                    {inG && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: 11, color: '#FF6B35', fontWeight: '700' }}>
                          🔥 SUPERSET ({idx - g.start + 1}/{g.end - g.start + 1})
                        </Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 15, flex: 1 }}>
                        {isCurrent && '▶ '}{ex.exerciseName}
                      </Text>
                      <Text style={{ fontSize: 12, color: isComplete ? '#4CAF50' : '#999' }}>
                        {setsLogged.length}/{ex.sets} {isComplete ? '✓' : ''}
                      </Text>
                    </View>
                    <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                      Target: {ex.sets} × {ex.reps} • Rest: {ex.restSeconds}s
                    </Text>
                    <View style={{ marginTop: 6 }}>
                      {[...Array(ex.sets)].map((_, setIdx) => {
                        const setLog = setsLogged.find(s => s.setNumber === setIdx + 1);
                        return (
                          <Text key={setIdx} style={{ 
                            fontSize: 12, 
                            color: setLog ? '#00B8A9' : '#bbb',
                            marginTop: 2 
                          }}>
                            Set {setIdx + 1}: {setLog ? `${setLog.reps} reps × ${setLog.weight} ${setLog.unit}` : '—'}
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity
              style={{ marginTop: 16, alignSelf: 'center', backgroundColor: '#00B8A9', borderRadius: 10, paddingHorizontal: 32, paddingVertical: 12 }}
              onPress={() => setShowOverview(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Continue Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (showSummary) {
    // Render the summary screen in a Modal
    // Calculate final duration (in case timer is slightly off)
    const endTime = Date.now();
    const finalDuration = endTime - startTime;
    return (
      <Modal visible={true} animationType="slide">
        <WorkoutSummary
          workout={workout}
          loggedSets={loggedSets}
          totalDuration={finalDuration}
          onFinish={handleFinishWorkout}
        />
      </Modal>
    );
  }

  return (
    <>
      {renderOverviewModal()}
      {renderEndConfirmModal()}
      <Modal visible={true} animationType="slide">
        {renderCancelConfirmModal()}
        <ModalSafeArea style={{ flex: 1, backgroundColor: '#FFF' }}>
        <View style={[styles.container, { paddingTop: 0 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              console.log('[WorkoutExecutor] X button pressed, showing cancel confirm');
              setShowCancelConfirm(true);
            }} 
            style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 24, color: '#FF6B6B' }}>✕</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
            <Text style={styles.workoutTitle} numberOfLines={1}>{workout.title}</Text>
            <Text style={styles.timeElapsed}>⏱️ {formatTime(elapsedTime)}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Rest Timer Overlay */}
        {restActive && (
          <View style={styles.restTimerCard}>
            <Text style={styles.restTitle}>Rest</Text>
            <Text style={styles.restTimer}>{restTimeRemaining}s</Text>
            <Text style={styles.restDesc}>Take a break before your next set.</Text>
            <TouchableOpacity style={styles.skipRestButton} onPress={handleSkipRest}>
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        )}
        <ScrollView contentContainerStyle={styles.content}>
          {/* Exercise Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>
              Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
            </Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>

          {/* Current exercise */}
          <View style={styles.exerciseCard}>
            {/* Superset Banner */}
            {inGroup && (
              <View style={{ 
                backgroundColor: '#FF6B35', 
                paddingVertical: 6, 
                paddingHorizontal: 12, 
                borderRadius: 8, 
                marginBottom: 12,
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                  🔥 SUPERSET ({groupPosition}/{groupSize})
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                  {nextInRound !== null
                    ? `→ Next: ${workout.exercises[nextInRound].exerciseName}`
                    : hasMoreWork
                      ? '← Then rest'
                      : 'Last set'}
                </Text>
              </View>
            )}
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{currentExercise.exerciseName}</Text>
              <View style={styles.setIndicator}>
                <Text style={styles.setNumber}>
                  Set {currentSetNumber}/{currentExercise.sets}
                </Text>
              </View>
            </View>
            {/* Exercise Details (no muscle diagram) */}
            <View style={styles.exerciseDetailsSection}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Target Reps:</Text>
                    <Text style={styles.detailValue}>{currentExercise.reps}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Rest Between Sets:</Text>
                    <Text style={styles.detailValue}>{currentExercise.restSeconds}s</Text>
                  </View>
                </View>
              </View>
            </View>
            {/* Log Form */}
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps Completed</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter reps"
                  keyboardType="number-pad"
                  value={loggedReps}
                  onChangeText={setLoggedReps}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight Used ({wUnit})</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter weight"
                  keyboardType="decimal-pad"
                  value={loggedWeight}
                  onChangeText={setLoggedWeight}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
            </View>
            {/* Sets Logged for This Exercise */}
            {loggedSets.filter((s) => s.exerciseIndex === currentExerciseIndex).length > 0 && (
              <View style={styles.completedSetsSection}>
                <Text style={styles.completedSetsTitle}>Sets Logged</Text>
                {loggedSets
                  .filter((s) => s.exerciseIndex === currentExerciseIndex)
                  .map((set, idx) => (
                    <View key={idx} style={styles.completedSetItem}>
                      <Text style={styles.completedSetText}>
                        Set {set.setNumber}: {set.reps} reps × {set.weight} {set.unit}
                      </Text>
                      <Text style={styles.setVolume}>
                        Vol: {(set.reps * set.weight).toFixed(0)}
                      </Text>
                    </View>
                  ))}
              </View>
            )}
            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={handleSkipSet}
              >
                <Text style={styles.skipButtonText}>⏭️ Skip Set</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.logButton]}
                onPress={handleLogSet}
              >
                <Text style={styles.logButtonText}>✓ Log Set</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About this exercise (full width, collapsible) */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>About this exercise</Text>
              <TouchableOpacity onPress={() => setShowInfoBox((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.infoToggle}>{showInfoBox ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {showInfoBox && (
              <View style={styles.infoBody}>
                {(exerciseInfo?.difficulty || exerciseInfo?.category) && (
                  <View style={styles.badgeRow}>
                    {exerciseInfo?.category && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{exerciseInfo.category}</Text>
                      </View>
                    )}
                    {exerciseInfo?.difficulty && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{exerciseInfo.difficulty}</Text>
                      </View>
                    )}
                  </View>
                )}
                <Text style={styles.infoDescription}>
                  {exerciseInfo?.description || 'No description available.'}
                </Text>
                {exerciseInfo?.muscleGroups && exerciseInfo.muscleGroups.length > 0 && (
                  <View style={styles.musclesRow}>
                    <View style={styles.musclesDiagram}>
                      <RealisticMuscleDiagram highlighted={exerciseInfo.muscleGroups} side="front" width={90} height={130} />
                    </View>
                    <View style={styles.musclesText}>
                      <Text style={styles.infoSubheading}>Muscles worked</Text>
                      <Text style={styles.infoMeta}>{exerciseInfo.muscleGroups.join(', ')}</Text>
                      {exerciseInfo?.equipment && exerciseInfo.equipment.length > 0 && (
                        <>
                          <Text style={[styles.infoSubheading, { marginTop: 10 }]}>Equipment</Text>
                          <Text style={styles.infoMeta}>{exerciseInfo.equipment.join(', ')}</Text>
                        </>
                      )}
                    </View>
                  </View>
                )}
                {exerciseInfo?.instructions && exerciseInfo.instructions.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text style={styles.infoSubheading}>How to perform</Text>
                    {exerciseInfo.instructions.map((step, idx) => (
                      <View key={idx} style={styles.stepRow}>
                        <Text style={styles.stepNumber}>{idx + 1}.</Text>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* End Workout Button */}
          <Pressable
            style={({ pressed }) => ({
              marginTop: 24,
              backgroundColor: '#FF6B6B',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
              cursor: 'pointer' as any,
            })}
            onPress={() => {
              console.log('[WorkoutExecutor] End Workout button pressed');
              setShowSummary(true);
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>🏁 End Workout</Text>
          </Pressable>
        </ScrollView>
      </View>
      </ModalSafeArea>
    </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  timeElapsed: {
    fontSize: 13,
    color: '#00B8A9',
    fontWeight: '600',
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B8A9',
  },
  restTimerCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  restTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E67E22',
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#E67E22',
    marginBottom: 8,
  },
  restDesc: {
    fontSize: 12,
    color: '#D97706',
    marginBottom: 12,
  },
  skipRestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E67E22',
    borderRadius: 6,
  },
  skipRestText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  exerciseCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  setIndicator: {
    backgroundColor: '#00B8A9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  setNumber: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  exerciseDetailsSection: {
    backgroundColor: '#E8F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#00B8A9',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  infoToggle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00B8A9',
  },
  infoBody: {
    marginTop: 12,
    gap: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#00796B',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  infoDescription: {
    color: '#555',
    fontSize: 14,
    lineHeight: 21,
  },
  musclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  musclesDiagram: {
    backgroundColor: '#F0FFFE',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E8F5F5',
  },
  musclesText: {
    flex: 1,
  },
  infoSubheading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  infoMeta: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    textTransform: 'capitalize',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00B8A9',
    width: 18,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    lineHeight: 19,
  },
  formSection: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  completedSetsSection: {
    backgroundColor: '#F0F9F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  completedSetsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B8A9',
    marginBottom: 8,
  },
  completedSetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2F1',
  },
  completedSetText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  setVolume: {
    fontSize: 12,
    color: '#00B8A9',
    fontWeight: '700',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  skipButtonText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 13,
  },
  logButton: {
    backgroundColor: '#00B8A9',
  },
  logButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  cancelButtonText: {
    color: '#D32F2F',
    fontWeight: '700',
    fontSize: 13,
  },
  endEarlyButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  endEarlyText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
