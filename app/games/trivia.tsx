import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TriviaGameScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top', 'bottom']}>
    <ThemedView style={styles.screen}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>🎮 Fitness Trivia</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroEmoji}>📚</Text>
            <Text style={styles.heroTitle}>Test Your Fitness Knowledge!</Text>
            <Text style={styles.heroDesc}>
              Learn fitness facts through engaging trivia games. Choose your mode and challenge yourself!
            </Text>
          </View>

          {/* Game Modes Preview */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📝</Text>
              <Text style={styles.statNumber}>43+</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>Game Modes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Difficulty Levels</Text>
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/games/trivia-modes')}
          >
            <Text style={styles.startButtonText}>Let&apos;s Play! 🎮</Text>
          </TouchableOpacity>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <Text style={styles.quickStatsTitle}>Quick Facts</Text>
            <Text style={styles.quickStatItem}>✓ Learn while you play</Text>
            <Text style={styles.quickStatItem}>✓ 6 different game modes</Text>
            <Text style={styles.quickStatItem}>✓ Easy, Medium & Hard levels</Text>
            <Text style={styles.quickStatItem}>✓ Complete explanations for each answer</Text>
            <Text style={styles.quickStatItem}>✓ Track your progress</Text>
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
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
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
  heroSection: {
    backgroundColor: '#F0F9F8',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#D0EAE8',
    gap: 12,
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  heroDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 8,
  },
  statEmoji: {
    fontSize: 28,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00B8A9',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  quickStats: {
    backgroundColor: '#F0F9F8',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  quickStatsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  quickStatItem: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
    lineHeight: 18,
  },
});
