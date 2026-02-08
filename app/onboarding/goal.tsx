import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userStore } from '../lib/userStore';

const goals = [
  { key: 'weight-loss', title: 'Weight Loss', icon: '📉', desc: 'Create a calorie deficit through sustainable habits to reach your target.' },
  { key: 'muscle-gain', title: 'Muscle Gain', icon: '💪', desc: 'Build strength and size through progressive training and a calorie surplus.' },
  { key: 'performance', title: 'Athletic Performance', icon: '⚡', desc: 'Move faster, jump higher, and improve your endurance.' },
  { key: 'recomposition', title: 'Body Recomposition', icon: '⚖️', desc: 'Build muscle while reducing body fat.' },
];

export default function GoalScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const onContinue = () => {
    if (selected) {
      userStore.setGoal(selected);
      router.replace('/onboarding/profile');
    }
  };

  const selectedGoal = goals.find((g) => g.key === selected);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E8E8E8' }} edges={['top', 'bottom']}>
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        
        <Text style={styles.title}>Choose Your Goal</Text>
        <Text style={styles.subtitle}>Pick one focus for personalized guidance.</Text>

        <View style={styles.grid}>
          {goals.map((goal) => {
            const isActive = selected === goal.key;
            return (
              <TouchableOpacity
                key={goal.key}
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => setSelected(goal.key)}
              >
                <Text style={styles.icon}>{goal.icon}</Text>
                <Text style={styles.cardTitle}>{goal.title}</Text>
                <Text style={styles.cardDesc}>{goal.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedGoal && (
          <View style={styles.explanation}>
            <Text style={styles.explTitle}>{selectedGoal.title}</Text>
            <Text style={styles.explText}>
              Your goal will determine your nutrition, recommended workouts, and daily habits.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryCta, !selected && styles.primaryCtaDisabled]}
          disabled={!selected}
          onPress={onContinue}
        >
          <Text style={styles.primaryCtaText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
    gap: 16,
  },
  backRow: {
    marginBottom: 8,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B8A9',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#DDD',
    gap: 8,
  },
  cardActive: {
    borderColor: '#00B8A9',
    backgroundColor: '#F0FFFE',
  },
  icon: {
    fontSize: 32,
  },
  cardTitle: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    color: '#4A4A4A',
    fontSize: 13,
    lineHeight: 18,
  },
  explanation: {
    backgroundColor: '#F0FFFE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00B8A9',
    padding: 12,
    gap: 6,
  },
  explTitle: {
    color: '#00B8A9',
    fontSize: 14,
    fontWeight: '700',
  },
  explText: {
    color: '#4A4A4A',
    fontSize: 13,
    lineHeight: 18,
  },
  primaryCta: {
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  primaryCtaDisabled: {
    opacity: 0.5,
  },
  primaryCtaText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
