export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number; // index of correct answer
  explanation: string;
  category: 'nutrition' | 'workouts' | 'recovery' | 'cardio' | 'strength' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface JeopardyQuestion {
  id: string;
  category: 'nutrition' | 'cardio' | 'strength' | 'recovery' | 'anatomy' | 'sports';
  amount: number;
  question: string;
  answer: string;
}

export interface BingoExercise {
  id: string;
  name: string;
  reps: string;
}

export const triviaQuestions: TriviaQuestion[] = [
  // NUTRITION - EASY
  {
    id: 'tri1',
    question: 'How many calories are in one gram of protein?',
    options: ['2 calories', '4 calories', '7 calories', '9 calories'],
    correct: 1,
    explanation: 'Protein has 4 calories per gram - crucial for muscle building! Fats have 9 cal/g, carbs have 4. Your body uses more energy to digest protein (thermic effect), making it excellent for weight loss and muscle development. Higher protein intake boosts metabolism.',
    category: 'nutrition',
    difficulty: 'easy',
  },
  {
    id: 'tri2',
    question: 'What is the most important macronutrient for muscle building?',
    options: ['Carbohydrates', 'Protein', 'Fat', 'Fiber'],
    correct: 1,
    explanation: 'Protein provides 9 essential amino acids your body cannot make. When you train, micro-tears form in muscle fibers. Protein repairs these tears, making muscles larger and stronger. Without adequate protein, your muscles cannot recover or grow! Aim for 0.8-1g per pound of body weight daily.',
    category: 'nutrition',
    difficulty: 'easy',
  },
  {
    id: 'tri3',
    question: 'How many glasses of water should you drink daily?',
    options: ['2 glasses', '5 glasses', '8 glasses', '12 glasses'],
    correct: 2,
    explanation: 'The common recommendation is 8 glasses (about 2 liters) per day.',
    category: 'nutrition',
    difficulty: 'easy',
  },
  {
    id: 'tri4',
    question: 'Which food is highest in protein?',
    options: ['Banana', 'Chicken breast', 'Rice', 'Broccoli'],
    correct: 1,
    explanation: 'Chicken breast has about 31g protein per 100g, way ahead of other options.',
    category: 'nutrition',
    difficulty: 'easy',
  },
  {
    id: 'tri5',
    question: 'What percentage of muscle is water?',
    options: ['50%', '60%', '75%', '85%'],
    correct: 2,
    explanation: 'Muscles are 75% water. Stay hydrated during workouts!',
    category: 'nutrition',
    difficulty: 'easy',
  },

  // NUTRITION - MEDIUM
  {
    id: 'tri6',
    question: 'What\'s the recommended protein intake per pound of body weight?',
    options: ['0.3g', '0.8-1g', '2g', '3g'],
    correct: 1,
    explanation: 'Aim for 0.8-1g of protein per pound of body weight daily for muscle building.',
    category: 'nutrition',
    difficulty: 'medium',
  },
  {
    id: 'tri7',
    question: 'Which is a complex carbohydrate?',
    options: ['White sugar', 'Honey', 'Brown rice', 'Soda'],
    correct: 2,
    explanation: 'Brown rice is a complex carb that digests slowly and provides sustained energy.',
    category: 'nutrition',
    difficulty: 'medium',
  },
  {
    id: 'tri8',
    question: 'What\'s the ideal meal timing before a workout?',
    options: ['Immediately before', '30 minutes before', '1-2 hours before', '4+ hours before'],
    correct: 2,
    explanation: '1-2 hours before is ideal to give time for digestion while fueling your workout.',
    category: 'nutrition',
    difficulty: 'medium',
  },
  {
    id: 'tri9',
    question: 'How many calories are in one pound of fat?',
    options: ['2000', '2500', '3500', '4500'],
    correct: 2,
    explanation: '3500 calories equals one pound of fat. A 500 calorie deficit = 1 lb loss per week.',
    category: 'nutrition',
    difficulty: 'medium',
  },
  {
    id: 'tri10',
    question: 'What\'s the best post-workout meal?',
    options: ['Only protein shake', 'Protein + carbs', 'Salad only', 'No meal needed'],
    correct: 1,
    explanation: 'Protein + carbs repair muscles and replenish glycogen within 30-60 minutes post-workout.',
    category: 'nutrition',
    difficulty: 'medium',
  },

  // NUTRITION - HARD
  {
    id: 'tri11',
    question: 'What percentage of fitness results comes from diet vs exercise?',
    options: ['50/50', '60/40', '70/30', '80/20'],
    correct: 3,
    explanation: '80% of fitness results come from NUTRITION! Exercise tears down muscle; food builds it back. You cannot out-train a bad diet. 1 hour of exercise burns ~500 calories, but one pizza is 2000+ calories. Focus: 80% on nutrition (calories, protein, whole foods) and 20% on training. Diet is the foundation.',
    category: 'nutrition',
    difficulty: 'hard',
  },
  {
    id: 'tri12',
    question: 'What is micronutrient timing?',
    options: [
      'Eating small snacks',
      'Optimizing when you consume vitamins/minerals',
      'Eating 6 meals daily',
      'Fasting for 24 hours',
    ],
    correct: 1,
    explanation: 'Micronutrient timing refers to strategically consuming vitamins and minerals around workouts.',
    category: 'nutrition',
    difficulty: 'hard',
  },

  // WORKOUTS - EASY
  {
    id: 'tri13',
    question: 'How many muscles does a squat work?',
    options: ['10', '50', '100', '256'],
    correct: 3,
    explanation: 'Squats engage 256 muscles simultaneously! Primary movers: quads, glutes, hamstrings. Stabilizers: core, calves, lower back. This is why squats are the "king" exercise - they trigger the most growth hormone, burn the most calories, and build functional real-world strength. Master the squat for life-changing results.',
    category: 'workouts',
    difficulty: 'easy',
  },
  {
    id: 'tri14',
    question: 'What\'s the best core exercise?',
    options: ['Sit-ups', 'Crunches', 'Planks', 'Leg raises'],
    correct: 2,
    explanation: 'Planks strengthen core, improve posture, and prevent back pain effectively.',
    category: 'workouts',
    difficulty: 'easy',
  },
  {
    id: 'tri15',
    question: 'Which type of stretching is best BEFORE exercise?',
    options: ['Static stretching', 'Dynamic stretching', 'PNF stretching', 'Passive stretching'],
    correct: 1,
    explanation: 'Dynamic stretching warms up muscles. Save static stretching for after workouts.',
    category: 'workouts',
    difficulty: 'easy',
  },
  {
    id: 'tri16',
    question: 'How long is a typical workout for beginners?',
    options: ['15 minutes', '30-45 minutes', '2 hours', '3+ hours'],
    correct: 1,
    explanation: '30-45 minutes is ideal for beginners to build consistency without overtraining.',
    category: 'workouts',
    difficulty: 'easy',
  },

  // WORKOUTS - MEDIUM
  {
    id: 'tri17',
    question: 'What does HIIT stand for?',
    options: [
      'Heavy Interval Intensive Training',
      'High Intensity Interval Training',
      'High Impact Interval Training',
      'Heavy Internal Interval Training',
    ],
    correct: 1,
    explanation: 'HIIT alternates intense bursts with recovery periods for maximum efficiency.',
    category: 'workouts',
    difficulty: 'medium',
  },
  {
    id: 'tri18',
    question: 'How many sets and reps are ideal for muscle growth?',
    options: ['1-3 sets of 20+ reps', '3-4 sets of 6-12 reps', '5+ sets of 3 reps', '2 sets of 50 reps'],
    correct: 1,
    explanation: '3-4 sets of 6-12 reps with moderate-heavy weight is optimal for hypertrophy.',
    category: 'workouts',
    difficulty: 'medium',
  },
  {
    id: 'tri19',
    question: 'What\'s the principle of progressive overload?',
    options: [
      'Doing the same workout forever',
      'Gradually increasing difficulty to challenge muscles',
      'Taking longer rest periods',
      'Decreasing your weights',
    ],
    correct: 1,
    explanation: 'Progressive overload is THE most important principle! Muscles adapt in 2-3 weeks. If you use 100 lbs forever, growth stops. Strategies: +5 lbs weekly, +1 rep per set, add a set, reduce rest periods, improve form. Track every workout. Small consistent increases compound into massive strength gains over months and years.',
    category: 'workouts',
    difficulty: 'medium',
  },
  {
    id: 'tri20',
    question: 'Which is more important for fitness?',
    options: [
      'Intensity once a week',
      'Consistency over time',
      'Only cardio',
      'Only weightlifting',
    ],
    correct: 1,
    explanation: 'Consistency beats intensity. Small daily wins compound into major results.',
    category: 'workouts',
    difficulty: 'medium',
  },

  // WORKOUTS - HARD
  {
    id: 'tri21',
    question: 'What\'s the optimal rest period between sets for strength?',
    options: ['30 seconds', '1 minute', '2-3 minutes', '5+ minutes'],
    correct: 2,
    explanation: '2-3 minutes allows ATP-PC system recovery for maximum strength gains.',
    category: 'workouts',
    difficulty: 'hard',
  },
  {
    id: 'tri22',
    question: 'How many times per week should you train each muscle group?',
    options: ['Once per week', '2-3 times per week', 'Daily', 'Depends on volume'],
    correct: 3,
    explanation: 'Research suggests 2-3x per week per muscle for optimal growth with proper recovery.',
    category: 'workouts',
    difficulty: 'hard',
  },

  // RECOVERY - EASY
  {
    id: 'tri23',
    question: 'How many hours of sleep should you get for muscle recovery?',
    options: ['5-6 hours', '7-9 hours', '10-12 hours', '12+ hours'],
    correct: 1,
    explanation: 'Aim for 7-9 hours nightly. During deep sleep (stages 3-4), your body releases Human Growth Hormone (HGH) - essential for muscle repair and growth. Sleep deprivation reduces HGH by 75%, increases cortisol (stress hormone), and decreases testosterone. Poor sleep = poor gains. Sleep IS training recovery.',
    category: 'recovery',
    difficulty: 'easy',
  },
  {
    id: 'tri24',
    question: 'What does DOMS stand for?',
    options: [
      'Delayed Onset Muscle Soreness',
      'Day One Muscle Strain',
      'Direct Overload Muscle Stress',
      'Deep Onset Muscle Stress',
    ],
    correct: 0,
    explanation: 'DOMS is the soreness you feel 24-48 hours after intense workouts - it\'s normal!',
    category: 'recovery',
    difficulty: 'easy',
  },
  {
    id: 'tri25',
    question: 'Is muscle soreness a sign of a good workout?',
    options: [
      'Always means good workout',
      'Sometimes, but not required',
      'Never a good sign',
      'Only for beginners',
    ],
    correct: 1,
    explanation: 'Soreness indicates muscle damage and adaptation, but isn\'t necessary for progress.',
    category: 'recovery',
    difficulty: 'easy',
  },

  // RECOVERY - MEDIUM
  {
    id: 'tri26',
    question: 'How long can your metabolism stay elevated after intense exercise?',
    options: ['2 hours', '6 hours', '12 hours', '24-48 hours'],
    correct: 3,
    explanation: 'EPOC (Excess Post-Exercise Oxygen Consumption) = metabolism stays elevated 24-48 hours! Your body burns extra calories for muscle repair, hormone restoration, ATP replenishment, lactic acid clearance. HIIT and strength training create the biggest EPOC. This is FREE calorie burn after your workout ends - this is why training is so effective!',
    category: 'recovery',
    difficulty: 'medium',
  },
  {
    id: 'tri27',
    question: 'What\'s the best way to recover from a workout?',
    options: [
      'Do another intense workout',
      'Complete rest',
      'Light activity + protein + sleep',
      'Ice baths only',
    ],
    correct: 2,
    explanation: 'Active recovery (light movement) + nutrition + sleep provides optimal recovery.',
    category: 'recovery',
    difficulty: 'medium',
  },

  // RECOVERY - HARD
  {
    id: 'tri28',
    question: 'What\'s the difference between active and passive recovery?',
    options: [
      'Active uses equipment, passive doesn\'t',
      'Active = light movement, passive = complete rest',
      'Both are the same thing',
      'Active is better always',
    ],
    correct: 1,
    explanation: 'Active recovery = light activity promoting blood flow; passive = complete rest.',
    category: 'recovery',
    difficulty: 'hard',
  },

  // CARDIO - EASY
  {
    id: 'tri29',
    question: 'How long can a 20-minute walk boost focus?',
    options: ['30 minutes', '1 hour', '2 hours', '4 hours'],
    correct: 3,
    explanation: 'A 20-minute walk can boost focus and creativity for up to 4 hours!',
    category: 'cardio',
    difficulty: 'easy',
  },
  {
    id: 'tri30',
    question: 'Is walking considered cardio?',
    options: ['No, not intense enough', 'Only for elderly people', 'Yes, it\'s low-intensity cardio', 'Only if you run'],
    correct: 2,
    explanation: 'Walking is low-intensity cardio with great health benefits and low injury risk.',
    category: 'cardio',
    difficulty: 'easy',
  },

  // CARDIO - MEDIUM
  {
    id: 'tri31',
    question: 'What\'s the optimal heart rate zone for fat burning?',
    options: ['50-60% of max', '60-70% of max', '80-90% of max', '90%+ of max'],
    correct: 1,
    explanation: '60-70% of max heart rate (aerobic zone) = where your body burns primarily fat! Calculate: (220 - age) × 0.60 to 0.70. Example: 30-year-old = 114-133 bpm. Slow, steady cardio (walking, jogging) in this zone builds aerobic capacity, burns fat efficiently, and is sustainable for long durations.',
    category: 'cardio',
    difficulty: 'medium',
  },
  {
    id: 'tri32',
    question: 'How many calories can walking 10,000 steps burn?',
    options: ['100-200 calories', '300 calories', '500+ calories', '1000 calories'],
    correct: 2,
    explanation: '10,000 steps typically burns 300-500 calories depending on weight and pace.',
    category: 'cardio',
    difficulty: 'medium',
  },

  // CARDIO - HARD
  {
    id: 'tri33',
    question: 'What\'s LISS cardio?',
    options: [
      'Low Intensity Steady State cardio',
      'Long Interval Short Sprints',
      'Light Intensity Super Sets',
      'Low Impact System Strength',
    ],
    correct: 0,
    explanation: 'LISS = steady, low-intensity cardio (walking, light jogging) for long periods.',
    category: 'cardio',
    difficulty: 'hard',
  },

  // STRENGTH - EASY
  {
    id: 'tri34',
    question: 'What\'s a major benefit of strength training?',
    options: [
      'Faster muscle loss with age',
      'Slows muscle loss that comes with age',
      'Increases joint pain',
      'Reduces flexibility',
    ],
    correct: 1,
    explanation: 'We lose 3-8% of muscle per decade after age 30 (sarcopenia). Strength training REVERSES this! 2-3x weekly resistance training maintains and builds muscle at ANY age. Bonus: stronger bones, better metabolism, improved balance, fall prevention, increased longevity. It\'s never too late to start lifting!',
    category: 'strength',
    difficulty: 'easy',
  },
  {
    id: 'tri35',
    question: 'What\'s the best warm-up for strength training?',
    options: [
      'Skip it, go straight to lifting',
      'Light cardio + dynamic stretching',
      'Just static stretching',
      'Ice baths',
    ],
    correct: 1,
    explanation: 'Light cardio + dynamic stretching increases blood flow and prepares muscles.',
    category: 'strength',
    difficulty: 'easy',
  },

  // STRENGTH - MEDIUM
  {
    id: 'tri36',
    question: 'What\'s the difference between strength and hypertrophy training?',
    options: [
      'They\'re the same thing',
      'Strength = heavy weight/low reps, Hypertrophy = moderate weight/higher reps',
      'Only hypertrophy builds muscle',
      'Strength training doesn\'t build muscle',
    ],
    correct: 1,
    explanation: 'Strength = 1-5 reps with heavy weight; Hypertrophy = 6-12 reps with moderate weight.',
    category: 'strength',
    difficulty: 'medium',
  },

  // STRENGTH - HARD
  {
    id: 'tri37',
    question: 'What\'s the concept of1RM (one rep max)?',
    options: [
      'Maximum calories in one meal',
      'Maximum weight you can lift for one rep',
      'Repetitions per minute',
      'Rest minutes between sets',
    ],
    correct: 1,
    explanation: '1RM = the maximum weight you can lift for a single rep with good form.',
    category: 'strength',
    difficulty: 'hard',
  },

  // GENERAL - EASY
  {
    id: 'tri38',
    question: 'How often should you exercise per week?',
    options: ['1 time', '2-3 times', '4-5 times', '7 times'],
    correct: 2,
    explanation: '4-5 days per week is ideal for most people balancing fitness with recovery.',
    category: 'general',
    difficulty: 'easy',
  },
  {
    id: 'tri39',
    question: 'What\'s the best time to exercise?',
    options: ['Only morning', 'Only evening', 'Whenever you\'ll be consistent', 'Never after 5pm'],
    correct: 2,
    explanation: 'The best time is whenever you\'ll stick to it consistently.',
    category: 'general',
    difficulty: 'easy',
  },

  // GENERAL - MEDIUM
  {
    id: 'tri40',
    question: 'How long does it take to see muscle growth results?',
    options: ['1-2 weeks', '4-8 weeks', '12+ weeks', 'Never'],
    correct: 1,
    explanation: 'Visible muscle growth takes 4-8 weeks with consistent training + nutrition + progressive overload. At 8 weeks, most can gain 2-3 lbs of muscle. Strength gains appear in 1-2 weeks (CNS adaptation). At 12 weeks = 5-8 lbs muscle. Key: don\'t compare weekly; trust the process over months and years.',
    category: 'general',
    difficulty: 'medium',
  },
  {
    id: 'tri41',
    question: 'What\'s the most important factor in fitness success?',
    options: [
      'Genetics',
      'Expensive supplements',
      'Consistency and habit',
      'Working out hard once',
    ],
    correct: 2,
    explanation: 'Consistency BEATS genetics, supplements, and intensity combined! One perfect workout accomplishes nothing. Four decent workouts per week for a year transforms your body. Aim for 80/20: 80% from consistent effort on fundamentals (eat protein, lift weights, sleep, show up), 20% from optimization.',
    category: 'general',
    difficulty: 'medium',
  },

  // GENERAL - HARD
  {
    id: 'tri42',
    question: 'What\'s the basal metabolic rate (BMR)?',
    options: [
      'Calories burned during exercise',
      'Calories burned at rest',
      'Maximum calories per day',
      'Minimum calories to survive',
    ],
    correct: 1,
    explanation: 'BMR = calories burned at complete rest for breathing, circulation, digestion, brain function. Accounts for 60-75% of daily calorie burn! Muscle increases BMR: 1 lb of muscle burns ~6 cal/day extra. Building muscle through strength training increases your baseline metabolism - you burn more calories doing NOTHING!',
    category: 'general',
    difficulty: 'hard',
  },
  {
    id: 'tri43',
    question: 'What\'s the thermic effect of food?',
    options: [
      'Heat you feel after eating',
      'Calories burned digesting food',
      'Temperature of food',
      'Flavor intensity',
    ],
    correct: 1,
    explanation: 'TEF = energy (calories) your body burns digesting food (~10% of intake). Protein has highest TEF (~25%) - eat 100g protein, burn 25 calories just digesting it! Carbs ~10%, fat ~5%. This is why high-protein diets boost metabolism. Example: 2000 cal high-protein diet burns 200 extra calories. Compound this over months!',
    category: 'general',
    difficulty: 'hard',
  },
];

export const jeopardyQuestions: JeopardyQuestion[] = [
  // NUTRITION CATEGORY
  { id: 'jeo_nut_100', category: 'nutrition', amount: 100, question: 'How many calories are in one gram of protein?', answer: '4 calories' },
  { id: 'jeo_nut_200', category: 'nutrition', amount: 200, question: 'What macronutrient has 9 calories per gram?', answer: 'Fat' },
  { id: 'jeo_nut_300', category: 'nutrition', amount: 300, question: 'What is the recommended daily protein intake per pound of body weight for muscle building?', answer: '0.8-1 gram' },
  { id: 'jeo_nut_400', category: 'nutrition', amount: 400, question: 'What does TEF stand for in nutrition?', answer: 'Thermic Effect of Food' },
  { id: 'jeo_nut_500', category: 'nutrition', amount: 500, question: 'How many calories are in one pound of body fat?', answer: '3500 calories' },
  
  // CARDIO CATEGORY
  { id: 'jeo_car_100', category: 'cardio', amount: 100, question: 'What does HIIT stand for?', answer: 'High Intensity Interval Training' },
  { id: 'jeo_car_200', category: 'cardio', amount: 200, question: 'How many steps per day is the common fitness goal?', answer: '10,000 steps' },
  { id: 'jeo_car_300', category: 'cardio', amount: 300, question: 'What is the optimal heart rate zone for fat burning?', answer: '60-70% of max heart rate' },
  { id: 'jeo_car_400', category: 'cardio', amount: 400, question: 'What is VO2 max?', answer: 'Maximum oxygen uptake during exercise' },
  { id: 'jeo_car_500', category: 'cardio', amount: 500, question: 'What is the formula to calculate max heart rate?', answer: '220 minus your age' },
  
  // STRENGTH CATEGORY
  { id: 'jeo_str_100', category: 'strength', amount: 100, question: 'How many main muscle groups are in the human body?', answer: '6 or 11 major groups' },
  { id: 'jeo_str_200', category: 'strength', amount: 200, question: 'What rep range is best for building muscle size (hypertrophy)?', answer: '6-12 reps' },
  { id: 'jeo_str_300', category: 'strength', amount: 300, question: 'What is progressive overload?', answer: 'Gradually increasing weight/difficulty over time' },
  { id: 'jeo_str_400', category: 'strength', amount: 400, question: 'What is the difference between concentric and eccentric contraction?', answer: 'Concentric = muscle shortens, Eccentric = muscle lengthens' },
  { id: 'jeo_str_500', category: 'strength', amount: 500, question: 'What percentage of your 1RM should you lift for strength gains?', answer: '80-90% or 85%' },
  
  // RECOVERY CATEGORY
  { id: 'jeo_rec_100', category: 'recovery', amount: 100, question: 'How many hours of sleep are recommended for muscle recovery?', answer: '7-9 hours' },
  { id: 'jeo_rec_200', category: 'recovery', amount: 200, question: 'What does DOMS stand for?', answer: 'Delayed Onset Muscle Soreness' },
  { id: 'jeo_rec_300', category: 'recovery', amount: 300, question: 'How long should you rest between heavy lifting sets?', answer: '2-3 minutes or 3-5 minutes' },
  { id: 'jeo_rec_400', category: 'recovery', amount: 400, question: 'What hormone is primarily responsible for muscle repair during sleep?', answer: 'Growth Hormone or HGH' },
  { id: 'jeo_rec_500', category: 'recovery', amount: 500, question: 'What is the window for optimal protein intake after a workout?', answer: '30 minutes to 2 hours' },
  
  // ANATOMY CATEGORY
  { id: 'jeo_ana_100', category: 'anatomy', amount: 100, question: 'What is the largest muscle in the human body?', answer: 'Gluteus Maximus' },
  { id: 'jeo_ana_200', category: 'anatomy', amount: 200, question: 'How many muscles are in the human body?', answer: 'Over 600 or 640' },
  { id: 'jeo_ana_300', category: 'anatomy', amount: 300, question: 'What muscle group do push-ups primarily target?', answer: 'Chest / Pectorals' },
  { id: 'jeo_ana_400', category: 'anatomy', amount: 400, question: 'What are the three heads of the triceps?', answer: 'Long, Lateral, and Medial' },
  { id: 'jeo_ana_500', category: 'anatomy', amount: 500, question: 'What is the muscle that runs along the front of your shin?', answer: 'Tibialis Anterior' },
  
  // SPORTS CATEGORY
  { id: 'jeo_spo_100', category: 'sports', amount: 100, question: 'How long is a standard marathon?', answer: '26.2 miles or 42.195 km' },
  { id: 'jeo_spo_200', category: 'sports', amount: 200, question: 'What sport burns the most calories per hour?', answer: 'Running or Swimming' },
  { id: 'jeo_spo_300', category: 'sports', amount: 300, question: 'What is the term for the energy system used in short sprints?', answer: 'ATP-PC or Phosphocreatine system' },
  { id: 'jeo_spo_400', category: 'sports', amount: 400, question: 'What is periodization in training?', answer: 'Systematic planning of training phases' },
  { id: 'jeo_spo_500', category: 'sports', amount: 500, question: 'What is the anaerobic threshold?', answer: 'Point where lactic acid builds faster than it can be cleared' },
];

export const bingoExercises: BingoExercise[] = [
  { id: 'b1', name: '10 Push-ups', reps: '10x' },
  { id: 'b2', name: '15 Squats', reps: '15x' },
  { id: 'b3', name: '30s Plank', reps: '30s' },
  { id: 'b4', name: '20 Jumping Jacks', reps: '20x' },
  { id: 'b5', name: '10 Pull-ups', reps: '10x' },
  { id: 'b6', name: '30 Sit-ups', reps: '30x' },
  { id: 'b7', name: '15 Burpees', reps: '15x' },
  { id: 'b8', name: '20 Lunges', reps: '20x' },
  { id: 'b9', name: '30s Wall Sit', reps: '30s' },
  { id: 'b10', name: '15 Dips', reps: '15x' },
  { id: 'b11', name: '30 Mountain Climbers', reps: '30x' },
  { id: 'b12', name: '20 High Knees', reps: '20x' },
  { id: 'b13', name: '15 Push-up to T', reps: '15x' },
  { id: 'b14', name: '25 Calf Raises', reps: '25x' },
  { id: 'b15', name: '30s Russian Twist', reps: '30s' },
  { id: 'b16', name: '10 Diamond Push-ups', reps: '10x' },
  { id: 'b17', name: '20 Glute Bridges', reps: '20x' },
  { id: 'b18', name: '30s L-Sit Hold', reps: '30s' },
  { id: 'b19', name: '15 Box Jumps', reps: '15x' },
  { id: 'b20', name: '20 Tricep Dips', reps: '20x' },
  { id: 'b21', name: '25 Bicycle Crunches', reps: '25x' },
  { id: 'b22', name: '30s Hollow Body Hold', reps: '30s' },
  { id: 'b23', name: '10 Muscle-ups', reps: '10x' },
  { id: 'b24', name: '20 Step-ups', reps: '20x' },
  { id: 'b25', name: '30s Handstand Hold', reps: '30s' },
];

export function getRandomTriviaQuestions(count: number, category?: string, difficulty?: string): TriviaQuestion[] {
  let filtered = triviaQuestions;
  
  if (category) {
    filtered = filtered.filter((q) => q.category === category);
  }
  
  if (difficulty) {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }
  
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, filtered.length));
}

export function getTriviaQuestionsByCategory(category: string): TriviaQuestion[] {
  return triviaQuestions.filter((q) => q.category === category);
}

export function getTriviaQuestionsByDifficulty(difficulty: string): TriviaQuestion[] {
  return triviaQuestions.filter((q) => q.difficulty === difficulty);
}

export function getAllTriviaCategories() {
  const categories = new Set(triviaQuestions.map((q) => q.category));
  return Array.from(categories);
}

export function getAllTriviaDifficulties() {
  const difficulties = new Set(triviaQuestions.map((q) => q.difficulty));
  return Array.from(difficulties);
}

export function getRandomBingoExercises(count: number): BingoExercise[] {
  const shuffled = [...bingoExercises].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getJeopardyQuestionsByAmount(amount: number): JeopardyQuestion[] {
  return jeopardyQuestions.filter((q) => q.amount === amount);
}

export function getJeopardyCategories(): string[] {
  return ['nutrition', 'cardio', 'strength', 'recovery', 'anatomy', 'sports'];
}

export function getJeopardyQuestion(category: string, amount: number): JeopardyQuestion | undefined {
  return jeopardyQuestions.find((q) => q.category === category && q.amount === amount);
}

export const jeopardyCategoryLabels: Record<string, string> = {
  nutrition: '🥗 Nutrition',
  cardio: '🏃 Cardio',
  strength: '💪 Strength',
  recovery: '😴 Recovery',
  anatomy: '🦴 Anatomy',
  sports: '🏆 Sports',
};
