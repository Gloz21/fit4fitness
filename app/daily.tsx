import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from './lib/userStore';

const mockFact = {
  title: 'Fitness Fact of the Day',
  body: 'Progressive overload can be as simple as 1-2 more reps each session. Small, steady increases beat sporadic max-effort days.',
};

const mockChallenge = {
  title: 'Challenge of the Day',
  detail: '3 rounds: 12 squats, 10 push-ups, 30-second plank. Rest 60 seconds between rounds.',
  reward: 'Earn +25 XP and keep your streak alive.',
};

export default function DailyScreen() {
  const { goal, profile, hydrated } = useUserStore();
  
  // Convert weight for display (always lbs)
  const displayWeight = profile.weightKg 
    ? (profile.weightKg * 2.20462).toFixed(1)
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top', 'bottom']}>
    <ThemedView style={styles.screen}>
      <ThemedText style={styles.title}>Daily</ThemedText>

      {!hydrated && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#FF7A59" size="small" />
          <Text style={styles.loadingText}>Loading your profile…</Text>
        </View>
      )}

      <View style={styles.metaCard}>
        <Text style={styles.metaLabel}>Your goal</Text>
        {!hydrated ? (
          <Text style={styles.metaValue}>Loading…</Text>
        ) : (
          <Text style={styles.metaValue}>{goal || 'Not set yet'}</Text>
        )}
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>Age: {!hydrated ? '…' : profile.age ?? '—'}</Text>
          <Text style={styles.metaChip}>
            Height: {!hydrated ? '…' : profile.heightCm ? `${profile.heightCm} cm` : '—'}
          </Text>
          <Text style={styles.metaChip}>
            Weight: {!hydrated ? '…' : displayWeight ? `${displayWeight} lbs` : '—'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>Gender: {!hydrated ? '…' : profile.gender || '—'}</Text>
          <Text style={styles.metaChip}>Activity: {!hydrated ? '…' : profile.activity || '—'}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>{mockFact.title}</Text>
        <Text style={styles.cardBody}>{mockFact.body}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{mockChallenge.title}</Text>
        <Text style={styles.cardBody}>{mockChallenge.detail}</Text>
        <Text style={styles.cardFoot}>{mockChallenge.reward}</Text>
      </View>
    </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  metaCard: {
    backgroundColor: '#0B1222',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  metaLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  metaValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  loadingText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  cardLabel: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 16,
  },
  cardBody: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  cardFoot: {
    color: '#FF7A59',
    fontSize: 13,
    fontWeight: '700',
  },
});
