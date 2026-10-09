import { exerciseStore } from './exerciseStore';
import type { Exercise } from './exercises';
import { guessEquipment, guessExerciseCategory, normalizeName } from './workoutImport';
import type { Workout } from './workouts';

/**
 * Exercises that an import couldn't match to the catalog have ids starting with
 * "import-". Save each one as a custom exercise (or reuse a custom exercise with the
 * same name) so it appears in the exercise picker and matches future imports.
 */
export async function saveImportedExercises(workout: Workout): Promise<Workout> {
  if (!workout.exercises.some((ex) => ex.exerciseId.startsWith('import-'))) return workout;

  await exerciseStore.hydrate();
  const custom = exerciseStore.getCustomExercises();

  const exercises = [];
  for (const ex of workout.exercises) {
    if (!ex.exerciseId.startsWith('import-')) {
      exercises.push(ex);
      continue;
    }
    const norm = normalizeName(ex.exerciseName);
    const existing = custom.find((c) => normalizeName(c.name) === norm);
    if (existing) {
      exercises.push({ ...ex, exerciseId: existing.id, exerciseName: existing.name });
      continue;
    }
    const created: Exercise = {
      id: `custom-${norm.replace(/\s+/g, '-')}-${Date.now().toString(36)}`,
      name: ex.exerciseName,
      category: guessExerciseCategory(ex.exerciseName),
      description: 'Added from an imported workout.',
      instructions: [],
      difficulty: 'intermediate',
      equipment: guessEquipment(ex.exerciseName),
      muscleGroups: [],
    };
    custom.push(created);
    await exerciseStore.saveExercise(created);
    exercises.push({ ...ex, exerciseId: created.id });
  }
  return { ...workout, exercises };
}
