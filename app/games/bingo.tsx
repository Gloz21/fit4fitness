import { BingoExercise, getRandomBingoExercises } from '@/app/lib/games';
import { soundStore } from '@/app/lib/soundStore';
import { userStore } from '@/app/lib/userStore';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BingoCell extends BingoExercise {
  number: number;
}

export default function BingoGameScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState<BingoCell[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);

  useEffect(() => {
    const bingo = getRandomBingoExercises(25);
    // Assign random numbers 1-75 to each exercise
    const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const shuffledNumbers = numbers.sort(() => Math.random() - 0.5);
    
    const bingoWithNumbers = bingo.map((exercise, index) => ({
      ...exercise,
      number: shuffledNumbers[index],
    }));
    
    setExercises(bingoWithNumbers);
    setAvailableNumbers(shuffledNumbers.slice(0, 25));
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeElapsed((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  // Award XP when game ends (moved to useEffect to prevent double-awarding on re-renders)
  useEffect(() => {
    if (gameOver && !xpAwarded) {
      const xp = Math.max(100, 500 - Math.floor(timeElapsed / 10));
      const userProfile = userStore.getState().profile;
      if (userProfile) {
        const prevXP = userProfile.xp || 0;
        const prevLevel = userProfile.level || 1;
        const newXP = prevXP + xp;
        const newLevel = prevLevel + Math.floor(newXP / 100) - Math.floor(prevXP / 100);
        userStore.setProfile({
          ...userProfile,
          xp: newXP,
          level: newLevel,
        });
      }
      setXpAwarded(true);
    }
  }, [gameOver, xpAwarded, timeElapsed]);

  const callNumber = () => {
    const remaining = availableNumbers.filter(n => !calledNumbers.includes(n));
    if (remaining.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * remaining.length);
    const number = remaining[randomIndex];
    
    soundStore.playButtonClick();
    setCurrentNumber(number);
    setCalledNumbers([...calledNumbers, number]);
  };

  const toggleExercise = (id: string, cellNumber: number) => {
    // Only allow marking if this number has been called
    if (!calledNumbers.includes(cellNumber)) {
      return;
    }
    
    const newCompleted = new Set(completed);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompleted(newCompleted);

    // Check for bingo (5 in a row horizontally, vertically, or diagonally)
    if (checkBingo(newCompleted)) {
      soundStore.playWorkoutComplete();
      setGameOver(true);
    } else {
      soundStore.playButtonClick();
    }
  };

  const checkBingo = (completedSet: Set<string>): boolean => {
    if (exercises.length !== 25) return false;

    // Horizontal
    for (let row = 0; row < 5; row++) {
      let count = 0;
      for (let col = 0; col < 5; col++) {
        if (completedSet.has(exercises[row * 5 + col].id)) count++;
      }
      if (count === 5) return true;
    }

    // Vertical
    for (let col = 0; col < 5; col++) {
      let count = 0;
      for (let row = 0; row < 5; row++) {
        if (completedSet.has(exercises[row * 5 + col].id)) count++;
      }
      if (count === 5) return true;
    }

    // Diagonal (top-left to bottom-right)
    let count = 0;
    for (let i = 0; i < 5; i++) {
      if (completedSet.has(exercises[i * 5 + i].id)) count++;
    }
    if (count === 5) return true;

    // Diagonal (top-right to bottom-left)
    count = 0;
    for (let i = 0; i < 5; i++) {
      if (completedSet.has(exercises[i * 5 + (4 - i)].id)) count++;
    }
    if (count === 5) return true;

    return false;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const xpEarned = Math.max(100, 500 - Math.floor(timeElapsed / 10));

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E8E8E8' }} edges={['top', 'bottom']}>
      <ThemedView style={styles.screen}>
        <Text style={styles.loading}>Loading bingo...</Text>
      </ThemedView>
      </SafeAreaView>
    );
  }

  if (gameOver) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E8E8E8' }} edges={['top', 'bottom']}>
      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>🎉 BINGO!</Text>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Time Completed</Text>
            <Text style={styles.resultValue}>{formatTime(timeElapsed)}</Text>
          </View>

          <View style={styles.xpCard}>
            <Text style={styles.xpLabel}>XP Earned</Text>
            <Text style={styles.xpValue}>+{xpEarned}</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Exercises</Text>
              <Text style={styles.statValue}>25</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>{completed.size}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E8E8E8' }} edges={['top', 'bottom']}>
    <ThemedView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.timer}>{formatTime(timeElapsed)}</Text>
        <Text style={styles.progress}>{completed.size}/25</Text>
      </View>

      <View style={styles.callSection}>
        {currentNumber ? (
          <View style={styles.currentCall}>
            <Text style={styles.currentCallLabel}>Current Number</Text>
            <Text style={styles.currentCallNumber}>{currentNumber}</Text>
          </View>
        ) : (
          <Text style={styles.waitingText}>Press &quot;Call Number&quot; to start!</Text>
        )}
        
        <TouchableOpacity 
          style={styles.callButton}
          onPress={callNumber}
          disabled={availableNumbers.length === calledNumbers.length}
        >
          <Text style={styles.callButtonText}>
            {availableNumbers.length === calledNumbers.length ? 'All Called' : 'Call Number'}
          </Text>
        </TouchableOpacity>

        <View style={styles.calledNumbersContainer}>
          <Text style={styles.calledLabel}>Called: </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.calledNumbers}>
              {calledNumbers.map((num, idx) => (
                <Text key={idx} style={styles.calledNumber}>{num}</Text>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.bingoContainer}>
        <View style={styles.grid}>
          {exercises.map((exercise, index) => {
            const isCalled = calledNumbers.includes(exercise.number);
            const isCompleted = completed.has(exercise.id);
            
            return (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.cell,
                  isCalled && styles.cellCalled,
                  isCompleted && styles.cellCompleted,
                ]}
                onPress={() => toggleExercise(exercise.id, exercise.number)}
                disabled={!isCalled}
              >
                <Text style={[styles.cellNumber, isCalled && styles.cellNumberCalled]}>
                  {exercise.number}
                </Text>
                <Text style={[styles.cellName, isCalled && styles.cellNameCalled]}>
                  {exercise.name}
                </Text>
                <Text style={[styles.cellReps, isCalled && styles.cellRepsCalled]}>
                  {exercise.reps}
                </Text>
                {isCompleted && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  container: {
    padding: 24,
    paddingBottom: 48,
    gap: 20,
  },
  bingoContainer: {
    padding: 16,
    paddingBottom: 48,
  },
  loading: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  backButton: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B8A9',
  },
  timer: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  progress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
  },
  callSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  currentCall: {
    alignItems: 'center',
    marginBottom: 12,
  },
  currentCallLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
  },
  currentCallNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#00B8A9',
  },
  waitingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
  },
  callButton: {
    backgroundColor: '#00B8A9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  callButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  calledNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calledLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginRight: 8,
  },
  calledNumbers: {
    flexDirection: 'row',
    gap: 6,
  },
  calledNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B8A9',
    backgroundColor: '#E8F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  cell: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    opacity: 0.5,
  },
  cellCalled: {
    opacity: 1,
    borderColor: '#FFC107',
    backgroundColor: '#FFF9E6',
  },
  cellCompleted: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
    opacity: 1,
  },
  cellNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#CCC',
    marginBottom: 2,
  },
  cellNumberCalled: {
    color: '#FFC107',
  },
  cellName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CCC',
    textAlign: 'center',
  },
  cellNameCalled: {
    color: '#1A1A1A',
  },
  cellReps: {
    fontSize: 8,
    color: '#CCC',
    marginTop: 2,
  },
  cellRepsCalled: {
    color: '#888',
  },
  checkmark: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '800',
    position: 'absolute',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 20,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00B8A9',
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00B8A9',
    marginTop: 4,
  },
  xpCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
  xpValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00B8A9',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#00B8A9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
