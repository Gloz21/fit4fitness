import { getRandomTriviaQuestions, TriviaQuestion } from '@/app/lib/games';
import { soundStore } from '@/app/lib/soundStore';
import { userStore } from '@/app/lib/userStore';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TriviaPlayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    questions?: string;
    category?: string;
    difficulty?: string;
    unlimited?: string;
  }>();

  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, []);

  // Award XP when game ends (moved to useEffect to prevent double-awarding on re-renders)
  useEffect(() => {
    if (gameOver && !xpAwarded && questions.length > 0) {
      const percentage = Math.round((score / questions.length) * 100);
      const userProfile = userStore.getState().profile;
      if (userProfile) {
        const prevXP = userProfile.xp || 0;
        const prevLevel = userProfile.level || 1;
        // XP: 2 per correct answer + bonus for high scores
        let triviaXP = score * 2;
        if (percentage === 100) triviaXP += 10; // Perfect bonus
        else if (percentage >= 80) triviaXP += 5; // Excellence bonus
        const newXP = prevXP + triviaXP;
        const newLevel = prevLevel + Math.floor(newXP / 100) - Math.floor(prevXP / 100);
        userStore.setProfile({
          ...userProfile,
          xp: newXP,
          level: newLevel,
        });
        setEarnedXP(triviaXP);
      }
      setXpAwarded(true);
    }
  }, [gameOver, xpAwarded, score, questions.length]);

  const loadQuestions = () => {
    const questionsCount = params.questions ? parseInt(params.questions as string) : 10;
    const triviaQuestions = getRandomTriviaQuestions(
      questionsCount,
      params.category,
      params.difficulty
    );
    setQuestions(triviaQuestions);
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    
    if (index === currentQuestion.correct) {
      soundStore.playCorrectAnswer();
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      soundStore.playIncorrectAnswer();
      // Survival mode: end game on wrong answer
      if (params.mode === 'survival') {
        setTimeout(() => setGameOver(true), 800);
        return;
      }
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (params.unlimited === 'true') {
      // Load a new question
      const newQuestion = getRandomTriviaQuestions(1, params.category, params.difficulty)[0];
      setQuestions([...questions, newQuestion]);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      setGameOver(true);
    }
  };

  if (questions.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top', 'bottom']}>
      <ThemedView style={styles.screen}>
        <Text style={styles.loading}>Loading trivia...</Text>
      </ThemedView>
      </SafeAreaView>
    );
  }

  if (gameOver) {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    let resultMessage = '';
    let resultEmoji = '';

    if (percentage === 100) {
      resultMessage = 'PERFECT SCORE! 🔥';
      resultEmoji = '🏆';
    } else if (percentage >= 80) {
      resultMessage = 'Excellent! You\'re a fitness expert!';
      resultEmoji = '⭐';
    } else if (percentage >= 60) {
      resultMessage = 'Good job! Keep learning!';
      resultEmoji = '👍';
    } else if (percentage >= 40) {
      resultMessage = 'Not bad! Try again!';
      resultEmoji = '💪';
    } else {
      resultMessage = 'Keep grinding! You\'ll improve!';
      resultEmoji = '📚';
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top', 'bottom']}>
      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <Text style={styles.resultEmoji}>{resultEmoji}</Text>
          <Text style={styles.resultTitle}>Game Over!</Text>
          <Text style={styles.resultMessage}>{resultMessage}</Text>

          <View style={styles.scoreCard}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreValue}>{score}/{questions.length}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Percentage</Text>
              <Text style={styles.scoreValue}>{percentage}%</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>XP Earned</Text>
              <Text style={[styles.scoreValue, { color: '#FFD700' }]}>+{earnedXP} ⭐</Text>
            </View>
            {params.mode === 'survival' && (
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Best Streak</Text>
                <Text style={styles.scoreValue}>{streak}</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={() => {
                setCurrentIndex(0);
                setScore(0);
                setStreak(0);
                setAnswered(false);
                setSelectedAnswer(null);
                setGameOver(false);
                setXpAwarded(false);
                setEarnedXP(0);
                loadQuestions();
              }}
            >
              <Text style={styles.retryButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.modesButton]}
              onPress={() => router.push('/games/trivia-modes')}
            >
              <Text style={styles.modesButtonText}>🎮 Other Modes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.homeButton]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.homeButtonText}>🏠 Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top', 'bottom']}>
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.mode}>
            {params.mode === 'classic' && '📚 Classic'}
            {params.mode === 'quickfire' && '⚡ Quick Fire'}
            {params.mode === 'survival' && '💪 Survival'}
            {params.mode === 'daily' && '📅 Daily'}
          </Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreText}>✓ {score} correct</Text>
            {params.mode === 'survival' && <Text style={styles.streakText}>🔥 {streak} streak</Text>}
          </View>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          {currentQuestion.difficulty === 'hard' && <Text style={styles.hardBadge}>⭐ Hard</Text>}
          {currentQuestion.difficulty === 'medium' && <Text style={styles.mediumBadge}>⭐ Medium</Text>}

          <Text style={styles.question}>{currentQuestion.question}</Text>

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
            </Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.correct;
            const isSelected = index === selectedAnswer;
            const showAsCorrect = answered && isCorrect;
            const showAsWrong = answered && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  showAsCorrect && styles.optionCorrect,
                  showAsWrong && styles.optionWrong,
                  !answered && isSelected && styles.optionSelected,
                  !answered && !isSelected && styles.optionUnselected,
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={answered}
              >
                <Text
                  style={[
                    styles.optionText,
                    (showAsCorrect || showAsWrong) && styles.optionTextSelected,
                  ]}
                >
                  {showAsCorrect && '✓ '}
                  {showAsWrong && '✗ '}
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {answered && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>💡 Explanation</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}

        {/* Next Button */}
        {answered && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results →'}
            </Text>
          </TouchableOpacity>
        )}
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 24,
    color: '#666',
  },
  mode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B8A9',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B8A9',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B8A9',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  loading: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
  questionCard: {
    backgroundColor: '#F0F9F8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D0EAE8',
  },
  hardBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  mediumBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFB84D',
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 26,
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00B8A9',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  option: {
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
  },
  optionUnselected: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E0E0E0',
  },
  optionSelected: {
    backgroundColor: '#E8F5F5',
    borderColor: '#00B8A9',
    borderWidth: 2,
  },
  optionCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  optionWrong: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  explanationCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE5B4',
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  nextButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  resultsContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  scoreCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  scoreItem: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00B8A9',
  },
  buttonGroup: {
    gap: 12,
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#00B8A9',
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modesButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  modesButtonText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 14,
  },
  homeButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  homeButtonText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 14,
  },
});
