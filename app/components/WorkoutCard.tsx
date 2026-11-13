import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { loadIn, useUnits, weightUnitFor, type WeightUnit } from '../lib/units';
import { Workout } from '../lib/workouts';

type WorkoutCardProps = {
  workout: Workout;
  onStart?: (workout: Workout) => void;
  onEdit?: (workout: Workout) => void;
  onDelete?: (workoutId: string) => void;
  isSaved?: boolean;
  onSave?: (workout: Workout) => void;
  onUnsave?: (workoutId: string) => void;
};

export default function WorkoutCard({ workout, onStart, onEdit, onDelete, isSaved = false, onSave, onUnsave }: WorkoutCardProps) {
  const units = useUnits();
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FFC107';
      case 'advanced':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const calculateTotalVolume = () => {
    const total = workout.exercises.reduce((sum, ex) => {
      const weight = loadIn(ex.weight || 0, (ex.unit as WeightUnit) || 'lbs', units);
      return sum + weight * ex.sets * ex.reps;
    }, 0);
    return Math.round(total);
  };
  const totalVolume = calculateTotalVolume();

  const totalExercises = workout.exercises.length;
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{workout.title}</Text>
          <View style={styles.difficultyBadge}>
            <Text
              style={[
                styles.difficultyText,
                { color: getDifficultyColor(workout.difficulty) },
              ]}
            >
              {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
            </Text>
          </View>
        </View>
        {workout.isCustom && <Text style={styles.customBadge}>✏️ Custom</Text>}
      </View>

      {workout.description && (
        <Text style={styles.description}>{workout.description}</Text>
      )}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalExercises}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalSets}</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>
        {workout.duration && (
          <View style={styles.stat}>
            <Text style={styles.statValue}>{workout.duration}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        )}
        {totalVolume > 0 && (
          <View style={styles.stat}>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{totalVolume.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Volume ({weightUnitFor(units)})</Text>
          </View>
        )}
      </View>

      <View style={styles.exercisesList}>
        <Text style={styles.exercisesTitle}>Exercises:</Text>
        {workout.exercises.map((ex, idx) => {
          const hasSupersetWith = ex.supersetWith !== undefined;
          const isSupersetPartner = workout.exercises.some((e) => e.supersetWith === idx);
          const supersetLabel = hasSupersetWith ? ' 🔥 SUPERSET ↓' : (isSupersetPartner ? ' 🔥 ↑' : '');
          return (
            <Text key={idx} style={[
              styles.exerciseItem,
              (hasSupersetWith || isSupersetPartner) && { color: '#FF6B35', fontWeight: '600' }
            ]}>
              • {ex.exerciseName} - {ex.sets}×{ex.reps}{supersetLabel}
            </Text>
          );
        })}
      </View>

      <View style={styles.buttonRow}>
        {onStart && (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={() => onStart(workout)}
          >
            <Text style={styles.startButtonText}>▶️ Start</Text>
          </TouchableOpacity>
        )}
        {onEdit && (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => onEdit(workout)}
          >
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
        )}
        {isSaved && onUnsave && (
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={() => onUnsave(workout.id)}
          >
            <Text style={styles.saveButtonText}>⭐ Saved</Text>
          </TouchableOpacity>
        )}
        {!isSaved && onSave && (
          <TouchableOpacity
            style={[styles.button, styles.unsavedButton]}
            onPress={() => onSave(workout)}
          >
            <Text style={styles.unsavedButtonText}>☆ Save</Text>
          </TouchableOpacity>
        )}
        {onDelete && workout.isCustom && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => onDelete(workout.id)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  difficultyBadge: {
    marginTop: 2,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  customBadge: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B8A9',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  exercisesList: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  exercisesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  exerciseItem: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#00B8A9',
    flex: 1,
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  editButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  editButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  deleteButtonText: {
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#E8F5F5',
    borderWidth: 1,
    borderColor: '#00B8A9',
  },
  saveButtonText: {
    color: '#00B8A9',
    fontWeight: '600',
    fontSize: 13,
  },
  unsavedButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  unsavedButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 13,
  },
});
