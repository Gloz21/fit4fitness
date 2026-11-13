import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ModalSafeArea } from '@/components/modal-safe-area';
import { Exercise, exerciseCatalog } from '../lib/exercises';
import { exerciseStore } from '../lib/exerciseStore';
import { saveImportedExercises } from '../lib/importedExercises';
import { useUnits, weightUnitFor } from '../lib/units';
import { Workout, WorkoutCategory, WorkoutExercise } from '../lib/workouts';
import { workoutStore } from '../lib/workoutStore';
import CustomExerciseModal from './CustomExerciseModal';
import ExerciseBrowser from './ExerciseBrowser';
import ExerciseInfoModal from './ExerciseInfoModal';

type WorkoutBuilderProps = {
  visible: boolean;
  initialWorkout?: Workout;
  heading?: string;
  notice?: string;
  onSave: (workout: Workout) => void;
  onClose: () => void;
};

export default function WorkoutBuilder({
  visible,
  initialWorkout,
  heading,
  notice,
  onSave,
  onClose,
}: WorkoutBuilderProps) {
  const wUnit = weightUnitFor(useUnits());
  const [workoutTitle, setWorkoutTitle] = useState(initialWorkout?.title || '');
  const [workoutDescription, setWorkoutDescription] = useState(initialWorkout?.description || '');
  const [workoutDifficulty, setWorkoutDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    initialWorkout?.difficulty || 'beginner'
  );
  const [workoutCategory, setWorkoutCategory] = useState<WorkoutCategory>(
    initialWorkout?.category || 'strength'
  );
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialWorkout?.exercises || []);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [currentExerciseValues, setCurrentExerciseValues] = useState<Partial<WorkoutExercise>>({});
  const [showCustomExerciseModal, setShowCustomExerciseModal] = useState(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>(exerciseStore.getCustomExercises());
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [selectedExerciseInfo, setSelectedExerciseInfo] = useState<Exercise | null>(null);

  // Update form when initialWorkout changes (for editing)
  useEffect(() => {
    if (visible) {
      // Custom exercises load after the app starts, so refresh the list each time the builder opens
      setCustomExercises(exerciseStore.getCustomExercises());
      if (initialWorkout) {
        setWorkoutTitle(initialWorkout.title || '');
        setWorkoutDescription(initialWorkout.description || '');
        setWorkoutDifficulty(initialWorkout.difficulty || 'beginner');
        setWorkoutCategory(initialWorkout.category || 'strength');
        setExercises(initialWorkout.exercises ? [...initialWorkout.exercises] : []);
      } else {
        // Reset form for new workout
        setWorkoutTitle('');
        setWorkoutDescription('');
        setWorkoutDifficulty('beginner');
        setWorkoutCategory('strength');
        setExercises([]);
      }
      setEditingExerciseIndex(null);
      setCurrentExerciseValues({});
    }
  }, [visible, initialWorkout?.id]);

  // Expanded workout categories for both exercise selection and workout category assignment
  // Expanded categories for both workout and exercise selection
  const categories = [
    // Workout categories
    'strength',
    'hypertrophy',
    'power',
    'endurance',
    'agility',
    'cardio',
    'rotation',
    'flexibility',
    'athletic',
    // Exercise categories (add cardio, athletic, stretching, agility)
    'chest',
    'back',
    'legs',
    'shoulders',
    'arms',
    'core',
    'cardio',
    'athletic',
    'agility',
    'flexibility', // stretching/flexibility
  ];
  const allExercises = [...exerciseCatalog, ...customExercises];

  const handleAddExercise = (exerciseId: string) => {
    const exercise = allExercises.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    const newExercise: WorkoutExercise = {
      exerciseId,
      exerciseName: exercise.name,
      sets: 3,
      reps: 10,
      unit: wUnit,
      restSeconds: 60,
    };

    if (editingExerciseIndex !== null) {
      const updated = [...exercises];
      updated[editingExerciseIndex] = { ...updated[editingExerciseIndex], ...newExercise };
      setExercises(updated);
      setEditingExerciseIndex(null);
    } else {
      setExercises([...exercises, newExercise]);
    }

    setShowExerciseSelector(false);
    setCurrentExerciseValues({});
  };

  const handleUpdateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSaveWorkout = async () => {
    if (!workoutTitle.trim() || exercises.length === 0) {
      alert('Please enter a title and add at least one exercise');
      return;
    }

    const draft: Workout = {
      id: initialWorkout?.id || `custom-${Date.now()}`,
      title: workoutTitle,
      description: workoutDescription,
      exercises: exercises.map(ex => ({ ...ex })), // Deep copy exercises
      difficulty: workoutDifficulty,
      category: workoutCategory,
      duration: Math.ceil(exercises.reduce((sum, ex) => sum + ex.sets * 1.5 + ex.restSeconds / 60, 0)),
      createdAt: initialWorkout?.createdAt || Date.now(),
      isCustom: true,
    };
    // Imported exercises that aren't in the catalog become the user's custom exercises
    const workout = await saveImportedExercises(draft);

    // Save to My Workouts (customWorkouts) and also to the selected category
    onSave(workout);
    workoutStore.saveWorkoutToCategory(workout, workoutCategory);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setWorkoutTitle('');
    setWorkoutDescription('');
    setWorkoutDifficulty('beginner');
    setWorkoutCategory('strength');
    setExercises([]);
    setEditingExerciseIndex(null);
    setCurrentExerciseValues({});
  };

  const handleSaveCustomExercise = (exercise: Exercise) => {
    exerciseStore.saveExercise(exercise);
    setCustomExercises([...customExercises, exercise]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ModalSafeArea style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{heading ?? (initialWorkout ? 'Edit Workout' : 'Create Workout')}</Text>
          <View style={{ width: 30 }} />
        </View>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        {/* Workout Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Details</Text>

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., My Chest Day"
            value={workoutTitle}
            onChangeText={setWorkoutTitle}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Optional description"
            value={workoutDescription}
            onChangeText={setWorkoutDescription}
            placeholderTextColor="#999"
            multiline
          />

          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.difficultyRow}>
            {['beginner', 'intermediate', 'advanced'].map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton,
                  workoutDifficulty === diff && styles.difficultyButtonActive,
                ]}
                onPress={() => setWorkoutDifficulty(diff as any)}
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    workoutDifficulty === diff && styles.difficultyButtonTextActive,
                  ]}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {['strength', 'hypertrophy', 'power', 'endurance', 'agility', 'cardio', 'rotation', 'flexibility', 'athletic'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  workoutCategory === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setWorkoutCategory(cat as WorkoutCategory)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    workoutCategory === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exercises */}
        <View style={styles.section}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.sectionTitle}>Exercises ({exercises.length})</Text>
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => {
                setEditingExerciseIndex(null);
                setShowExerciseSelector(true);
              }}
            >
              <Text style={styles.addExerciseButtonText}>+ Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseCardHeader}>
                <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.exerciseValues}>
                <View style={styles.valueGroup}>
                  <Text style={styles.valueLabel}>Sets</Text>
                  <View style={styles.numberInput}>
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateExercise(
                          index,
                          'sets',
                          Math.max(1, exercise.sets - 1)
                        )
                      }
                    >
                      <Text style={styles.numberButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.numberValue}>{exercise.sets}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateExercise(
                          index,
                          'sets',
                          exercise.sets + 1
                        )
                      }
                    >
                      <Text style={styles.numberButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.valueGroup}>
                  <Text style={styles.valueLabel}>Reps</Text>
                  <View style={styles.numberInput}>
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateExercise(
                          index,
                          'reps',
                          Math.max(1, exercise.reps - 1)
                        )
                      }
                    >
                      <Text style={styles.numberButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.numberValue}>{exercise.reps}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateExercise(
                          index,
                          'reps',
                          exercise.reps + 1
                        )
                      }
                    >
                      <Text style={styles.numberButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.valueGroup}>
                  <Text style={styles.valueLabel}>Rest (sec)</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={exercise.restSeconds.toString()}
                    onChangeText={(text) =>
                      handleUpdateExercise(index, 'restSeconds', parseInt(text) || 60)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.exerciseValues}>
                <View style={styles.valueGroup}>
                  <Text style={styles.valueLabel}>Weight</Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="0"
                    value={exercise.weight?.toString() || ''}
                    onChangeText={(text) =>
                      handleUpdateExercise(index, 'weight', text ? parseFloat(text) : undefined)
                    }
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.valueGroup}>
                  <Text style={styles.valueLabel}>Unit</Text>
                  <View style={styles.unitToggle}>
                    {['lbs', 'kg'].map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.unitButton,
                          (exercise.unit ?? wUnit) === unit && styles.unitButtonActive,
                        ]}
                        onPress={() => handleUpdateExercise(index, 'unit', unit as any)}
                      >
                        <Text
                          style={[
                            styles.unitButtonText,
                            (exercise.unit ?? wUnit) === unit && styles.unitButtonTextActive,
                          ]}
                        >
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Notes (optional)"
                value={exercise.notes || ''}
                onChangeText={(text) => handleUpdateExercise(index, 'notes', text)}
                placeholderTextColor="#999"
              />
              
              {/* Superset and Dropset Controls */}
              <View style={styles.advancedControls}>
                {/* Superset Toggle */}
                <View style={styles.advancedControlGroup}>
                  <Text style={styles.advancedLabel}>🔗 Superset</Text>
                  {index < exercises.length - 1 ? (
                    <TouchableOpacity
                      style={[
                        styles.advancedToggle,
                        exercise.supersetWith === index + 1 && styles.advancedToggleActive,
                      ]}
                      onPress={() => {
                        if (exercise.supersetWith === index + 1) {
                          handleUpdateExercise(index, 'supersetWith', undefined);
                        } else {
                          handleUpdateExercise(index, 'supersetWith', index + 1);
                        }
                      }}
                    >
                      <Text style={[
                        styles.advancedToggleText,
                        exercise.supersetWith === index + 1 && styles.advancedToggleTextActive,
                      ]}>
                        {exercise.supersetWith === index + 1 ? `With: ${exercises[index + 1]?.exerciseName}` : 'Link Next'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.advancedDisabled}>Add exercise below</Text>
                  )}
                </View>
                
                {/* Dropset Controls */}
                <View style={styles.advancedControlGroup}>
                  <Text style={styles.advancedLabel}>⬇️ Dropsets</Text>
                  <View style={styles.dropsetControls}>
                    <TouchableOpacity
                      style={styles.dropsetButton}
                      onPress={() => {
                        const currentDropsets = exercise.dropsets || [];
                        if (currentDropsets.length > 0) {
                          handleUpdateExercise(index, 'dropsets', currentDropsets.slice(0, -1));
                        }
                      }}
                    >
                      <Text style={styles.dropsetButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.dropsetCount}>{exercise.dropsets?.length || 0}</Text>
                    <TouchableOpacity
                      style={styles.dropsetButton}
                      onPress={() => {
                        const currentDropsets = exercise.dropsets || [];
                        const lastWeight = currentDropsets.length > 0 
                          ? currentDropsets[currentDropsets.length - 1].weight 
                          : (exercise.weight || 100);
                        const newDropset = { 
                          weight: Math.round(lastWeight * 0.8), 
                          reps: exercise.reps + 2 
                        };
                        handleUpdateExercise(index, 'dropsets', [...currentDropsets, newDropset]);
                      }}
                    >
                      <Text style={styles.dropsetButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* Dropset Details */}
              {exercise.dropsets && exercise.dropsets.length > 0 && (
                <View style={styles.dropsetDetails}>
                  <Text style={styles.dropsetDetailsTitle}>Dropset Weights:</Text>
                  {exercise.dropsets.map((drop, dropIndex) => (
                    <View key={dropIndex} style={styles.dropsetRow}>
                      <Text style={styles.dropsetLabel}>Drop {dropIndex + 1}:</Text>
                      <TextInput
                        style={styles.dropsetInput}
                        value={drop.weight.toString()}
                        onChangeText={(text) => {
                          const newDropsets = [...(exercise.dropsets || [])];
                          newDropsets[dropIndex] = { ...newDropsets[dropIndex], weight: parseFloat(text) || 0 };
                          handleUpdateExercise(index, 'dropsets', newDropsets);
                        }}
                        keyboardType="decimal-pad"
                        placeholder="Weight"
                      />
                      <Text style={styles.dropsetX}>×</Text>
                      <TextInput
                        style={styles.dropsetInput}
                        value={drop.reps.toString()}
                        onChangeText={(text) => {
                          const newDropsets = [...(exercise.dropsets || [])];
                          newDropsets[dropIndex] = { ...newDropsets[dropIndex], reps: parseInt(text) || 0 };
                          handleUpdateExercise(index, 'dropsets', newDropsets);
                        }}
                        keyboardType="number-pad"
                        placeholder="Reps"
                      />
                      <Text style={styles.dropsetUnit}>{exercise.unit || wUnit}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Superset Indicator */}
              {exercise.supersetWith !== undefined && exercises[exercise.supersetWith] && (
                <View style={styles.supersetIndicator}>
                  <Text style={styles.supersetIndicatorText}>
                    🔗 Superset with: {exercises[exercise.supersetWith].exerciseName}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
          <Text style={styles.saveButtonText}>💾 Save Workout</Text>
        </TouchableOpacity>

        {/* Exercise Selector Modal */}
        <Modal
          visible={showExerciseSelector}
          animationType="slide"
          onRequestClose={() => setShowExerciseSelector(false)}
        >
          {(() => {
            return (
              <ModalSafeArea style={{ flex: 1, backgroundColor: '#FFF' }}>
                <View style={styles.selectorHeader}>
                  <TouchableOpacity onPress={() => setShowExerciseSelector(false)} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Select Exercise</Text>
                  <TouchableOpacity 
                    style={styles.createExerciseButton}
                    onPress={() => {
                      setShowExerciseSelector(false);
                      setShowCustomExerciseModal(true);
                    }}
                  >
                    <Text style={styles.createExerciseButtonText}>+ Create</Text>
                  </TouchableOpacity>
                </View>
                <ExerciseBrowser
                  customExercises={customExercises}
                  onPress={(exercise) => handleAddExercise(exercise.id)}
                  renderActions={(exercise) => (
                    <>
                      <TouchableOpacity
                        style={styles.infoButton}
                        onPress={() => {
                          setSelectedExerciseInfo(exercise);
                          setShowExerciseInfo(true);
                        }}
                      >
                        <Text style={styles.infoButtonText}>ℹ️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleAddExercise(exercise.id)}>
                        <Text style={styles.addIcon}>+</Text>
                      </TouchableOpacity>
                    </>
                  )}
                />
                {/* Exercise Info Modal - rendered INSIDE exercise selector so it stacks on iOS */}
                <ExerciseInfoModal
                  visible={showExerciseInfo}
                  exercise={selectedExerciseInfo}
                  onClose={() => {
                    setShowExerciseInfo(false);
                    setSelectedExerciseInfo(null);
                  }}
                />
              </ModalSafeArea>
            );
          })()}
        </Modal>

      </ScrollView>

        {/* Custom Exercise Modal */}
        <CustomExerciseModal
          visible={showCustomExerciseModal}
          onSave={handleSaveCustomExercise}
          onClose={() => setShowCustomExerciseModal(false)}
        />

      </ModalSafeArea>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  notice: {
    backgroundColor: '#F0FBFA',
    color: '#335F5A',
    fontSize: 13,
    lineHeight: 18,
    borderRadius: 10,
    padding: 12,
    marginTop: -8,
    marginBottom: 16,
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
  },
  difficultyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  difficultyButtonTextActive: {
    color: '#FFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  categoryButtonActive: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
  },
  categoryButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#FFF',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseButton: {
    backgroundColor: '#00B8A9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addExerciseButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  removeButton: {
    fontSize: 20,
    color: '#F44336',
    fontWeight: '400',
  },
  exerciseValues: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  valueGroup: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  numberInput: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  numberButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B8A9',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  numberValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 8,
    paddingVertical: 6,
    flex: 1,
    textAlign: 'center',
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
    color: '#333',
    backgroundColor: '#FFF',
  },
  unitToggle: {
    flexDirection: 'row',
    gap: 4,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
  },
  unitButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  unitButtonTextActive: {
    color: '#FFF',
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  createExerciseButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#00B8A9',
    borderRadius: 6,
  },
  createExerciseButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  categoriesContainer: {
    padding: 20,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  categoryTabActive: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryTabTextActive: {
    color: '#FFF',
  },
  exerciseList: {
    gap: 12,
  },
  exerciseOption: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseOptionContent: {
    flex: 1,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    fontSize: 16,
  },
  exerciseOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  exerciseOptionDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  muscleGroupsTags: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  muscleTag: {
    backgroundColor: '#E8F5F5',
    color: '#00B8A9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '600',
  },
  addIcon: {
    fontSize: 24,
    color: '#00B8A9',
    fontWeight: '600',
    marginLeft: 12,
  },
  // Superset and Dropset styles
  advancedControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  advancedControlGroup: {
    flex: 1,
  },
  advancedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  advancedToggle: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  advancedToggleActive: {
    backgroundColor: '#E8F5F5',
    borderColor: '#00B8A9',
  },
  advancedToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  advancedToggleTextActive: {
    color: '#00B8A9',
  },
  advancedDisabled: {
    fontSize: 11,
    color: '#AAA',
    fontStyle: 'italic',
  },
  dropsetControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropsetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropsetButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00B8A9',
  },
  dropsetCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
  dropsetDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF8E7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  dropsetDetailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 8,
  },
  dropsetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  dropsetLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    width: 50,
  },
  dropsetInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 6,
    fontSize: 13,
    color: '#333',
    backgroundColor: '#FFF',
    width: 60,
    textAlign: 'center',
  },
  dropsetX: {
    fontSize: 14,
    color: '#666',
  },
  dropsetUnit: {
    fontSize: 12,
    color: '#666',
  },
  supersetIndicator: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  supersetIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
});
