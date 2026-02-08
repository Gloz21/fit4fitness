import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TriviaDifficultyScreen() {
  const router = useRouter();

  const difficulties = [
    {
      id: 'easy',
      title: 'Easy',
      description: 'Perfect for beginners',
      emoji: '🟢',
      color: '#4CAF50',
    },
    {
      id: 'medium',
      title: 'Medium',
      description: 'Challenge yourself',
      emoji: '🟡',
      color: '#FFC107',
    },
    {
      id: 'hard',
      title: 'Hard',
      description: 'Expert level only!',
      emoji: '🔴',
      color: '#F44336',
    },
  ];

  const handleDifficultySelect = (difficulty: string) => {
    router.push({
      pathname: '/games/trivia-play',
      params: {
        mode: 'difficulty',
        difficulty,
        questions: '10',
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top', 'bottom']}>
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🏆 Difficulty</Text>
          <View style={{ width: 50 }} />
        </View>

        <Text style={styles.subtitle}>Choose your challenge level</Text>

        <View style={styles.difficultiesGrid}>
          {difficulties.map((diff) => (
            <TouchableOpacity
              key={diff.id}
              style={[styles.difficultyCard, { borderColor: diff.color }]}
              onPress={() => handleDifficultySelect(diff.id)}
            >
              <Text style={styles.difficultyEmoji}>{diff.emoji}</Text>
              <Text style={[styles.difficultyTitle, { color: diff.color }]}>
                {diff.title}
              </Text>
              <Text style={styles.difficultyDesc}>{diff.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📊 Difficulty Scale</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>🟢</Text>
            <View>
              <Text style={styles.infoLabel}>Easy</Text>
              <Text style={styles.infoText}>Foundational fitness knowledge</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>🟡</Text>
            <View>
              <Text style={styles.infoLabel}>Medium</Text>
              <Text style={styles.infoText}>Intermediate concepts and details</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>🔴</Text>
            <View>
              <Text style={styles.infoLabel}>Hard</Text>
              <Text style={styles.infoText}>Advanced knowledge and nuances</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E8F5F5',
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B8A9',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  difficultiesGrid: {
    gap: 12,
    marginBottom: 32,
  },
  difficultyCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  difficultyDesc: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#F0F9F8',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D0EAE8',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B8A9',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  infoEmoji: {
    fontSize: 24,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
});
