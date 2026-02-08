export const fitnesseFacts = [
  'Consistency beats intensity. Small daily wins compound into major results.',
  'Drink water before, during, and after workouts. Your muscles are 75% water.',
  'Rest days are part of training. Your muscles grow during recovery, not during the workout.',
  'Walking 10,000 steps a day can burn up to 500 calories depending on your body.',
  'Stretching before exercise? Recent studies show it can reduce performance. Warm up instead.',
  'You don\'t need expensive equipment. Bodyweight exercises build real strength.',
  'Sleep is when your body releases growth hormone. Get 7-9 hours nightly.',
  'Protein helps rebuild muscle. Aim for 0.8-1g per pound of body weight daily.',
  'Squats work 256 muscles at once. They\'re the king of leg exercises.',
  'Your brain releases endorphins during exercise. It\'s natural medicine for mood.',
  'A 20-minute walk can boost focus and creativity for up to 4 hours.',
  'Strength training slows muscle loss that comes with age. Start lifting young.',
  'Your metabolism increases up to 48 hours after intense exercise.',
  'Cold water immersion can reduce inflammation and speed recovery.',
  'Planks strengthen your core, improve posture, and prevent back pain.',
  'Running backward engages different muscles and prevents overuse injuries.',
  'Your heart is a muscle. Cardio makes it stronger and more efficient.',
  'Foam rolling breaks up adhesions and improves blood flow to muscles.',
  'Dynamic stretching before workouts. Static stretching after workouts.',
  'Chasing your personal best is more important than comparing to others.',
];

export function getTodaysFact(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % fitnesseFacts.length;
  return fitnesseFacts[index];
}
