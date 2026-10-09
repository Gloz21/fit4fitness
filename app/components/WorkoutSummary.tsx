import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { convertLoad, loadIn, useUnits, weightUnitFor, type WeightUnit } from '../lib/units';
import { Workout } from '../lib/workouts';

type LoggedSet = {
  exerciseIndex: number;
  exerciseName?: string;
  setNumber: number;
  reps: number;
  weight: number;
  unit: string;
};

type WorkoutSummaryProps = {
  workout?: Workout | null;
  workoutTitle?: string;
  loggedSets: LoggedSet[];
  totalDuration: number;
  onFinish: () => void;
  isHistoryView?: boolean;
  workoutDate?: Date;
};

export default function WorkoutSummary({
  workout,
  workoutTitle,
  loggedSets,
  totalDuration,
  onFinish,
  isHistoryView = false,
  workoutDate,
}: WorkoutSummaryProps) {
  const displayTitle = workoutTitle || workout?.title || 'Workout';
  const units = useUnits();
  const weightUnit = weightUnitFor(units);
  const setVolume = (set: LoggedSet) => set.reps * loadIn(set.weight, set.unit as WeightUnit, units);
  const totalVolume = loggedSets.reduce((sum, set) => sum + setVolume(set), 0);
  const totalVolumeLbs = loggedSets.reduce((sum, set) => sum + set.reps * loadIn(set.weight, set.unit as WeightUnit, 'imperial'), 0);
  const totalSetsLogged = loggedSets.length;
  const averageReps =
    totalSetsLogged > 0
      ? (loggedSets.reduce((sum, set) => sum + set.reps, 0) / totalSetsLogged).toFixed(1)
      : 0;
  

  // Calculate XP earned: 1 per set + 1 per 100 lbs volume + 1 per 2 min
  const totalTimeSeconds = Math.round(totalDuration / 1000);
  const xpFromSets = totalSetsLogged;
  const xpFromVolume = Math.floor(totalVolumeLbs / 100);
  const xpFromTime = Math.floor(totalTimeSeconds / 120);
  const totalXP = xpFromSets + xpFromVolume + xpFromTime;

  // Group sets by exercise - works with both workout object and standalone sets with exerciseName
  const getExerciseSummaries = () => {
    if (workout?.exercises) {
      // Original behavior when we have full workout object
      return workout.exercises.map((exercise, idx) => {
        const sets = loggedSets.filter((s) => s.exerciseIndex === idx);
        const exerciseVolume = sets.reduce((sum, set) => sum + setVolume(set), 0);
        return {
          exerciseName: exercise.exerciseName,
          sets,
          volume: exerciseVolume,
          totalReps: sets.reduce((sum, set) => sum + set.reps, 0),
        };
      });
    } else {
      // Group by exerciseName when viewing history without full workout object
      const exerciseMap = new Map<string, LoggedSet[]>();
      loggedSets.forEach(set => {
        const name = set.exerciseName || `Exercise ${set.exerciseIndex + 1}`;
        if (!exerciseMap.has(name)) {
          exerciseMap.set(name, []);
        }
        exerciseMap.get(name)!.push(set);
      });
      
      return Array.from(exerciseMap.entries()).map(([name, sets]) => ({
        exerciseName: name,
        sets,
        volume: sets.reduce((sum, set) => sum + setVolume(set), 0),
        totalReps: sets.reduce((sum, set) => sum + set.reps, 0),
      }));
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const exerciseSummaries = getExerciseSummaries();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
    <View style={[styles.container, { paddingTop: 0 }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.completionEmoji}>{isHistoryView ? '📊' : '🎉'}</Text>
          <Text style={styles.completionTitle}>
            {isHistoryView ? 'Workout Summary' : 'Workout Complete!'}
          </Text>
          <Text style={styles.workoutName}>{displayTitle}</Text>
          {isHistoryView && workoutDate && (
            <Text style={styles.workoutDate}>{formatDate(workoutDate)}</Text>
          )}
        </View>

        {/* XP Earned Banner */}
        <View style={styles.xpBanner}>
          <Text style={styles.xpEmoji}>⭐</Text>
          <Text style={styles.xpText}>{isHistoryView ? '' : '+'}{totalXP} XP {isHistoryView ? 'Earned' : 'Earned!'}</Text>
          <View style={styles.xpBreakdown}>
            <Text style={styles.xpBreakdownText}>
              {xpFromSets} (sets) + {xpFromVolume} (volume) + {xpFromTime} (time)
            </Text>
          </View>
        </View>

        {/* Key Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatTime(totalDuration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSetsLogged}</Text>
            <Text style={styles.statLabel}>Sets Logged</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalVolume.toFixed(0)} {weightUnit}</Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{averageReps}</Text>
            <Text style={styles.statLabel}>Avg Reps/Set</Text>
          </View>
        </View>

        {/* Exercise Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Exercise Breakdown</Text>

          {exerciseSummaries.map((summary, idx) => (
            <View key={idx} style={styles.exerciseSummaryCard}>
              <View style={styles.exerciseSummaryHeader}>
                <Text style={styles.exerciseSummaryName}>{summary.exerciseName}</Text>
                <Text style={styles.exerciseSummaryVolume}>{summary.volume.toFixed(0)} {weightUnit}</Text>
              </View>

              {summary.sets.length > 0 ? (
                <View style={styles.setsListContainer}>
                  {summary.sets.map((set, setIdx) => (
                    <View key={setIdx} style={styles.setRow}>
                      <Text style={styles.setText}>
                        Set {set.setNumber}: {set.reps} reps × {convertLoad(set.weight, set.unit as WeightUnit, weightUnit)} {weightUnit}
                      </Text>
                      <Text style={styles.setRowVolume}>
                        {setVolume(set).toFixed(0)} {weightUnit}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.exerciseTotalRow}>
                    <Text style={styles.exerciseTotalText}>
                      Total: {summary.totalReps} reps | {summary.volume.toFixed(0)} {weightUnit}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noLogsSection}>
                  <Text style={styles.noLogsText}>No sets logged</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Personal Records */}
        {!isHistoryView && (
          <View style={styles.achievementSection}>
            <Text style={styles.achievementTitle}>Achievements 🏆</Text>
            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>💪</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementName}>Workout Warrior</Text>
                <Text style={styles.achievementDesc}>Completed {displayTitle}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Finish Button */}
        <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
          <Text style={styles.finishButtonText}>{isHistoryView ? '✕ Close' : '✓ Save & Finish'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E8F5F5',
  },
  completionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 6,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  workoutDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  breakdownSection: {
    marginBottom: 32,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  exerciseSummaryCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  exerciseSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  exerciseSummaryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  exerciseSummaryVolume: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00B8A9',
  },
  setsListContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  setText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
    flex: 1,
  },
  setRowVolume: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B8A9',
    marginLeft: 8,
  },
  exerciseTotalRow: {
    backgroundColor: '#E8F5F5',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  exerciseTotalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B8A9',
  },
  noLogsSection: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  noLogsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  achievementSection: {
    marginBottom: 24,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  achievementCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE5B4',
  },
  achievementEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
  },
  finishButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  finishButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  xpBanner: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  xpEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  xpText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  xpBreakdown: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  xpBreakdownText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
});
