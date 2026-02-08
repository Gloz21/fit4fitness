import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TriviaModeSelection() {
  const router = useRouter();

  const modes = [
    {
      id: 'classic',
      title: 'Classic Mode',
      description: '10 random questions, standard difficulty',
      emoji: '📚',
      params: { mode: 'classic', questions: 10, allDifficulties: true },
    },
    {
      id: 'quick',
      title: 'Quick Fire',
      description: '5 fast questions - can you get 5/5?',
      emoji: '⚡',
      params: { mode: 'quickfire', questions: 5, allDifficulties: true },
    },
    {
      id: 'survival',
      title: 'Survival Mode',
      description: 'Keep going until you miss one!',
      emoji: '💪',
      params: { mode: 'survival', unlimited: true },
    },
    {
      id: 'category',
      title: 'Category Select',
      description: 'Choose a topic you want to master',
      emoji: '🎯',
      params: { mode: 'category' },
    },
    {
      id: 'difficulty',
      title: 'Difficulty Challenge',
      description: 'Easy, Medium, or Hard questions',
      emoji: '🏆',
      params: { mode: 'difficulty' },
    },
    {
      id: 'daily',
      title: 'Daily Challenge',
      description: 'Today\'s special fitness question',
      emoji: '📅',
      params: { mode: 'daily', questions: 1 },
    },
  ];

  const handleModeSelect = (params: any) => {
    if (params.mode === 'category') {
      router.push('/games/trivia-category');
    } else if (params.mode === 'difficulty') {
      router.push('/games/trivia-difficulty');
    } else {
      router.push({
        pathname: '/games/trivia-play',
        params,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top', 'bottom']}>
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎮 Trivia Modes</Text>
          <View style={{ width: 50 }} />
        </View>

        <Text style={styles.subtitle}>Choose your challenge</Text>

        <View style={styles.modesGrid}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={styles.modeCard}
              onPress={() => handleModeSelect(mode.params)}
            >
              <Text style={styles.modeEmoji}>{mode.emoji}</Text>
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeDesc}>{mode.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipItem}>• Learn while you play!</Text>
          <Text style={styles.tipItem}>• Each question has an explanation</Text>
          <Text style={styles.tipItem}>• Try different modes to improve</Text>
          <Text style={styles.tipItem}>• Categories help focus your learning</Text>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  modesGrid: {
    marginBottom: 32,
    gap: 12,
  },
  modeCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
  },
  modeEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modeDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  tipsSection: {
    backgroundColor: '#E8F5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B8A9',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
});
