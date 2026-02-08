import { getAllTriviaCategories } from '@/app/lib/games';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TriviaCategoryScreen() {
  const router = useRouter();
  const categories = getAllTriviaCategories();

  const categoryEmojis: Record<string, string> = {
    nutrition: '🍎',
    workouts: '💪',
    recovery: '😴',
    cardio: '🏃',
    strength: '🏋️',
    general: '⚡',
  };

  const categoryDescriptions: Record<string, string> = {
    nutrition: 'Learn about macros, calories, and eating for gains',
    workouts: 'Master exercise techniques and workout structure',
    recovery: 'Understand rest, sleep, and muscle repair',
    cardio: 'Build endurance and cardiovascular knowledge',
    strength: 'Power up with strength training wisdom',
    general: 'Mix of everything fitness',
  };

  const handleCategorySelect = (category: string) => {
    router.push({
      pathname: '/games/trivia-play',
      params: {
        mode: 'category',
        category,
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
          <Text style={styles.title}>🎯 Categories</Text>
          <View style={{ width: 50 }} />
        </View>

        <Text style={styles.subtitle}>Master a specific topic</Text>

        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.categoryCard}
              onPress={() => handleCategorySelect(category)}
            >
              <Text style={styles.categoryEmoji}>{categoryEmojis[category]}</Text>
              <Text style={styles.categoryName}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <Text style={styles.categoryDesc}>{categoryDescriptions[category]}</Text>
            </TouchableOpacity>
          ))}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  categoryDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
});
