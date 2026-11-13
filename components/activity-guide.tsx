import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Values must match the strings the calorie calculation in userStore expects.
export const ACTIVITY_LEVELS = [
  {
    value: 'Sedentary',
    title: 'Sedentary',
    summary: 'Little or no planned exercise.',
    examples: 'Desk job or school, mostly sitting, driving to get around. Usually under 5,000 steps a day.',
  },
  {
    value: 'Light (1–3x/week)',
    title: 'Light',
    summary: 'Exercise 1–3 days a week.',
    examples: 'Walks, easy jogs, yoga, or a casual sport a few times a week. Roughly 5,000–7,500 steps a day.',
  },
  {
    value: 'Moderate (3–5x/week)',
    title: 'Moderate',
    summary: 'Solid workouts 3–5 days a week.',
    examples: 'Regular gym sessions, runs, or team practices that get you breathing hard. Roughly 7,500–10,000 steps a day.',
  },
  {
    value: 'Very Active (5–7x/week)',
    title: 'Very Active',
    summary: 'Hard training most days, or a physical job plus workouts.',
    examples: 'Daily intense training, competitive sports, or work like construction or nursing on top of exercise. 10,000+ steps a day.',
  },
] as const;

export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number]['value'];

const WORKOUT_DAYS = [
  { label: '0 days', score: 0 },
  { label: '1–2 days', score: 1 },
  { label: '3–4 days', score: 2 },
  { label: '5+ days', score: 3 },
];

const DAILY_ROUTINE = [
  { label: 'Mostly sitting', detail: 'Desk work, classes, driving', score: 0 },
  { label: 'On my feet some of the day', detail: 'Retail, teaching, lots of walking', score: 0.5 },
  { label: 'Physical work most of the day', detail: 'Construction, nursing, warehouse', score: 1 },
];

function recommend(daysScore: number, routineScore: number): ActivityLevel {
  const index = Math.min(3, Math.round(daysScore + routineScore));
  return ACTIVITY_LEVELS[index].value;
}

interface ActivityGuideProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (level: ActivityLevel) => void;
}

export function ActivityGuide({ visible, onClose, onSelect }: ActivityGuideProps) {
  const [days, setDays] = useState<number | null>(null);
  const [routine, setRoutine] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setDays(null);
      setRoutine(null);
    }
  }, [visible]);

  const result = days !== null && routine !== null ? recommend(WORKOUT_DAYS[days].score, DAILY_ROUTINE[routine].score) : null;
  const resultInfo = ACTIVITY_LEVELS.find((l) => l.value === result);

  const choose = (level: ActivityLevel) => {
    onSelect(level);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Find Your Activity Level</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.intro}>
            Answer two quick questions and we’ll suggest a level. It’s used to estimate how many calories you burn in a day.
          </Text>

          <View style={styles.question}>
            <Text style={styles.questionText}>1. In a typical week, how many days do you work out for 30+ minutes?</Text>
            <View style={styles.optionRow}>
              {WORKOUT_DAYS.map((opt, i) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.chip, days === i && styles.chipActive]}
                  onPress={() => setDays(i)}
                >
                  <Text style={[styles.chipText, days === i && styles.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.question}>
            <Text style={styles.questionText}>2. What does a normal day look like outside of workouts?</Text>
            <View style={styles.optionColumn}>
              {DAILY_ROUTINE.map((opt, i) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.routineOption, routine === i && styles.chipActive]}
                  onPress={() => setRoutine(i)}
                >
                  <Text style={[styles.routineLabel, routine === i && styles.chipTextActive]}>{opt.label}</Text>
                  <Text style={styles.routineDetail}>{opt.detail}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {resultInfo && (
            <View style={styles.resultCard}>
              <Text style={styles.resultEyebrow}>Suggested level</Text>
              <Text style={styles.resultTitle}>{resultInfo.title}</Text>
              <Text style={styles.resultSummary}>{resultInfo.summary}</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => choose(resultInfo.value)}>
                <Text style={styles.primaryButtonText}>Use {resultInfo.title}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>What each level means</Text>
          <Text style={styles.tip}>
            Most people overestimate how active they are. If you’re between two levels, pick the lower one.
          </Text>

          {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[styles.levelCard, result === level.value && styles.levelCardHighlight]}
              onPress={() => choose(level.value)}
            >
              <View style={styles.levelHeader}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelPick}>Choose</Text>
              </View>
              <Text style={styles.levelSummary}>{level.summary}</Text>
              <Text style={styles.levelExamples}>{level.examples}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  close: {
    fontSize: 20,
    color: '#666',
  },
  scroll: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 48,
    gap: 16,
  },
  intro: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
  question: {
    gap: 10,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 21,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionColumn: {
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    backgroundColor: '#FFF',
  },
  chipActive: {
    borderColor: '#00B8A9',
    backgroundColor: '#F0FFFE',
  },
  chipText: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#00B8A9',
  },
  routineOption: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    backgroundColor: '#FFF',
    gap: 2,
  },
  routineLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  routineDetail: {
    fontSize: 12,
    color: '#666',
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#00B8A9',
    gap: 4,
  },
  resultEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B8A9',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  resultSummary: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 8,
  },
  tip: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginTop: -8,
  },
  levelCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD',
    gap: 4,
  },
  levelCardHighlight: {
    borderColor: '#00B8A9',
    borderWidth: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  levelPick: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00B8A9',
  },
  levelSummary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  levelExamples: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
