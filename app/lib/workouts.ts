export type WorkoutExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  unit?: 'lbs';
  restSeconds: number;
  notes?: string;
  // Superset: link to another exercise index (0-based) to perform back-to-back
  supersetWith?: number;
  // Dropsets: array of weight reductions (percentages or absolute weights)
  dropsets?: { weight: number; reps: number }[];
};

export type WorkoutCategory = 
  | 'power' 
  | 'endurance' 
  | 'agility' 
  | 'cardio' 
  | 'rotation'
  | 'flexibility'
  | 'athletic'
  | 'strength'
  | 'hypertrophy';

export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'legs' 
  | 'shoulders' 
  | 'arms' 
  | 'core' 
  | 'full-body'
  | 'push'
  | 'pull';

export type Workout = {
  id: string;
  title: string;
  description?: string;
  exercises: WorkoutExercise[];
  duration?: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: WorkoutCategory;
  muscleGroup?: MuscleGroup;
  createdAt: number;
  isCustom: boolean;
};

export const defaultWorkouts: Workout[] = [
  // CARDIO - Weight Loss Focused
  {
    id: 'hiit-fat-burner',
    title: 'HIIT Fat Burner',
    description: 'High-intensity intervals for maximum calorie burn',
    category: 'cardio',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'jumping-jacks', exerciseName: 'Jumping Jacks', sets: 4, reps: 30, restSeconds: 15 },
      { exerciseId: 'burpees', exerciseName: 'Burpees', sets: 4, reps: 10, restSeconds: 30 },
      { exerciseId: 'mountain-climbers', exerciseName: 'Mountain Climbers', sets: 4, reps: 20, restSeconds: 15 },
      { exerciseId: 'high-knees', exerciseName: 'High Knees', sets: 4, reps: 30, restSeconds: 15 },
    ],
    duration: 20,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'cardio-blast',
    title: 'Cardio Blast',
    description: 'Steady-state cardio for endurance and fat loss',
    category: 'cardio',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'running', exerciseName: 'Running', sets: 1, reps: 30, restSeconds: 0, notes: '30 minutes steady pace' },
      { exerciseId: 'jump-rope', exerciseName: 'Jump Rope', sets: 3, reps: 100, restSeconds: 30 },
    ],
    duration: 40,
    difficulty: 'beginner',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'cycling-endurance',
    title: 'Cycling Endurance',
    description: 'Low-impact cardio for fat burning',
    category: 'endurance',
    muscleGroup: 'legs',
    exercises: [
      { exerciseId: 'stationary-bike', exerciseName: 'Stationary Bike', sets: 1, reps: 45, restSeconds: 0, notes: '45 min moderate pace' },
    ],
    duration: 45,
    difficulty: 'beginner',
    createdAt: Date.now(),
    isCustom: false,
  },

  // HYPERTROPHY - Muscle Building
  {
    id: 'chest-hypertrophy',
    title: 'Chest Hypertrophy',
    description: 'Build a bigger, stronger chest',
    category: 'hypertrophy',
    muscleGroup: 'chest',
    exercises: [
      { exerciseId: 'bb-flat-bench-press', exerciseName: 'Barbell Bench Press', sets: 4, reps: 10, weight: 185, unit: 'lbs', restSeconds: 90 },
      { exerciseId: 'db-incline-bench-press', exerciseName: 'Incline Dumbbell Press', sets: 4, reps: 10, weight: 70, unit: 'lbs', restSeconds: 90 },
      { exerciseId: 'cable-flys', exerciseName: 'Cable Flys', sets: 3, reps: 12, weight: 40, unit: 'lbs', restSeconds: 60 },
      { exerciseId: 'pushups', exerciseName: 'Push-ups', sets: 3, reps: 15, restSeconds: 60 },
    ],
    duration: 50,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'back-hypertrophy',
    title: 'Back Hypertrophy',
    description: 'Build a thick, wide back',
    category: 'hypertrophy',
    muscleGroup: 'back',
    exercises: [
      { exerciseId: 'bb-deadlifts', exerciseName: 'Barbell Deadlifts', sets: 4, reps: 8, weight: 225, unit: 'lbs', restSeconds: 120 },
      { exerciseId: 'pullups', exerciseName: 'Pull-ups', sets: 4, reps: 10, restSeconds: 90 },
      { exerciseId: 't-bar-rows', exerciseName: 'T-Bar Rows', sets: 4, reps: 10, weight: 135, unit: 'lbs', restSeconds: 90 },
      { exerciseId: 'lat-pulldowns', exerciseName: 'Lat Pulldowns', sets: 3, reps: 12, weight: 120, unit: 'lbs', restSeconds: 60 },
    ],
    duration: 55,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'leg-hypertrophy',
    title: 'Leg Hypertrophy',
    description: 'Build massive quads, hamstrings, and glutes',
    category: 'hypertrophy',
    muscleGroup: 'legs',
    exercises: [
      { exerciseId: 'bb-back-squat', exerciseName: 'Barbell Back Squat', sets: 4, reps: 10, weight: 225, unit: 'lbs', restSeconds: 120 },
      { exerciseId: 'leg-press', exerciseName: 'Leg Press', sets: 4, reps: 12, weight: 315, unit: 'lbs', restSeconds: 90 },
      { exerciseId: 'bb-rdl', exerciseName: 'Barbell Romanian Deadlift', sets: 3, reps: 10, weight: 185, unit: 'lbs', restSeconds: 90 },
      { exerciseId: 'leg-curls', exerciseName: 'Leg Curls', sets: 3, reps: 12, weight: 80, unit: 'lbs', restSeconds: 60 },
      { exerciseId: 'standing-calf-raise', exerciseName: 'Standing Calf Raise', sets: 4, reps: 15, weight: 100, unit: 'lbs', restSeconds: 45 },
    ],
    duration: 60,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'shoulder-hypertrophy',
    title: 'Shoulder Hypertrophy',
    description: 'Build massive, boulder shoulders',
    category: 'hypertrophy',
    muscleGroup: 'shoulders',
    exercises: [
      { exerciseId: 'bb-shoulder-press', exerciseName: 'Barbell Shoulder Press', sets: 4, reps: 10, weight: 115, unit: 'lbs', restSeconds: 90 },
      { exerciseId: 'db-lateral-raises', exerciseName: 'Dumbbell Lateral Raises', sets: 4, reps: 12, weight: 25, unit: 'lbs', restSeconds: 60 },
      { exerciseId: 'db-front-raises', exerciseName: 'Dumbbell Front Raises', sets: 3, reps: 12, weight: 25, unit: 'lbs', restSeconds: 60 },
      { exerciseId: 'cable-face-pulls', exerciseName: 'Cable Face Pulls', sets: 3, reps: 15, weight: 50, unit: 'lbs', restSeconds: 45 },
    ],
    duration: 45,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'arm-hypertrophy',
    title: 'Arm Hypertrophy',
    description: 'Build bigger biceps and triceps',
    category: 'hypertrophy',
    muscleGroup: 'arms',
    exercises: [
      { exerciseId: 'bb-curls', exerciseName: 'Barbell Curls', sets: 4, reps: 10, weight: 65, unit: 'lbs', restSeconds: 60 },
      { exerciseId: 'db-hammer-curls', exerciseName: 'Hammer Curls', sets: 3, reps: 12, weight: 30, unit: 'lbs', restSeconds: 60 },
      { exerciseId: 'ez-bar-curls', exerciseName: 'EZ Bar Curls', sets: 3, reps: 10, weight: 55, unit: 'lbs', restSeconds: 60 },
      { exerciseId: 'tricep-cable-pushdowns', exerciseName: 'Tricep Cable Pushdowns', sets: 4, reps: 12, weight: 50, unit: 'lbs', restSeconds: 60 },
      { exerciseId: 'ez-bar-skullcrushers', exerciseName: 'Skull Crushers', sets: 3, reps: 10, weight: 55, unit: 'lbs', restSeconds: 60 },
      { exerciseId: 'tricep-dips', exerciseName: 'Tricep Dips', sets: 3, reps: 12, restSeconds: 60 },
    ],
    duration: 40,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'morning-mobility',
    title: 'Morning Mobility Flow',
    description: 'Wake up your body with dynamic stretches and mobility work',
    exercises: [
      { exerciseId: 'cat-cow-stretch', exerciseName: 'Cat-Cow Stretch', sets: 1, reps: 10, restSeconds: 0 },
      { exerciseId: 'thoracic-rotation', exerciseName: 'Thoracic Spine Rotation', sets: 1, reps: 10, restSeconds: 0, notes: 'Each side' },
      { exerciseId: 'hip-circles', exerciseName: 'Hip Circles', sets: 1, reps: 10, restSeconds: 0, notes: 'Each direction, each leg' },
      { exerciseId: 'world-greatest-stretch', exerciseName: "World's Greatest Stretch", sets: 1, reps: 5, restSeconds: 0, notes: 'Each side' },
      { exerciseId: 'downward-dog', exerciseName: 'Downward Facing Dog', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds' },
      { exerciseId: 'ankle-circles', exerciseName: 'Ankle Circles', sets: 1, reps: 10, restSeconds: 0, notes: 'Each direction, each foot' },
    ],
    duration: 10,
    difficulty: 'beginner',
    category: 'flexibility',
    muscleGroup: 'full-body',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'lower-body-flexibility',
    title: 'Lower Body Flexibility',
    description: 'Deep stretches for hips, legs, and lower back',
    exercises: [
      { exerciseId: 'hip-flexor-stretch', exerciseName: 'Hip Flexor Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds each side' },
      { exerciseId: 'pigeon-pose', exerciseName: 'Pigeon Pose', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 60 seconds each side' },
      { exerciseId: 'knee-to-chest', exerciseName: 'Knee to Chest Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds each side' },
      { exerciseId: 'butterfly-stretch', exerciseName: 'Butterfly Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 60 seconds' },
      { exerciseId: 'figure-four-stretch', exerciseName: 'Figure Four Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds each side' },
      { exerciseId: 'world-greatest-stretch', exerciseName: 'World Greatest Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds each side' },
      { exerciseId: 'calf-stretch', exerciseName: 'Wall Calf Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'lying-spinal-twist', exerciseName: 'Lying Spinal Twist', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds each side' },
    ],
    duration: 20,
    difficulty: 'beginner',
    category: 'flexibility',
    muscleGroup: 'legs',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'upper-body-flexibility',
    title: 'Upper Body Flexibility',
    description: 'Stretches for shoulders, chest, back, and arms',
    exercises: [
      { exerciseId: 'neck-stretch', exerciseName: 'Neck Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'shoulder-stretch', exerciseName: 'Cross-Body Shoulder Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'tricep-stretch', exerciseName: 'Overhead Tricep Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'chest-doorway-stretch', exerciseName: 'Doorway Chest Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds' },
      { exerciseId: 'banded-shoulder-dislocates', exerciseName: 'Banded Shoulder Dislocates', sets: 2, reps: 15, restSeconds: 30 },
      { exerciseId: 'cat-cow-stretch', exerciseName: 'Cat-Cow Stretch', sets: 1, reps: 15, restSeconds: 0 },
      { exerciseId: 'thoracic-rotation', exerciseName: 'Thoracic Spine Rotation', sets: 2, reps: 10, restSeconds: 0, notes: 'Each side' },
      { exerciseId: 'childs-pose', exerciseName: "Child's Pose", sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 60 seconds' },
    ],
    duration: 15,
    difficulty: 'beginner',
    category: 'flexibility',
    muscleGroup: 'push',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'foam-rolling-recovery',
    title: 'Foam Rolling Recovery',
    description: 'Self-myofascial release for muscle recovery',
    exercises: [
      { exerciseId: 'foam-roll-back', exerciseName: 'Foam Roll - Upper Back', sets: 1, reps: 1, restSeconds: 0, notes: 'Roll 2 minutes' },
      { exerciseId: 'foam-roll-quads', exerciseName: 'Foam Roll - Quads', sets: 1, reps: 1, restSeconds: 0, notes: 'Roll 2 minutes each leg' },
      { exerciseId: 'foam-roll-it-band', exerciseName: 'Foam Roll - IT Band', sets: 1, reps: 1, restSeconds: 0, notes: 'Roll 2 minutes each side' },
      { exerciseId: 'figure-four-stretch', exerciseName: 'Figure Four Stretch', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds each side' },
      { exerciseId: 'childs-pose', exerciseName: "Child's Pose", sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 60 seconds' },
    ],
    duration: 15,
    difficulty: 'beginner',
    category: 'flexibility',
    muscleGroup: 'full-body',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'yoga-flow',
    title: 'Yoga Flow for Athletes',
    description: 'Yoga-inspired stretches for improved flexibility and balance',
    exercises: [
      { exerciseId: 'cat-cow-stretch', exerciseName: 'Cat-Cow Stretch', sets: 1, reps: 10, restSeconds: 0 },
      { exerciseId: 'downward-dog', exerciseName: 'Downward Facing Dog', sets: 3, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds' },
      { exerciseId: 'cobra-stretch', exerciseName: 'Cobra Stretch', sets: 3, reps: 1, restSeconds: 0, notes: 'Hold 20 seconds' },
      { exerciseId: 'pigeon-pose', exerciseName: 'Pigeon Pose', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 60 seconds each side' },
      { exerciseId: 'seated-spinal-twist', exerciseName: 'Seated Spinal Twist', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'butterfly-stretch', exerciseName: 'Butterfly Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds' },
      { exerciseId: 'childs-pose', exerciseName: "Child's Pose", sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 60 seconds' },
    ],
    duration: 20,
    difficulty: 'intermediate',
    category: 'flexibility',
    muscleGroup: 'full-body',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'post-workout-stretch',
    title: 'Post-Workout Cool Down',
    description: 'Essential stretches after any workout',
    exercises: [
      { exerciseId: 'chest-doorway-stretch', exerciseName: 'Doorway Chest Stretch', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds' },
      { exerciseId: 'shoulder-stretch', exerciseName: 'Cross-Body Shoulder Stretch', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'world-greatest-stretch', exerciseName: 'World Greatest Stretch', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'pigeon-pose', exerciseName: 'Pigeon Pose', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'hip-flexor-stretch', exerciseName: 'Hip Flexor Stretch', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'calf-stretch', exerciseName: 'Wall Calf Stretch', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'lying-spinal-twist', exerciseName: 'Lying Spinal Twist', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
    ],
    duration: 10,
    difficulty: 'beginner',
    category: 'flexibility',
    muscleGroup: 'full-body',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'desk-worker-relief',
    title: 'Desk Worker Relief',
    description: 'Stretches to counteract sitting all day',
    exercises: [
      { exerciseId: 'neck-stretch', exerciseName: 'Neck Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'chest-doorway-stretch', exerciseName: 'Doorway Chest Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds' },
      { exerciseId: 'hip-flexor-stretch', exerciseName: 'Hip Flexor Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 60 seconds each side' },
      { exerciseId: 'cat-cow-stretch', exerciseName: 'Cat-Cow Stretch', sets: 1, reps: 15, restSeconds: 0 },
      { exerciseId: 'thoracic-rotation', exerciseName: 'Thoracic Spine Rotation', sets: 2, reps: 10, restSeconds: 0, notes: 'Each side' },
      { exerciseId: 'standing-side-bend', exerciseName: 'Standing Side Bend', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'figure-four-stretch', exerciseName: 'Figure Four Stretch', sets: 2, reps: 1, restSeconds: 0, notes: 'Hold 45 seconds each side' },
    ],
    duration: 15,
    difficulty: 'beginner',
    category: 'flexibility',
    muscleGroup: 'full-body',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'arm-care-routine',
    title: 'Arm Care / Throwing Program',
    description: 'Essential shoulder and arm health for pitchers, throwers, and overhead athletes',
    exercises: [
      { exerciseId: 'arm-circles', exerciseName: 'Arm Circles', sets: 1, reps: 20, restSeconds: 0, notes: 'Each direction' },
      { exerciseId: 'banded-shoulder-dislocates', exerciseName: 'Banded Shoulder Dislocates', sets: 2, reps: 15, restSeconds: 30 },
      { exerciseId: 'band-pull-aparts', exerciseName: 'Band Pull Aparts', sets: 3, reps: 15, restSeconds: 30 },
      { exerciseId: 'external-rotation', exerciseName: 'Banded External Rotation', sets: 2, reps: 15, restSeconds: 30, notes: 'Each arm' },
      { exerciseId: 'internal-rotation', exerciseName: 'Banded Internal Rotation', sets: 2, reps: 15, restSeconds: 30, notes: 'Each arm' },
      { exerciseId: 'prone-y-raise', exerciseName: 'Prone Y Raise', sets: 2, reps: 12, restSeconds: 30 },
      { exerciseId: 'prone-t-raise', exerciseName: 'Prone T Raise', sets: 2, reps: 12, restSeconds: 30 },
      { exerciseId: 'prone-w-raise', exerciseName: 'Prone W Raise', sets: 2, reps: 12, restSeconds: 30 },
      { exerciseId: 'scapular-wall-slides', exerciseName: 'Scapular Wall Slides', sets: 2, reps: 10, restSeconds: 30 },
      { exerciseId: 'sleeper-stretch', exerciseName: 'Sleeper Stretch', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'cross-body-stretch', exerciseName: 'Cross Body Posterior Stretch', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'wrist-flexor-stretch', exerciseName: 'Wrist Flexor Stretch', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
      { exerciseId: 'wrist-extensor-stretch', exerciseName: 'Wrist Extensor Stretch', sets: 1, reps: 1, restSeconds: 0, notes: 'Hold 30 seconds each side' },
    ],
    duration: 20,
    difficulty: 'beginner',
    category: 'flexibility',
    muscleGroup: 'arms',
    createdAt: Date.now(),
    isCustom: false,
  },

  // ATHLETIC - Sport-Specific Workouts
  {
    id: 'football-power',
    title: 'Football Explosive & Strength',
    description: 'Explosive power, strength, and speed training for football athletes. Includes supersets for explosive power development.',
    category: 'athletic',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'bb-flat-bench-press', exerciseName: 'Explosive Chest Press', sets: 4, reps: 5, restSeconds: 90, notes: 'Low weight, high speed - explosive' },
      { exerciseId: 'clean', exerciseName: 'Barbell Power Clean', sets: 3, reps: 5, restSeconds: 0, notes: 'SUPERSET: Low weight, high speed', supersetWith: 2 },
      { exerciseId: 'depth-jump', exerciseName: 'Box Depth Drops', sets: 3, reps: 5, restSeconds: 90, notes: 'SUPERSET: Perform immediately after power clean' },
      { exerciseId: 'sled-push', exerciseName: 'Sled Push', sets: 5, reps: 1, restSeconds: 120, notes: 'Max effort each rep' },
      { exerciseId: 'landmine-row', exerciseName: 'Landmine Rows', sets: 3, reps: 5, restSeconds: 90, notes: 'High weight, low reps' },
      { exerciseId: 'broad-jump', exerciseName: 'Broad Jumps', sets: 2, reps: 5, restSeconds: 60 },
      { exerciseId: 'bb-bicep-curl', exerciseName: 'Barbell Bicep Curls', sets: 3, reps: 10, restSeconds: 60, notes: 'Hypertrophy' },
    ],
    duration: 55,
    difficulty: 'advanced',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'baseball-performance',
    title: 'Baseball Performance',
    description: 'Rotational power, arm health, and explosive speed for baseball players. Features multiple supersets for athletic development.',
    category: 'athletic',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'chinups', exerciseName: 'Chin Ups', sets: 5, reps: 5, restSeconds: 90 },
      { exerciseId: 'bb-box-squat', exerciseName: 'Barbell Box Squat', sets: 4, reps: 5, restSeconds: 0, notes: 'SUPERSET: High weight', supersetWith: 2 },
      { exerciseId: 'box-jump', exerciseName: 'Box Squat Vertical Jumps', sets: 4, reps: 5, restSeconds: 90, notes: 'SUPERSET: Perform immediately after box squat' },
      { exerciseId: 'rotational-med-ball-throw', exerciseName: 'Rotational Med Ball Throws', sets: 3, reps: 5, restSeconds: 0, notes: 'SUPERSET: Explosive rotational power', supersetWith: 4 },
      { exerciseId: 'cable-woodchops', exerciseName: 'Cable Woodchops', sets: 3, reps: 10, restSeconds: 45, notes: 'SUPERSET: Perform immediately after med ball throws' },
      { exerciseId: '90-90-hip-flexor', exerciseName: '90/90 Hip Flexors', sets: 3, reps: 8, restSeconds: 0, notes: 'SUPERSET: Mobility work', supersetWith: 6 },
      { exerciseId: 'hip-flexor-stretch', exerciseName: 'Hip Flexor Stretch', sets: 3, reps: 1, restSeconds: 30, notes: 'SUPERSET: Hold 30 seconds each side' },
      { exerciseId: 'landmine-press', exerciseName: 'Rotational Landmine Press', sets: 3, reps: 4, restSeconds: 0, notes: 'SUPERSET: Low weight, explosive', supersetWith: 8 },
      { exerciseId: 'y-raise', exerciseName: 'Y Raises', sets: 3, reps: 10, restSeconds: 45, notes: 'SUPERSET: Low weight for stability and arm care' },
      { exerciseId: 'lateral-bounds', exerciseName: 'Lateral Bounds', sets: 3, reps: 10, restSeconds: 60 },
    ],
    duration: 60,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'hockey-conditioning',
    title: 'Hockey Conditioning',
    description: 'Build skating power, lateral movement, and endurance for hockey',
    category: 'athletic',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'bb-back-squat', exerciseName: 'Barbell Back Squat', sets: 4, reps: 10, restSeconds: 90, notes: 'Hypertrophy' },
      { exerciseId: 'bb-rdl', exerciseName: 'Barbell RDL', sets: 4, reps: 10, restSeconds: 90, notes: 'Hypertrophy' },
      { exerciseId: 'russian-twists', exerciseName: 'Russian Twists', sets: 3, reps: 15, restSeconds: 45 },
      { exerciseId: 'skater-jumps', exerciseName: 'Skater Jumps', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'wall-sit', exerciseName: 'Wall Sit', sets: 3, reps: 1, restSeconds: 60, notes: 'Hold 1 minute' },
      { exerciseId: 'battle-ropes', exerciseName: 'Battle Rope', sets: 3, reps: 1, restSeconds: 45, notes: '30 seconds each' },
      { exerciseId: 'db-flat-bench-press', exerciseName: 'DB Bench Press', sets: 3, reps: 4, restSeconds: 90, notes: 'High weight' },
    ],
    duration: 50,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'soccer-endurance',
    title: 'Soccer Conditioning',
    description: 'Improve endurance, agility, and leg strength for soccer. Includes supersets for explosive lower body power.',
    category: 'athletic',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'bb-back-squat', exerciseName: 'BB Back Squat', sets: 4, reps: 4, restSeconds: 0, notes: 'SUPERSET: High weight', supersetWith: 1 },
      { exerciseId: 'box-jump', exerciseName: 'Box Jumps', sets: 4, reps: 4, restSeconds: 120, notes: 'SUPERSET: Perform immediately after squat' },
      { exerciseId: 'bb-deadlift', exerciseName: 'BB Deadlift', sets: 4, reps: 4, restSeconds: 120, notes: 'High weight' },
      { exerciseId: 'standing-calf-raise', exerciseName: 'Calf Raises', sets: 4, reps: 15, restSeconds: 45 },
      { exerciseId: 'box-step-down', exerciseName: 'Box Step Downs', sets: 4, reps: 5, restSeconds: 0, notes: 'SUPERSET: Stability work', supersetWith: 5 },
      { exerciseId: 'step-ups', exerciseName: 'Step Ups', sets: 4, reps: 5, restSeconds: 60, notes: 'SUPERSET: Perform immediately after step downs' },
      { exerciseId: 'running', exerciseName: 'Sprint Intervals', sets: 6, reps: 1, restSeconds: 90, notes: 'Max effort sprints' },
      { exerciseId: 'planks', exerciseName: 'Plank', sets: 4, reps: 1, restSeconds: 30, notes: 'Hold 1 minute' },
      { exerciseId: 'ladder-drills', exerciseName: 'Agility Ladder', sets: 4, reps: 1, restSeconds: 45, notes: 'Various patterns' },
    ],
    duration: 55,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'basketball-explosiveness',
    title: 'Basketball Explosiveness',
    description: 'Build vertical jump, court speed, and basketball-specific conditioning. Includes superset for explosive leg power.',
    category: 'athletic',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'depth-jump', exerciseName: 'Depth Drop Vertical Jumps', sets: 4, reps: 5, restSeconds: 90 },
      { exerciseId: 'bulgarian-split-squat', exerciseName: 'Bulgarian Split Squats', sets: 4, reps: 4, restSeconds: 0, notes: 'SUPERSET: High weight', supersetWith: 2 },
      { exerciseId: 'split-squat-jump', exerciseName: 'Split Squat Jumps', sets: 4, reps: 4, restSeconds: 90, notes: 'SUPERSET: Perform immediately after split squats' },
      { exerciseId: 'db-rdl', exerciseName: 'DB RDL', sets: 4, reps: 5, restSeconds: 90, notes: 'High weight' },
      { exerciseId: 'explosive-pushups', exerciseName: 'Explosive Pushups', sets: 4, reps: 5, restSeconds: 60 },
      { exerciseId: 'cone-shuffles', exerciseName: 'Cone Shuffles', sets: 4, reps: 1, restSeconds: 45, notes: 'Down and back' },
      { exerciseId: 'ladder-drills', exerciseName: 'Agility Ladder', sets: 4, reps: 1, restSeconds: 45, notes: 'Various patterns' },
    ],
    duration: 50,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },

  // Additional STRENGTH Workouts
  {
    id: 'upper-body-strength',
    title: 'Upper Body Strength',
    description: 'Heavy pushing and pulling for upper body strength',
    category: 'strength',
    muscleGroup: 'push',
    exercises: [
      { exerciseId: 'bb-flat-bench-press', exerciseName: 'Barbell Bench Press', sets: 5, reps: 5, weight: 205, unit: 'lbs', restSeconds: 180 },
      { exerciseId: 't-bar-rows', exerciseName: 'T-Bar Rows', sets: 5, reps: 5, weight: 155, unit: 'lbs', restSeconds: 150 },
      { exerciseId: 'bb-shoulder-press', exerciseName: 'Barbell Shoulder Press', sets: 4, reps: 6, weight: 115, unit: 'lbs', restSeconds: 150 },
      { exerciseId: 'pullups', exerciseName: 'Weighted Pull-ups', sets: 4, reps: 6, weight: 25, unit: 'lbs', restSeconds: 120 },
    ],
    duration: 55,
    difficulty: 'advanced',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'lower-body-strength',
    title: 'Lower Body Strength',
    description: 'Build raw leg strength with heavy compound lifts',
    category: 'strength',
    muscleGroup: 'legs',
    exercises: [
      { exerciseId: 'bb-back-squat', exerciseName: 'Back Squats', sets: 5, reps: 5, weight: 275, unit: 'lbs', restSeconds: 180 },
      { exerciseId: 'bb-deadlifts', exerciseName: 'Barbell Deadlifts', sets: 4, reps: 5, weight: 315, unit: 'lbs', restSeconds: 240 },
      { exerciseId: 'leg-press', exerciseName: 'Leg Press', sets: 4, reps: 8, weight: 405, unit: 'lbs', restSeconds: 120 },
      { exerciseId: 'lunges', exerciseName: 'Barbell Lunges', sets: 3, reps: 8, weight: 95, unit: 'lbs', restSeconds: 90, notes: 'Each leg' },
    ],
    duration: 60,
    difficulty: 'advanced',
    createdAt: Date.now(),
    isCustom: false,
  },

  // Additional POWER Workouts
  {
    id: 'olympic-lifting',
    title: 'Olympic Lifting Focus',
    description: 'Master the Olympic lifts for explosive power',
    category: 'power',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'hang-clean', exerciseName: 'Hang Clean', sets: 5, reps: 3, weight: 135, unit: 'lbs', restSeconds: 150 },
      { exerciseId: 'snatch', exerciseName: 'Snatch', sets: 4, reps: 2, weight: 95, unit: 'lbs', restSeconds: 180 },
      { exerciseId: 'clean-and-jerk', exerciseName: 'Clean and Jerk', sets: 4, reps: 2, weight: 155, unit: 'lbs', restSeconds: 180 },
      { exerciseId: 'depth-jump', exerciseName: 'Depth Jumps', sets: 3, reps: 5, restSeconds: 90 },
    ],
    duration: 60,
    difficulty: 'advanced',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'plyometric-power',
    title: 'Plyometric Power Circuit',
    description: 'Explosive bodyweight movements for athletic power',
    category: 'power',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'broad-jump', exerciseName: 'Broad Jumps', sets: 4, reps: 8, restSeconds: 90 },
      { exerciseId: 'depth-jump', exerciseName: 'Depth Jumps', sets: 3, reps: 6, restSeconds: 120 },
      { exerciseId: 'vertical-jump', exerciseName: 'Vertical Jump', sets: 4, reps: 6, restSeconds: 90 },
      { exerciseId: 'tuck-jumps', exerciseName: 'Tuck Jumps', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'split-squat-jump', exerciseName: 'Split Squat Jump', sets: 3, reps: 8, restSeconds: 60, notes: 'Each side' },
      { exerciseId: 'mb-slams', exerciseName: 'Medicine Ball Slams', sets: 4, reps: 10, weight: 20, unit: 'lbs', restSeconds: 45 },
    ],
    duration: 40,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },

  // Additional AGILITY Workouts
  {
    id: 'cone-agility',
    title: 'Cone Agility Training',
    description: 'Change of direction and reaction drills',
    category: 'agility',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'pro-agility-shuttle', exerciseName: 'Pro Agility Shuttle (5-10-5)', sets: 5, reps: 1, restSeconds: 90 },
      { exerciseId: 't-drill', exerciseName: 'T-Drill', sets: 5, reps: 1, restSeconds: 90 },
      { exerciseId: 'l-drill', exerciseName: 'L-Drill (3-Cone)', sets: 5, reps: 1, restSeconds: 90 },
      { exerciseId: 'ladder-drills', exerciseName: 'Ladder Drills', sets: 4, reps: 1, restSeconds: 60, notes: 'Various patterns' },
      { exerciseId: 'backpedal', exerciseName: 'Backpedal to Sprint', sets: 6, reps: 1, restSeconds: 60, notes: '10 yard backpedal, 20 yard sprint' },
    ],
    duration: 35,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'footwork-speed',
    title: 'Footwork & Speed',
    description: 'Quick feet and acceleration training',
    category: 'agility',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'ladder-drills', exerciseName: 'Ladder Drills', sets: 6, reps: 1, restSeconds: 45, notes: 'Different patterns each set' },
      { exerciseId: 'high-knees', exerciseName: 'High Knees', sets: 4, reps: 30, restSeconds: 30 },
      { exerciseId: 'skater-jumps', exerciseName: 'Skater Jumps', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'lateral-bounds', exerciseName: 'Lateral Bounds', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'running', exerciseName: 'Sprint Intervals', sets: 6, reps: 1, restSeconds: 90, notes: '20 yard sprints' },
    ],
    duration: 30,
    difficulty: 'beginner',
    createdAt: Date.now(),
    isCustom: false,
  },

  // Additional ENDURANCE Workouts
  {
    id: 'circuit-endurance',
    title: 'Full Body Circuit Endurance',
    description: 'High rep circuit for muscular endurance',
    category: 'endurance',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'kettlebell-swing', exerciseName: 'Kettlebell Swing', sets: 4, reps: 20, weight: 35, unit: 'lbs', restSeconds: 30 },
      { exerciseId: 'pushups', exerciseName: 'Push-ups', sets: 4, reps: 20, restSeconds: 30 },
      { exerciseId: 'db-goblet-squat', exerciseName: 'Goblet Squats', sets: 4, reps: 25, restSeconds: 30 },
      { exerciseId: 'burpees', exerciseName: 'Burpees', sets: 3, reps: 15, restSeconds: 45 },
      { exerciseId: 'mountain-climbers', exerciseName: 'Mountain Climbers', sets: 4, reps: 30, restSeconds: 30 },
      { exerciseId: 'planks', exerciseName: 'Planks', sets: 3, reps: 1, restSeconds: 30, notes: 'Hold 45 seconds' },
    ],
    duration: 35,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'strongman-endurance',
    title: 'Strongman Conditioning',
    description: 'Loaded carries and functional endurance',
    category: 'endurance',
    muscleGroup: 'full-body',
    exercises: [
      { exerciseId: 'farmers-carry', exerciseName: "Farmer's Carry", sets: 4, reps: 1, weight: 70, unit: 'lbs', restSeconds: 90, notes: '50 yard carry each hand' },
      { exerciseId: 'sled-push', exerciseName: 'Sled Push', sets: 4, reps: 1, restSeconds: 90, notes: '40 yards' },
      { exerciseId: 'sled-pull', exerciseName: 'Sled Pull', sets: 4, reps: 1, restSeconds: 90, notes: '40 yards' },
      { exerciseId: 'tire-flips', exerciseName: 'Tire Flips', sets: 3, reps: 8, restSeconds: 120 },
      { exerciseId: 'battle-ropes', exerciseName: 'Battle Ropes', sets: 4, reps: 1, restSeconds: 45, notes: '30 seconds' },
    ],
    duration: 45,
    difficulty: 'advanced',
    createdAt: Date.now(),
    isCustom: false,
  },

  // Additional ROTATION/CORE Workouts
  {
    id: 'anti-rotation-core',
    title: 'Anti-Rotation Core Training',
    description: 'Build core stability and resist rotation',
    category: 'rotation',
    muscleGroup: 'core',
    exercises: [
      { exerciseId: 'anti-rotation-press', exerciseName: 'Pallof Press', sets: 3, reps: 12, restSeconds: 45, notes: 'Each side' },
      { exerciseId: 'planks', exerciseName: 'Planks', sets: 3, reps: 1, restSeconds: 45, notes: 'Hold 45 seconds' },
      { exerciseId: 'dead-bugs', exerciseName: 'Dead Bugs', sets: 3, reps: 10, restSeconds: 30, notes: 'Each side' },
      { exerciseId: 'bear-crawl', exerciseName: 'Bear Crawl', sets: 3, reps: 10, restSeconds: 30, notes: 'Each side' },
      { exerciseId: 'farmers-carry', exerciseName: "Single Arm Farmer's Carry", sets: 3, reps: 1, weight: 50, unit: 'lbs', restSeconds: 60, notes: '30 yards each side' },
    ],
    duration: 25,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
  {
    id: 'rotational-athlete',
    title: 'Rotational Athlete Core',
    description: 'Power rotation for throwing, batting, and golf',
    category: 'rotation',
    muscleGroup: 'core',
    exercises: [
      { exerciseId: 'rotational-med-ball-throw', exerciseName: 'Rotational Med Ball Throw', sets: 4, reps: 8, restSeconds: 45, notes: 'Each side' },
      { exerciseId: 'cable-woodchops', exerciseName: 'Cable Woodchops', sets: 3, reps: 12, weight: 50, unit: 'lbs', restSeconds: 45, notes: 'Each side' },
      { exerciseId: 'russian-twists', exerciseName: 'Russian Twists', sets: 3, reps: 20, weight: 25, unit: 'lbs', restSeconds: 45 },
      { exerciseId: 'mb-slams', exerciseName: 'Rotational Slams', sets: 3, reps: 10, weight: 15, unit: 'lbs', restSeconds: 45, notes: 'Slam to each side' },
      { exerciseId: 'hanging-bar-knee-raises', exerciseName: 'Hanging Knee Raises with Twist', sets: 3, reps: 12, restSeconds: 45 },
    ],
    duration: 30,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    isCustom: false,
  },
];

export function getWorkoutsByCategory(category: WorkoutCategory): Workout[] {
  // Include both default and custom workouts in the category
  const customWorkouts = typeof workoutStore !== 'undefined' && workoutStore.getCustomWorkouts ? workoutStore.getCustomWorkouts() : [];
  return [
    ...defaultWorkouts.filter(w => w.category === category),
    ...customWorkouts.filter(w => w.category === category)
  ];
}

export function getWorkoutsByMuscleGroup(muscleGroup: MuscleGroup): Workout[] {
  return defaultWorkouts.filter(w => w.muscleGroup === muscleGroup);
}

export function getRecommendedWorkouts(goal?: string): Workout[] {
  if (!goal) return defaultWorkouts.slice(0, 5);
  
  const goalLower = goal.toLowerCase();
  let recommendedCategories: WorkoutCategory[] = [];
  let recommendedMuscleGroups: MuscleGroup[] = [];
  
  if (goal === 'weight-loss' || goalLower.includes('lose') || goalLower.includes('fat')) {
    // Weight loss: cardio and endurance focused
    recommendedCategories = ['cardio', 'endurance'];
    return defaultWorkouts
      .filter(w => recommendedCategories.includes(w.category))
      .slice(0, 5);
  } else if (goal === 'muscle-gain' || goalLower.includes('gain') || goalLower.includes('muscle') || goalLower.includes('bulk')) {
    // Muscle gain: hypertrophy and strength focused
    recommendedCategories = ['hypertrophy', 'strength'];
    return defaultWorkouts
      .filter(w => recommendedCategories.includes(w.category))
      .slice(0, 5);
  } else if (goal === 'performance' || goalLower.includes('athletic') || goalLower.includes('performance')) {
    // Athletic performance: power, agility, athletic, and endurance
    recommendedCategories = ['athletic', 'power', 'agility', 'endurance'];
    return defaultWorkouts
      .filter(w => recommendedCategories.includes(w.category))
      .slice(0, 5);
  } else if (goal === 'recomposition' || goalLower.includes('recomposition')) {
    // Body recomposition: mix of hypertrophy and cardio
    recommendedCategories = ['hypertrophy', 'cardio', 'strength'];
    return defaultWorkouts
      .filter(w => recommendedCategories.includes(w.category))
      .slice(0, 5);
  }
  
  return defaultWorkouts.slice(0, 5);
}

export function getCategorizedWorkouts(): Record<string, Workout[]> {
  return {
    athletic: getWorkoutsByCategory('athletic'),
    cardio: getWorkoutsByCategory('cardio'),
    hypertrophy: getWorkoutsByCategory('hypertrophy'),
    strength: getWorkoutsByCategory('strength'),
    power: getWorkoutsByCategory('power'),
    agility: getWorkoutsByCategory('agility'),
    endurance: getWorkoutsByCategory('endurance'),
    core: getWorkoutsByCategory('rotation'),
    stretching: getWorkoutsByCategory('flexibility'),
  };
}

// Daily challenge workout - rotates each day based on the date
export function getDailyChallengeWorkout(): Workout {
  // Use the day of the year to pick a different workout each day
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Get all default workouts and pick one based on day
  const workoutIndex = dayOfYear % defaultWorkouts.length;
  const baseWorkout = defaultWorkouts[workoutIndex];
  
  // Return a copy with the daily-challenge id
  return {
    ...baseWorkout,
    id: 'daily-challenge',
    description: `${baseWorkout.description || baseWorkout.title} - Daily Challenge! Complete for +500 XP!`,
  };
}
