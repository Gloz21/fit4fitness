import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    getJeopardyCategories,
    getJeopardyQuestion,
    jeopardyCategoryLabels,
    JeopardyQuestion,
} from '../lib/games';
import { soundStore } from '../lib/soundStore';
import { userStore } from '../lib/userStore';

const { width } = Dimensions.get('window');

type GamePhase = 'board' | 'question' | 'answer' | 'results';

interface AnsweredCell {
  category: string;
  amount: number;
  correct: boolean;
}

export default function JeopardyGame() {
  const router = useRouter();

  const categories = getJeopardyCategories();
  const amounts = [100, 200, 300, 400, 500];

  const [phase, setPhase] = useState<GamePhase>('board');
  const [currentQuestion, setCurrentQuestion] = useState<JeopardyQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [answeredCells, setAnsweredCells] = useState<AnsweredCell[]>([]);
  const [score, setScore] = useState(0);
  const [showingResult, setShowingResult] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const totalQuestions = categories.length * amounts.length; // 30 questions

  const playSound = async (type: 'correct' | 'incorrect') => {
    if (type === 'correct') {
      soundStore.playCorrectAnswer();
    } else {
      soundStore.playIncorrectAnswer();
    }
  };

  const isCellAnswered = (category: string, amount: number): boolean => {
    return answeredCells.some((c) => c.category === category && c.amount === amount);
  };

  const getCellResult = (category: string, amount: number): boolean | null => {
    const cell = answeredCells.find((c) => c.category === category && c.amount === amount);
    return cell ? cell.correct : null;
  };

  const handleCellPress = (category: string, amount: number) => {
    if (isCellAnswered(category, amount)) return;

    const question = getJeopardyQuestion(category, amount);
    if (question) {
      setCurrentQuestion(question);
      setUserAnswer('');
      setPhase('question');
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;

    const correct = currentQuestion.answer.toLowerCase();
    const user = userAnswer.toLowerCase().trim();

    // Flexible matching - check if answer contains key parts
    const correctWords = correct.split(/\s+/).filter((w) => w.length > 2);
    const userWords = user.split(/\s+/);
    const matchCount = correctWords.filter((cw) =>
      userWords.some((uw) => uw.includes(cw) || cw.includes(uw))
    ).length;

    const isCorrect =
      user === correct ||
      correct.includes(user) ||
      user.includes(correct) ||
      matchCount >= Math.ceil(correctWords.length / 2);

    if (isCorrect) {
      setScore((s) => s + currentQuestion.amount);
      setCorrectCount((c) => c + 1);
      playSound('correct');
      setShowingResult('correct');
    } else {
      playSound('incorrect');
      setShowingResult('incorrect');
    }

    setAnsweredCells((prev) => [
      ...prev,
      {
        category: currentQuestion.category,
        amount: currentQuestion.amount,
        correct: isCorrect,
      },
    ]);

    setPhase('answer');
  };

  const awardXP = (xpAmount: number) => {
    const userProfile = userStore.getState().profile;
    if (userProfile) {
      const prevXP = userProfile.xp || 0;
      const newXP = prevXP + xpAmount;
      userStore.setProfile({
        ...userProfile,
        xp: newXP,
      });
    }
  };

  const continueGame = () => {
    setShowingResult(null);
    setCurrentQuestion(null);
    setUserAnswer('');

    if (answeredCells.length >= totalQuestions) {
      // Game finished
      const earnedXP = Math.floor(score / 10);
      awardXP(earnedXP);
      setPhase('results');
    } else {
      setPhase('board');
    }
  };

  const getRank = () => {
    const accuracy = (correctCount / answeredCells.length) * 100;
    if (accuracy >= 90) return { title: 'Jeopardy Champion!', emoji: '👑' };
    if (accuracy >= 70) return { title: 'Quiz Master', emoji: '🏆' };
    if (accuracy >= 50) return { title: 'Trivia Star', emoji: '⭐' };
    if (accuracy >= 30) return { title: 'Rising Player', emoji: '📈' };
    return { title: 'Rookie', emoji: '🎮' };
  };

  const restartGame = () => {
    setPhase('board');
    setAnsweredCells([]);
    setScore(0);
    setCorrectCount(0);
    setCurrentQuestion(null);
    setUserAnswer('');
    setShowingResult(null);
  };

  // Board View
  if (phase === 'board') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a2e' }} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>FITNESS JEOPARDY!</Text>
          <Text style={styles.score}>${score}</Text>
        </View>

        <Text style={styles.progress}>
          {answeredCells.length} / {totalQuestions} Questions
        </Text>

        <ScrollView style={styles.boardContainer} contentContainerStyle={styles.boardContent}>
          {/* Category Headers */}
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <View key={cat} style={styles.categoryHeader}>
                <Text style={styles.categoryHeaderText}>{jeopardyCategoryLabels[cat]}</Text>
              </View>
            ))}
          </View>

          {/* Amount Rows */}
          {amounts.map((amount) => (
            <View key={amount} style={styles.amountRow}>
              {categories.map((cat) => {
                const answered = isCellAnswered(cat, amount);
                const result = getCellResult(cat, amount);

                return (
                  <TouchableOpacity
                    key={`${cat}-${amount}`}
                    style={[
                      styles.cell,
                      answered && result === true && styles.cellCorrect,
                      answered && result === false && styles.cellIncorrect,
                      answered && styles.cellAnswered,
                    ]}
                    onPress={() => handleCellPress(cat, amount)}
                    disabled={answered}
                  >
                    {answered ? (
                      <Text style={styles.cellDone}>{result ? '✓' : '✗'}</Text>
                    ) : (
                      <Text style={styles.cellAmount}>${amount}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {answeredCells.length >= 6 && (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => {
              const earnedXP = Math.floor(score / 10);
              awardXP(earnedXP);
              setPhase('results');
            }}
          >
            <Text style={styles.finishButtonText}>Finish Early</Text>
          </TouchableOpacity>
        )}
      </View>
      </SafeAreaView>
    );
  }

  // Question Phase
  if (phase === 'question' && currentQuestion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a2e' }} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionCategory}>
            {jeopardyCategoryLabels[currentQuestion.category]}
          </Text>
          <Text style={styles.questionAmount}>${currentQuestion.amount}</Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>What is your answer?</Text>
          <TextInput
            style={styles.answerInput}
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder="Type your answer..."
            placeholderTextColor="#888"
            autoFocus
            onSubmitEditing={checkAnswer}
          />
          <TouchableOpacity
            style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
            onPress={checkAnswer}
            disabled={!userAnswer.trim()}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
    );
  }

  // Answer Phase
  if (phase === 'answer' && currentQuestion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a2e' }} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View
          style={[
            styles.resultBanner,
            showingResult === 'correct' ? styles.correctBanner : styles.incorrectBanner,
          ]}
        >
          <Text style={styles.resultEmoji}>{showingResult === 'correct' ? '🎉' : '😞'}</Text>
          <Text style={styles.resultText}>
            {showingResult === 'correct' ? 'CORRECT!' : 'INCORRECT'}
          </Text>
          {showingResult === 'correct' && (
            <Text style={styles.resultPoints}>+${currentQuestion.amount}</Text>
          )}
        </View>

        <View style={styles.answerReveal}>
          <Text style={styles.answerRevealLabel}>The correct answer was:</Text>
          <Text style={styles.correctAnswer}>{currentQuestion.answer}</Text>
          {showingResult === 'incorrect' && (
            <Text style={styles.yourAnswerLabel}>
              Your answer: <Text style={styles.yourAnswer}>{userAnswer}</Text>
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={continueGame}>
          <Text style={styles.continueButtonText}>
            {answeredCells.length >= totalQuestions ? 'See Results' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  // Results Phase
  if (phase === 'results') {
    const rank = getRank();
    const accuracy =
      answeredCells.length > 0 ? Math.round((correctCount / answeredCells.length) * 100) : 0;
    const earnedXP = Math.floor(score / 10);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a2e' }} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.resultsCard}>
          <Text style={styles.resultsEmoji}>{rank.emoji}</Text>
          <Text style={styles.resultsTitle}>{rank.title}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>${score}</Text>
              <Text style={styles.statLabel}>Total Score</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {correctCount}/{answeredCells.length}
              </Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>+{earnedXP}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.playAgainButton} onPress={restartGame}>
            <Text style={styles.playAgainText}>🎮 Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a2e',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  score: {
    color: '#00ff00',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progress: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  boardContainer: {
    flex: 1,
  },
  boardContent: {
    paddingBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryHeader: {
    flex: 1,
    backgroundColor: '#1a237e',
    padding: 10,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  categoryHeaderText: {
    color: '#fff',
    fontSize: width < 400 ? 10 : 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cell: {
    flex: 1,
    backgroundColor: '#1a237e',
    padding: 12,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55,
  },
  cellAnswered: {
    opacity: 0.7,
  },
  cellCorrect: {
    backgroundColor: '#1b5e20',
  },
  cellIncorrect: {
    backgroundColor: '#b71c1c',
  },
  cellAmount: {
    color: '#ffd700',
    fontSize: width < 400 ? 16 : 20,
    fontWeight: 'bold',
  },
  cellDone: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#ff9800',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  finishButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Question Phase
  questionHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  questionCategory: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionAmount: {
    color: '#00ff00',
    fontSize: 32,
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: '#1a237e',
    padding: 30,
    borderRadius: 16,
    marginBottom: 30,
    minHeight: 150,
    justifyContent: 'center',
  },
  questionText: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 32,
  },
  answerSection: {
    alignItems: 'center',
  },
  answerLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 12,
  },
  answerInput: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    marginBottom: 20,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Answer Phase
  resultBanner: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 16,
    marginBottom: 30,
  },
  correctBanner: {
    backgroundColor: '#1b5e20',
  },
  incorrectBanner: {
    backgroundColor: '#b71c1c',
  },
  resultEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  resultText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  resultPoints: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  answerReveal: {
    backgroundColor: '#1a237e',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  answerRevealLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
  },
  correctAnswer: {
    color: '#4caf50',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  yourAnswerLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 15,
  },
  yourAnswer: {
    color: '#ff5252',
  },
  continueButton: {
    backgroundColor: '#ffd700',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Results Phase
  resultsCard: {
    flex: 1,
    backgroundColor: '#1a237e',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsEmoji: {
    fontSize: 80,
    marginBottom: 15,
  },
  resultsTitle: {
    color: '#ffd700',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 15,
  },
  statBox: {
    backgroundColor: '#0a0a2e',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  statValue: {
    color: '#00ff00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 5,
  },
  playAgainButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  playAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
