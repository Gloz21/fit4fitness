import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Custom Slider component that works on both web and native
function CustomSlider({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step,
  minimumTrackTintColor,
}: {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
  minimumTrackTintColor: string;
}) {
  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
  
  const handleIncrement = () => {
    const newValue = Math.min(value + step, maximumValue);
    onValueChange(newValue);
  };
  
  const handleDecrement = () => {
    const newValue = Math.max(value - step, minimumValue);
    onValueChange(newValue);
  };
  
  return (
    <View style={sliderStyles.container}>
      <TouchableOpacity onPress={handleDecrement} style={sliderStyles.button}>
        <Text style={sliderStyles.buttonText}>−</Text>
      </TouchableOpacity>
      <View style={sliderStyles.track}>
        <View 
          style={[
            sliderStyles.fill, 
            { width: `${percentage}%`, backgroundColor: minimumTrackTintColor }
          ]} 
        />
      </View>
      <TouchableOpacity onPress={handleIncrement} style={sliderStyles.button}>
        <Text style={sliderStyles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 40,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

interface SorenessTrackerProps {
  // Current values from stores
  waterGlasses: number;
  proteinGrams: number;
  proteinTarget: number;
  sleepHours: number;
  workoutMinutesToday: number;
  workoutsThisWeek: number;
  workoutVolumeToday: number; // Total volume (weight x reps) for today
}

// Calculate soreness score (0-100, lower is better)
function calculateSoreness(params: {
  waterGlasses: number;
  proteinGrams: number;
  proteinTarget: number;
  sleepHours: number;
  workoutMinutesToday: number;
  workoutsThisWeek: number;
  workoutVolumeToday: number;
}): { score: number; factors: { name: string; impact: number; status: 'good' | 'warning' | 'bad' }[] } {
  const { waterGlasses, proteinGrams, proteinTarget, sleepHours, workoutMinutesToday, workoutsThisWeek, workoutVolumeToday } = params;
  
  let sorenessScore = 50; // Base score
  const factors: { name: string; impact: number; status: 'good' | 'warning' | 'bad' }[] = [];
  
  // WATER IMPACT (8 glasses is optimal)
  // Less water = more soreness, dehydration impairs recovery
  const waterOptimal = 8;
  if (waterGlasses >= waterOptimal) {
    const waterBonus = Math.min((waterGlasses - waterOptimal) * 1, 5); // Slight extra benefit
    sorenessScore -= (15 + waterBonus); // Well hydrated reduces soreness
    factors.push({ name: 'Hydration', impact: -(15 + waterBonus), status: 'good' });
  } else if (waterGlasses >= 5) {
    sorenessScore -= 5; // Moderate hydration
    factors.push({ name: 'Hydration', impact: -5, status: 'warning' });
  } else if (waterGlasses >= 2) {
    sorenessScore += 10; // Low hydration increases soreness
    factors.push({ name: 'Hydration', impact: 10, status: 'bad' });
  } else {
    sorenessScore += 20; // Very dehydrated
    factors.push({ name: 'Hydration', impact: 20, status: 'bad' });
  }
  
  // PROTEIN IMPACT (hitting target is optimal)
  // Protein helps muscle repair - missing target = more soreness
  const proteinRatio = proteinTarget > 0 ? proteinGrams / proteinTarget : 0;
  if (proteinRatio >= 1) {
    sorenessScore -= 15; // Hit protein goal
    factors.push({ name: 'Protein', impact: -15, status: 'good' });
  } else if (proteinRatio >= 0.8) {
    sorenessScore -= 8; // Close to goal
    factors.push({ name: 'Protein', impact: -8, status: 'warning' });
  } else if (proteinRatio >= 0.5) {
    sorenessScore += 5; // Under goal
    factors.push({ name: 'Protein', impact: 5, status: 'warning' });
  } else {
    sorenessScore += 15; // Way under goal
    factors.push({ name: 'Protein', impact: 15, status: 'bad' });
  }
  
  // SLEEP IMPACT (7-9 hours is optimal)
  // Sleep is crucial for recovery
  if (sleepHours >= 7 && sleepHours <= 9) {
    sorenessScore -= 20; // Optimal sleep
    factors.push({ name: 'Sleep', impact: -20, status: 'good' });
  } else if (sleepHours >= 6) {
    sorenessScore -= 5; // Decent sleep
    factors.push({ name: 'Sleep', impact: -5, status: 'warning' });
  } else if (sleepHours >= 4) {
    sorenessScore += 15; // Poor sleep
    factors.push({ name: 'Sleep', impact: 15, status: 'bad' });
  } else {
    sorenessScore += 25; // Very poor sleep
    factors.push({ name: 'Sleep', impact: 25, status: 'bad' });
  }
  
  // WORKOUT VOLUME IMPACT
  // More workout time = more soreness (but it's expected)
  if (workoutMinutesToday > 90) {
    sorenessScore += 20; // Heavy workout day
    factors.push({ name: 'Today\'s Workout', impact: 20, status: 'warning' });
  } else if (workoutMinutesToday > 60) {
    sorenessScore += 15; // Solid workout
    factors.push({ name: 'Today\'s Workout', impact: 15, status: 'warning' });
  } else if (workoutMinutesToday > 30) {
    sorenessScore += 10; // Moderate workout
    factors.push({ name: 'Today\'s Workout', impact: 10, status: 'warning' });
  } else if (workoutMinutesToday > 0) {
    sorenessScore += 5; // Light workout
    factors.push({ name: 'Today\'s Workout', impact: 5, status: 'good' });
  } else {
    // Rest day - helps recovery
    sorenessScore -= 5;
    factors.push({ name: 'Rest Day', impact: -5, status: 'good' });
  }
  
  // WORKOUT VOLUME IMPACT (weight x reps)
  // Higher volume = more muscle damage = more soreness
  if (workoutVolumeToday > 20000) {
    sorenessScore += 20; // Very high volume workout
    factors.push({ name: 'Workout Volume', impact: 20, status: 'bad' });
  } else if (workoutVolumeToday > 10000) {
    sorenessScore += 12; // High volume workout
    factors.push({ name: 'Workout Volume', impact: 12, status: 'warning' });
  } else if (workoutVolumeToday > 5000) {
    sorenessScore += 7; // Moderate volume
    factors.push({ name: 'Workout Volume', impact: 7, status: 'warning' });
  } else if (workoutVolumeToday > 1000) {
    sorenessScore += 3; // Light volume
    factors.push({ name: 'Workout Volume', impact: 3, status: 'good' });
  } else if (workoutVolumeToday > 0) {
    sorenessScore += 1; // Very light
    factors.push({ name: 'Workout Volume', impact: 1, status: 'good' });
  }
  // No factor added if 0 volume (rest day already shown)
  
  // WEEKLY VOLUME IMPACT
  // Training frequency affects accumulated fatigue
  if (workoutsThisWeek >= 6) {
    sorenessScore += 15; // Overtraining risk
    factors.push({ name: 'Weekly Frequency', impact: 15, status: 'bad' });
  } else if (workoutsThisWeek >= 4) {
    sorenessScore += 5; // High but manageable
    factors.push({ name: 'Weekly Frequency', impact: 5, status: 'warning' });
  } else if (workoutsThisWeek >= 2) {
    // Balanced training
    factors.push({ name: 'Weekly Frequency', impact: 0, status: 'good' });
  } else {
    sorenessScore -= 5; // Plenty of rest
    factors.push({ name: 'Weekly Frequency', impact: -5, status: 'good' });
  }
  
  // Clamp score between 0-100
  sorenessScore = Math.max(0, Math.min(100, sorenessScore));
  
  return { score: sorenessScore, factors };
}

function getSorenessLevel(score: number): { label: string; emoji: string; color: string } {
  if (score <= 20) return { label: 'Minimal', emoji: '😊', color: '#00C853' };
  if (score <= 40) return { label: 'Low', emoji: '🙂', color: '#4CAF50' };
  if (score <= 55) return { label: 'Moderate', emoji: '😐', color: '#FFC107' };
  if (score <= 70) return { label: 'High', emoji: '😣', color: '#FF9800' };
  if (score <= 85) return { label: 'Very High', emoji: '😫', color: '#FF5722' };
  return { label: 'Severe', emoji: '🥴', color: '#F44336' };
}

export default function SorenessTracker({
  waterGlasses,
  proteinGrams,
  proteinTarget,
  sleepHours,
  workoutMinutesToday,
  workoutsThisWeek,
  workoutVolumeToday,
}: SorenessTrackerProps) {
  const [simulatorVisible, setSimulatorVisible] = useState(false);
  
  // Simulator values (what-if)
  const [simWater, setSimWater] = useState(waterGlasses);
  const [simProtein, setSimProtein] = useState(proteinGrams);
  const [simSleep, setSimSleep] = useState(sleepHours);
  const [simWorkoutMins, setSimWorkoutMins] = useState(workoutMinutesToday);
  const [simVolume, setSimVolume] = useState(workoutVolumeToday);
  
  // Reset simulator when opening
  useEffect(() => {
    if (simulatorVisible) {
      setSimWater(waterGlasses);
      setSimProtein(proteinGrams);
      setSimSleep(sleepHours);
      setSimWorkoutMins(workoutMinutesToday);
      setSimVolume(workoutVolumeToday);
    }
  }, [simulatorVisible, waterGlasses, proteinGrams, sleepHours, workoutMinutesToday, workoutVolumeToday]);
  
  // Current soreness
  const current = calculateSoreness({
    waterGlasses,
    proteinGrams,
    proteinTarget,
    sleepHours,
    workoutMinutesToday,
    workoutsThisWeek,
    workoutVolumeToday,
  });
  const currentLevel = getSorenessLevel(current.score);
  
  // Simulated soreness
  const simulated = calculateSoreness({
    waterGlasses: simWater,
    proteinGrams: simProtein,
    proteinTarget,
    sleepHours: simSleep,
    workoutMinutesToday: simWorkoutMins,
    workoutsThisWeek,
    workoutVolumeToday: simVolume,
  });
  const simulatedLevel = getSorenessLevel(simulated.score);
  
  const scoreDiff = simulated.score - current.score;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💪 Soreness Predictor</Text>
        <TouchableOpacity 
          style={styles.simulateButton}
          onPress={() => setSimulatorVisible(true)}
        >
          <Text style={styles.simulateButtonText}>What If? 🔮</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: currentLevel.color }]}>
          <Text style={styles.scoreEmoji}>{currentLevel.emoji}</Text>
          <Text style={[styles.scoreValue, { color: currentLevel.color }]}>{Math.round(current.score)}</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={[styles.scoreLabel, { color: currentLevel.color }]}>{currentLevel.label} Soreness</Text>
          <Text style={styles.scoreDescription}>
            Based on your hydration, protein, sleep & workout volume
          </Text>
        </View>
      </View>
      
      {/* Factor breakdown */}
      <View style={styles.factorsContainer}>
        <Text style={styles.factorsTitle}>Recovery Factors</Text>
        {current.factors.map((factor, index) => (
          <View key={index} style={styles.factorRow}>
            <View style={[styles.factorIndicator, { 
              backgroundColor: factor.status === 'good' ? '#00C853' : 
                              factor.status === 'warning' ? '#FFC107' : '#F44336' 
            }]} />
            <Text style={styles.factorName}>{factor.name}</Text>
            <Text style={[styles.factorImpact, {
              color: factor.impact <= 0 ? '#00C853' : '#F44336'
            }]}>
              {factor.impact <= 0 ? '↓' : '↑'} {Math.abs(factor.impact)}
            </Text>
          </View>
        ))}
      </View>
      
      {/* What-If Simulator Modal */}
      <Modal
        visible={simulatorVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSimulatorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔮 What If Simulator</Text>
              <TouchableOpacity onPress={() => setSimulatorVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Adjust values to see how they affect your predicted soreness
            </Text>
            
            {/* Comparison Display */}
            <View style={styles.comparisonContainer}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Current</Text>
                <Text style={[styles.comparisonScore, { color: currentLevel.color }]}>
                  {currentLevel.emoji} {Math.round(current.score)}
                </Text>
              </View>
              <View style={styles.comparisonArrow}>
                <Text style={[styles.arrowText, {
                  color: scoreDiff < 0 ? '#00C853' : scoreDiff > 0 ? '#F44336' : '#888'
                }]}>
                  {scoreDiff < 0 ? '→ Better!' : scoreDiff > 0 ? '→ Worse' : '→ Same'}
                </Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Simulated</Text>
                <Text style={[styles.comparisonScore, { color: simulatedLevel.color }]}>
                  {simulatedLevel.emoji} {Math.round(simulated.score)}
                </Text>
              </View>
            </View>
            
            {/* Sliders */}
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>💧 Water Glasses</Text>
                <Text style={styles.sliderValue}>{simWater} glasses</Text>
              </View>
              <CustomSlider
                minimumValue={0}
                maximumValue={12}
                step={1}
                value={simWater}
                onValueChange={setSimWater}
                minimumTrackTintColor="#2196F3"
              />
            </View>
            
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>🥩 Protein</Text>
                <Text style={styles.sliderValue}>{Math.round(simProtein)}g / {proteinTarget}g</Text>
              </View>
              <CustomSlider
                minimumValue={0}
                maximumValue={proteinTarget * 1.5}
                step={5}
                value={simProtein}
                onValueChange={setSimProtein}
                minimumTrackTintColor="#FF6B6B"
              />
            </View>
            
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>😴 Sleep Hours</Text>
                <Text style={styles.sliderValue}>{simSleep.toFixed(1)} hrs</Text>
              </View>
              <CustomSlider
                minimumValue={0}
                maximumValue={12}
                step={0.5}
                value={simSleep}
                onValueChange={setSimSleep}
                minimumTrackTintColor="#9C27B0"
              />
            </View>
            
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>🏋️ Workout Minutes</Text>
                <Text style={styles.sliderValue}>{simWorkoutMins} min</Text>
              </View>
              <CustomSlider
                minimumValue={0}
                maximumValue={120}
                step={5}
                value={simWorkoutMins}
                onValueChange={setSimWorkoutMins}
                minimumTrackTintColor="#00B8A9"
              />
            </View>
            
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>💪 Workout Volume</Text>
                <Text style={styles.sliderValue}>{simVolume.toLocaleString()} lbs</Text>
              </View>
              <CustomSlider
                minimumValue={0}
                maximumValue={30000}
                step={500}
                value={simVolume}
                onValueChange={setSimVolume}
                minimumTrackTintColor="#FF5722"
              />
            </View>
            
            {/* Tips based on simulation */}
            {scoreDiff < -10 && (
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  💡 Great changes! This could significantly reduce your soreness.
                </Text>
              </View>
            )}
            {scoreDiff > 10 && (
              <View style={[styles.tipBox, { backgroundColor: '#FFF3E0', borderLeftColor: '#FF9800' }]}>
                <Text style={styles.tipText}>
                  ⚠️ These changes may increase soreness. Consider more recovery.
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setSimulatorVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  simulateButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  simulateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  scoreEmoji: {
    fontSize: 24,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  scoreInfo: {
    flex: 1,
    gap: 4,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  factorsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  factorName: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  factorImpact: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  comparisonItem: {
    alignItems: 'center',
    gap: 4,
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#666',
  },
  comparisonScore: {
    fontSize: 24,
    fontWeight: '800',
  },
  comparisonArrow: {
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sliderSection: {
    marginBottom: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B8A9',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  tipBox: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  closeModalButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
