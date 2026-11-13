import type { Exercise } from './exercises';
import { guessEquipment, guessExerciseCategory } from './workoutImport';

// The exercise library, organized into training goals (Hypertrophy, Strength, ...) and
// the categories inside each goal. One exercise can appear in several categories; it is
// still a single exercise in the app.
//
// Format:
//   # Group                       a training goal (top-level filter)
//   ## Category | Muscle, Muscle  a category inside the goal, and the muscles it trains
//   Exercise Name                 a new exercise (id: "lib-" + name in kebab case)
//   Exercise Name @catalog-id     an exercise that already exists in exercises.ts
//
// Ids are stored in saved workouts, so don't rename an exercise once it ships;
// add an alias instead.
const RAW = `
# Hypertrophy
## Upper Chest | Upper Chest, Anterior Deltoids
Incline Dumbbell Bench Press @db-incline-bench-press
Incline Barbell Bench Press @bb-incline-bench-press
Incline Dumbbell Fly
Low to High Cable Fly
Incline Chest Press Machine @incline-chest-press-machine
## Mid Chest | Middle Chest, Triceps
Push-ups @pushups
Flat Dumbbell Bench Press @db-flat-bench-press
Flat Barbell Bench Press @bb-flat-bench-press
Dumbbell Floor Press
Barbell Floor Press
Chest Press Machine @chest-press-machine
Dumbbell Chest Flys @db-flys
Machine Flys @pec-deck-machine
## Lower Chest | Lower Chest, Triceps
Chest Dips @chest-dips
High to Low Cable Fly
Bench Dips
Dip Machine
Decline Dumbbell Press @db-decline-bench-press
Decline Dumbbell Flys
Decline Chest Press Machine
## Front Delts | Anterior Deltoids, Shoulders
Seated Dumbbell Shoulder Press @db-shoulder-press
Seated Barbell Shoulder Press
Standing Barbell Shoulder Press
Dumbbell Front Raises @db-front-raises
Machine Shoulder Press
## Side Delts | Lateral Deltoids, Shoulders
Dumbbell Lateral Raises @db-lateral-raises
Cable Lateral Raises
## Rear Delts | Rear Delts, Shoulders
Cable Face Pulls @cable-face-pulls
Reverse Pec Deck
Band Pull Aparts @band-pull-aparts
## Triceps Long Head | Triceps (Long Head)
Cable Tricep Extension @tricep-cable-extensions
Tricep Extension Machine
EZ Bar Skull Crushers @ez-bar-skullcrushers
EZ Bar Tricep Extensions
## Triceps Lateral & Medial Head | Triceps (Lateral Head), Triceps (Medial Head)
Tricep Dips @tricep-dips
Bench Dips
Dip Machine
Tricep Pushdowns @tricep-cable-pushdowns
Tricep Pulldowns @tricep-cable-pulldowns
Close Grip Barbell Bench Press @close-grip-bb-bench-press
Close Grip Push-ups @close-grip-pushups
Military Push-ups
## Biceps Long Head | Biceps (Long Head)
Incline Dumbbell Curl @db-incline-curls
Incline Curl Machine
Barbell Curls @bb-curls
Dumbbell Curls @db-curls
## Biceps Short Head | Biceps (Short Head)
Dumbbell Preacher Curl @db-preacher-curls
EZ Bar Preacher Curl
Preacher Curl Machine
Wide Grip Barbell Curl
Dumbbell Curls @db-curls
Cable Curl (Arms in Front of Body)
## Brachialis | Brachialis, Forearms
Dumbbell Hammer Curl @db-hammer-curls
Rope Hammer Curl
## Forearm Flexors | Forearms
Dumbbell Wrist Curls @db-wrist-curls
Farmers Carries @farmers-walk
Towel Pull-ups
Dead Hangs @dead-hang
Towel Dead Hangs
Grip Roll-ups
## Forearm Extensors | Forearms
Reverse Dumbbell Wrist Curls
Grip Roll-ups
## Lats | Lats
Pull-ups @pullups
Neutral Grip Pull-ups
Chin-ups @chin-ups
Chest Supported Dumbbell Rows
Chest Supported Row Machine
Lat Pulldowns @lat-pulldowns
Lat Pulldown Machine
## Upper Back | Upper Back, Rhomboids, Traps
Single-Arm Bench Supported Dumbbell Rows @single-arm-bench-supported-db-rows
Cable Face Pulls @cable-face-pulls
Chest Supported Dumbbell Rows
Chest Supported Row Machine
## Lower Back | Lower Back, Erector Spinae, Hamstrings
Barbell RDL @bb-rdl
Dumbbell RDL @db-rdl
Trap Bar RDL
Back Extension Machine
Back Extensions @back-hyperextension
Barbell Deadlift @bb-deadlift
## Glutes | Glutes
Barbell RDL @bb-rdl
Dumbbell RDL @db-rdl
Trap Bar RDL
Dumbbell Bulgarian Split Squat @db-bulgarian-split-squat
Dumbbell Glute Bridges
Smith Machine Reverse Lunges
## Quads | Quads
Barbell Back Squat @bb-back-squat
Dumbbell Front Squat
Dumbbell Bulgarian Split Squat @db-bulgarian-split-squat
Leg Press @leg-press
Dumbbell Step-ups
Leg Extensions @leg-extensions
Hack Squat
## Hamstrings | Hamstrings
Barbell RDL @bb-rdl
Dumbbell RDL @db-rdl
Trap Bar RDL
Nordic Hamstring Curl
Hamstring Curls @leg-curls
## Calves | Calves
Calf Press Machine
Calf Extension Machine
Smith Machine Calf Raises
Single-Leg Box Elevated Calf Raises
## Hip Flexors | Hip Flexors
Hanging Leg Raises @hanging-bar-leg-raises
Dead Bugs @dead-bugs
Cable Hip Flexor Pulls
## Adductors | Adductors
Hip Adductor Machine
Copenhagen Plank
Dumbbell Lateral Lunges
Lateral Slider Lunges
Kettlebell Kneeling Adductor Side Lunges
## Abductors | Abductors, Glutes
Lateral Banded Walks
Banded Monster Walks
Abductor Machine
Standing Banded Lateral Leg Lifts
Lying Banded Lateral Leg Lifts
## Upper Abs | Abs, Core
Weighted Dumbbell Crunches
Decline Crunches
Ab Machine
## Lower Abs | Abs, Core
Hanging Leg Raises @hanging-bar-leg-raises
Reverse Crunches
Ab Machine
Dragon Flags
Hollow Holds @hollow-holds
## Obliques | Obliques, Core
Bicycle Crunches @bicycle-crunches
Hanging Leg Raise Across
Pallof Press @pallof-press
Ab Machine

# Strength
## Vertical Push | Shoulders, Triceps
Seated Barbell Shoulder Press
Seated Barbell Pin Shoulder Press
Seated Dumbbell Shoulder Press @db-shoulder-press
Standing Barbell Shoulder Press
Standing Barbell Pin Shoulder Press
Machine Pin Shoulder Press
## Horizontal Push | Chest, Triceps, Shoulders
Dumbbell Floor Press
Flat Dumbbell Bench Press @db-flat-bench-press
Flat Barbell Bench Press @bb-flat-bench-press
Barbell Floor Press
Barbell Pin Bench Press
Weighted Push-ups
Machine Pin Bench Press
## Diagonal Push | Upper Chest, Shoulders, Triceps
Single-Arm Landmine Standing Press
Incline Dumbbell Bench Press @db-incline-bench-press
Half Kneeling Single-Arm Landmine Press
Rotational Standing Landmine Press @landmine-rotational-press
## Vertical Pull | Lats, Biceps
Pull-ups @pullups
Chin-ups @chin-ups
Neutral Grip Pull-ups
TRX Rows
## Horizontal Pull | Upper Back, Lats, Rhomboids
Landmine Row
Single-Arm Bench Supported Dumbbell Rows @single-arm-bench-supported-db-rows
Barbell Pendlay Rows
## Squat | Quads, Glutes
Barbell Back Squat @bb-back-squat
Barbell Box Squat @bb-box-squat
Barbell Pin Back Squat
## Hinge | Hamstrings, Glutes, Lower Back
Barbell RDL @bb-rdl
Barbell Deadlift @bb-deadlift
Dumbbell RDL @db-rdl
Trap Bar Deadlift
Trap Bar RDL
## Single-Leg Squat | Quads, Glutes
Pistol Squat
Dumbbell Bulgarian Split Squat @db-bulgarian-split-squat
Dumbbell Lunges @lunges
Barbell Reverse Lunges
## Single-Leg Hinge | Hamstrings, Glutes
Split Stance Dumbbell RDL
Single-Leg Dumbbell RDL
## Lateral | Adductors, Glutes, Quads
Dumbbell Lateral Lunges
Lateral Paper Plate Slides
Rotational Lateral Lunges
## Hip Extension | Glutes, Hamstrings
Barbell Hip Thrusts @hip-thrusts
Single-Leg Dumbbell Glute Bridges
Barbell RDL @bb-rdl
Barbell Deadlift @bb-deadlift
## Knee Flexion | Hamstrings
Nordic Hamstring Curl
Seated Leg Curl
Sissy Squats
Prone Banded Leg Curl
## Core Anti-Rotation | Core, Obliques
Pallof Press @pallof-press
Suitcase Carries
Farmers Carries @farmers-walk
Kneeling Plate Halos
Kneeling Kettlebell Around the Worlds
Bear Crawl Rows @bear-crawl-rows
Renegade Rows with Push-up
Kettlebell Lateral Drags in Plank
## Core Anti-Extension | Abs, Core
Ab Wheel Rollouts @ab-wheel-rollouts
Plank @planks
Hollow Holds @hollow-holds
Bear Crawls with Ball Throw and Catch
Stability Ball Plank Circles
Ab Wheel Rollout Bear Crawls
Stability Ball Rollouts
## Core Anti-Lateral Flexion | Obliques, Core
Farmers Carries @farmers-walk
Side Plank @side-plank
Side Plank Hip Dips
Side Plank Leg Lifts
Copenhagen Plank
## Core Trunk Flexion | Abs, Core
Decline Crunches
Med Ball Crunch Throws
Standing Med Ball Slams @mb-slams
Kneeling Med Ball Slams
Med Ball Swiss Ball Sit-up Throws
## Core Trunk Rotation | Obliques, Core
Standing Cable Rotations
Kneeling Cable Rotations
Kneeling Dumbbell Rotational Chops
Landmine Rotations
Split Stance Med Ball Rotational Slams
Med Ball Russian Twist Slams
Bench/Swiss Ball Supported Bridge Rotations
## Hamstring Eccentric | Hamstrings
Nordic Hamstring Curl
Tempo RDL
Slider Leg Curls
Stability Ball Hamstring Curls
Stability Ball Hamstring Kicks
Banded Hamstring Kicks
## Quad Eccentric | Quads
Tempo Squats
Tempo Step-downs
Tempo Leg Extensions
TRX Reverse Lunge Sliders
Kettlebell Drop Lunges
Reverse Nordics
## Support Grip | Forearms
Farmers Carries @farmers-walk
Towel Pull-ups
Plate Flips
Reverse Rows with Changing Grip Crawls
## Grip Endurance | Forearms
Plate Holds
Dead Hangs @dead-hang
Towel Dead Hangs
## Wrist Flexion | Forearms
Dumbbell Wrist Curls @db-wrist-curls
Grip Roll-ups
## Single-Leg Balance | Glutes, Quads, Hamstrings
Single-Leg Dumbbell RDL
Single-Leg Lateral Step-downs

# Power
## Horizontal Push | Chest, Triceps, Shoulders
Banded Explosive Plyo Push-ups
Single-Arm Dumbbell Bench Press
Flat Dumbbell Bench Press @db-flat-bench-press
Flat Barbell Bench Press @bb-flat-bench-press
Barbell Pin Bench Press
Explosive Chest Press
Single-Arm Explosive Chest Press
Lying Med Ball Passes Up
Barbell Bench Press Throws and Catches
## Horizontal Pull | Upper Back, Lats
Inverted Rows @inverted-row
Single-Arm Bench Supported Dumbbell Rows @single-arm-bench-supported-db-rows
Barbell Pendlay Rows
Landmine Row
## Vertical Push | Shoulders, Triceps
Barbell Push Press @push-press
Barbell Pin Press
Med Ball Shoulder Throws
## Vertical Pull | Lats, Traps
Pull-ups @pullups
Chin-ups @chin-ups
Neutral Grip Pull-ups
High Pulls @high-pull
## Rotational Push | Chest, Shoulders, Obliques
Rotational Standing Landmine Press @landmine-rotational-press
Med Ball Rotational Chest Pass
Med Ball Rotational Scoop Toss
Alternating Landmine Thrusters
## Rotational Pull | Lats, Obliques
Single-Arm Cable Lat Pulldowns
Rotational Med Ball Slams
## Squat | Quads, Glutes
Barbell Back Squat @bb-back-squat
Barbell Pin Back Squat
Barbell Box Squat @bb-box-squat
Hack Squat
## Hip Extension | Glutes, Hamstrings
Single-Leg Glute Bridges
Kettlebell Swings @kettlebell-swing
Explosive RDLs
Trap Bar Deadlift
Supine Banded Leg Snaps
Band Resisted Single-Leg Glute Bridges
Band Resisted Broad Jumps
## Single-Leg | Quads, Glutes
Step-ups with Knee Drive
Lateral Step-up Jumps
Barbell Pin Split Squat
Barbell Reverse Lunges
Bulgarian Split Squat Jump Med Ball Slams
Single-Leg RDL Med Ball Slams
Band Resisted Skater Jumps
## Lower Body Rotational | Glutes, Obliques
Bench Rotational Step-up Hang Cleans with Plate
Landmine RDL to Rotational Press
Step Behind Rotational Med Ball Toss
Banded Rotational Hip Turns
## Power Jumps | Quads, Glutes, Calves
Dumbbell Squat Jumps
Dumbbell RDL Jumps
Dumbbell Bulgarian Split Squat Jumps
Trap Bar Deadlift Jumps @trap-bar-jump
Med Ball Granny Overhead Passes with a Jump
## Olympic Lifts | Full Body, Traps, Glutes
Clean @clean
High Pulls @high-pull
Power Clean
Hang Power Clean
## Vertical Jumps | Quads, Glutes, Calves
Box Jumps
Single-Leg Box Jumps
Depth Drop to Vertical Jump
Seated Vertical Jumps
Single-Leg Seated Vertical Jumps
Depth Drops @depth-drop
Max Vertical Jumps @vertical-jump
Max Single-Leg Vertical Jumps
Max Banded Vertical Jumps
Max Banded Single-Leg Vertical Jumps
## Horizontal Jumps | Glutes, Hamstrings, Quads
Broad Jumps @broad-jump
Triple Broad Jumps
Single-Leg Broad Jumps
Single-Leg Bounds @single-leg-bounds
Seated Broad Jumps
## Lateral Jumps | Glutes, Adductors, Quads
Skater Jumps for Speed
Skater Jumps for Distance
Skater Jump to Single-Leg Hop Front and Back
Depth Drop to Skater Jump for Speed
Depth Drop to Skater Jump for Distance
Lateral Hurdle Hops
Skater Jump to Single-Leg Vertical Jump
## Rotational Jumps | Glutes, Obliques
Hurdle Hop to Rotational Box Jump
Rotational Broad Jumps
## Band Resisted Jumps & Runs | Quads, Glutes, Hip Flexors
Band Resisted Broad Jumps
Band Resisted Skater Jumps
Band Resisted High Knees

# Stability
## Rotator Cuff (IR/ER) | Rotator Cuff, Shoulders
Banded External Rotation @band-external-rotation
Banded Internal Rotation @band-internal-rotation
Band Pull Aparts @band-pull-aparts
Dumbbell External Rotations
Dumbbell Internal Rotations
Kettlebell External Rotation Trunk Rotations
## Overhead Shoulder | Shoulders, Rotator Cuff
Half Kneeling Overhead Dumbbell Press
Wall Slides @scapular-wall-slides
Kettlebell Overhead Carries
Kettlebell Arnold Press
Kettlebell Bottoms Up Carries
## Closed Chain Shoulder | Shoulders, Core
Plank Shoulder Taps @shoulder-taps
Bear Crawl Banded Lateral Walks
Stability Ball Push-up
Bear Crawl Rows @bear-crawl-rows
Renegade Rows with Push-up
Kettlebell Lateral Drags in Plank
Ab Wheel Rollout Push-ups
## Reactive Shoulder | Shoulders, Core
Stability Ball Plank with Disturbances
Med Ball Catch and Throws
Med Ball Catch and Slam
## Wrist & Elbow | Forearms, Biceps
Slow Eccentric Push-ups @eccentric-pushups
Slow Eccentric Hammer Curls
Banded Wrist Twist
Banded Iron Mans
Banded Side Chops
## Scapular Retraction | Upper Back, Rhomboids, Rear Delts
Banded Rows with 3 Second Hold
Cable Face Pulls @cable-face-pulls
Slow Inverted Rows
Prone Y Raises @prone-y-raise
## Scapular Protraction | Shoulders, Chest
Wall Slides @scapular-wall-slides
Bear Crawls @bear-crawl
Scapular Push-ups
Crab Walks @crab-walk
Reverse Crab Walks
## Hip Abductors | Abductors, Glutes
Lateral Banded Walks
Banded Monster Walks
Slow Step-downs
Hip Airplanes
Banded X Walks
Lateral Banded Bear Crawls
## Hip Adductors | Adductors
Copenhagen Plank
Side Lying Leg Raises
Bench Internal Leg Lifts
## Knee | Quads, Glutes
Wall Sits @wall-sit
Step-downs
Single-Leg Banded Terminal Knee Extensions
Bosu Ball Pistol Squats
Banded Tempo Squats
Spanish Squat
## Ankle | Calves
Box Elevated Calf Raises
Tibialis Raises
Bosu Ball Hamstring Curl

# Mobility
## Shoulder Flexion | Shoulders, Lats
Serratus Wall Reaches
Wall Slides @scapular-wall-slides
Banded Over and Outs Behind Back
Bench Prayer Stretch @prayer-stretch
## Shoulder IR/ER | Rotator Cuff, Shoulders
Sleeper Stretch @sleeper-stretch
90/90 Wall Rotations
Banded School Buses
Banded Internal Rotation @band-internal-rotation
Mini Med Ball Wall Circles
## Pec Flexibility | Chest
Wall Angels @wall-angels
Pec Stretch @pec-stretch
## Posterior Shoulder Capsule | Rear Delts, Rotator Cuff
Sleeper Stretch @sleeper-stretch
Banded Posterior Glide
Quadruped Rocking
## Scapular | Upper Back, Traps
Scapular Push-ups
Scapular Pull-ups
Dumbbell Y Raises @y-raises
Prone Y Raises @prone-y-raise
Banded Wall Slides
## Wrist & Elbow | Forearms
Quadruped Wrist Rocks
Forearm Pronation and Supination
## Thoracic Rotation | Upper Back, Obliques
Quadruped T-Spine Rotations @t-spine-rotations
Half Kneeling Banded Rotations
Thread the Needle
Kneeling PVC Pipe Open and Close the Gate
Pretzel Stretch
Bow and Arrows
Half Kneeling PVC Pipe Overhead Rotations
## Thoracic Extension | Upper Back, Lower Back
Cat-Cow @cat-cow-stretch
Cobra Lifts
Bench/Roller Thoracic Extensions
Inchworms
Floor Angels
PVC Pipe Superman Lifts
## Hip IR/ER | Glutes, Hip Flexors
90/90 Hip Switches @90-90s-hip-drill
Hip Airplanes
Quadruped Hip CARs
Open and Close the Gate Sliders
Kneeling PVC Pipe Open and Close the Gate
Kneeling Lateral Sliders
Pigeon Stretch @pigeon-pose
90/90 Hip Oblique Stretch
90/90s with Fold
## Hip Flexion | Hip Flexors, Hamstrings
Leg Lifts @leg-raises
Hanging Leg Raises @hanging-bar-leg-raises
Open and Close the Gate
Kneeling PVC Pipe Open and Close the Gate
Banded Knee Drives
## Hip Extension | Hip Flexors, Glutes
Half Kneeling Hip Flexor Stretch @hip-flexor-stretch
Glute Bridge Holds
Prone Hip Extension Lifts
Quadruped Leg Whip
## Ankle Dorsiflexion | Calves
Deep Squat Hold (Heels Down)
Tibialis Raises
Weighted Ankle Rocks
Knee to Wall Dorsiflexion Stretch

# Isometrics
## Lower Body | Quads, Glutes, Calves
Dumbbell Bulgarian Split Squat Hold
Dumbbell Split Squat Hold
Single-Leg Calf Raise Hold
Single-Leg Glute Bridge Hold
Wall Sits @wall-sit
Wall Knee Drive Iso Hold
## Upper Body | Chest, Shoulders, Rotator Cuff
External Rotation Iso Hold
Internal Rotation Iso Hold
Bench Press Heavy Holds
Shoulder Press Heavy Holds
`;

export type LibraryCategory = { key: string; name: string; muscles: string[]; exerciseIds: string[] };
export type LibraryGroup = { name: string; emoji: string; categories: LibraryCategory[] };

const GROUP_EMOJI: Record<string, string> = {
  Hypertrophy: '💪',
  Strength: '🏋️',
  Power: '⚡',
  Stability: '⚖️',
  Mobility: '🧘',
  Isometrics: '⏸️',
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function build() {
  const groups: LibraryGroup[] = [];
  const created = new Map<string, Exercise>(); // new exercises, by id
  const tagsById = new Map<string, string[]>(); // "Upper Chest (Hypertrophy)" labels
  const musclesById = new Map<string, Set<string>>();

  let group: LibraryGroup | null = null;
  let category: LibraryCategory | null = null;

  for (const rawLine of RAW.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('## ')) {
      const [name, muscles = ''] = line.slice(3).split('|').map((s) => s.trim());
      category = {
        key: `${slug(group!.name)}/${slug(name)}`,
        name,
        muscles: muscles.split(',').map((m) => m.trim()).filter(Boolean),
        exerciseIds: [],
      };
      group!.categories.push(category);
      continue;
    }
    if (line.startsWith('# ')) {
      const name = line.slice(2).trim();
      group = { name, emoji: GROUP_EMOJI[name] || '🏷️', categories: [] };
      groups.push(group);
      continue;
    }

    const [name, catalogId] = line.split('@').map((s) => s.trim());
    const id = catalogId || `lib-${slug(name)}`;
    if (!category!.exerciseIds.includes(id)) category!.exerciseIds.push(id);

    const tag = `${category!.name} (${group!.name})`;
    tagsById.set(id, [...(tagsById.get(id) || []), tag].filter((t, i, a) => a.indexOf(t) === i));
    const muscles = musclesById.get(id) || new Set<string>();
    category!.muscles.forEach((m) => muscles.add(m));
    musclesById.set(id, muscles);

    if (!catalogId && !created.has(id)) {
      created.set(id, {
        id,
        name,
        category: guessExerciseCategory(name),
        description: '',
        instructions: [],
        difficulty: 'intermediate',
        equipment: guessEquipment(name),
        muscleGroups: [],
      });
    }
  }

  // Fill in what each new exercise trains and where it's listed
  for (const ex of created.values()) {
    ex.muscleGroups = Array.from(musclesById.get(ex.id) || []);
    ex.description = `Listed under ${(tagsById.get(ex.id) || []).join(', ')}.`;
  }

  return { groups, newExercises: Array.from(created.values()), tagsById };
}

const built = build();

/** Training goals and their categories, in display order. */
export const LIBRARY_GROUPS: LibraryGroup[] = built.groups;

/** Exercises from the library that weren't already in the catalog. */
export const libraryExercises: Exercise[] = built.newExercises;

/** Categories an exercise is listed under, e.g. ["Upper Chest (Hypertrophy)"]. */
export function getExerciseTags(exerciseId: string): string[] {
  return built.tagsById.get(exerciseId) || [];
}
