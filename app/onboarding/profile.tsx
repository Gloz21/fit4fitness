import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateCalories, userStore } from '../lib/userStore';

const genders = ['Male', 'Female', 'Other'];
const activities = ['Sedentary', 'Light (1–3x/week)', 'Moderate (3–5x/week)', 'Very Active (5–7x/week)'];
const goals = ['weight-loss', 'muscle-gain', 'performance', 'recomposition'];

export default function ProfileScreen() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [targetWeightLbs, setTargetWeightLbs] = useState('');
  const [activity, setActivity] = useState('');
  const [targetDays, setTargetDays] = useState('');
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);
  const [debugMsg, setDebugMsg] = useState('');
  const [targetWeightError, setTargetWeightError] = useState('');
  const router = useRouter();

  // Get the goal from userStore that was set in the goal screen
  const goal = userStore.getState().goal || 'weight-loss';

  // Validation helpers
  const isValidHeight = () => {
    const ft = parseInt(heightFt);
    const inch = parseInt(heightIn || '0');
    return ft > 0 && ft < 8 && inch >= 0 && inch < 12;
  };
  const isValidWeight = () => {
    const w = parseInt(weightLbs);
    return w > 50 && w < 700;
  };
  const isValidTargetWeight = () => {
    const w = parseInt(targetWeightLbs);
    return w > 50 && w < 700;
  };
  const isGoalWeightAligned = () => {
    const w = parseInt(weightLbs);
    const tw = parseInt(targetWeightLbs);
    if (!weightLbs || !targetWeightLbs || isNaN(w) || isNaN(tw)) return true;
    if (goal === 'weight-loss') return tw < w;
    if (goal === 'muscle-gain' || goal === 'weight-gain') return tw > w;
    if (goal === 'recomposition') return tw !== w;
    return true;
  };
  const canContinue = age && gender && heightFt && weightLbs && targetWeightLbs && activity && targetDays && isValidHeight() && isValidWeight() && isValidTargetWeight() && isGoalWeightAligned();
  const isUnrealisticGoal = () => {
    const w = parseInt(weightLbs);
    const tw = parseInt(targetWeightLbs);
    const days = parseInt(targetDays);
    if (!weightLbs || !targetWeightLbs || !targetDays || isNaN(w) || isNaN(tw) || isNaN(days) || days < 1) return false;
    const poundsToLose = w - tw;
    const poundsToGain = tw - w;
    // Safe rate: max 2 lbs/week for loss, 1.5 lbs/week for gain
    const weeks = days / 7;
    if (goal === 'weight-loss' && poundsToLose > 0) {
      const rate = poundsToLose / weeks;
      return rate > 2;
    }
    if ((goal === 'muscle-gain' || goal === 'weight-gain') && poundsToGain > 0) {
      const rate = poundsToGain / weeks;
      return rate > 1.5;
    }
    return false;
  };

  useEffect(() => {
    // Live error for target weight/goal alignment
    const w = parseInt(weightLbs);
    const tw = parseInt(targetWeightLbs);
    let error = '';
    if (weightLbs && targetWeightLbs && !isNaN(w) && !isNaN(tw)) {
      if (goal === 'weight-loss' && tw >= w) {
        error = 'For weight loss, your target weight must be less than your current weight.';
      } else if ((goal === 'muscle-gain' || goal === 'weight-gain') && tw <= w) {
        error = 'For muscle/weight gain, your target weight must be greater than your current weight.';
      } else if (goal === 'recomposition' && tw === w) {
        error = 'For body recomposition, your target weight should differ from your current weight.';
      }
    }
    setTargetWeightError(error);
    if (canContinue) {
      const heightCm = parseInt(heightFt) * 30.48 + (parseInt(heightIn || '0') * 2.54);
      const weightKg = parseInt(weightLbs) * 0.453592;
      const targetWeightKg = parseInt(targetWeightLbs) * 0.453592;
      const calories = calculateCalories(
        weightKg,
        heightCm,
        parseInt(age),
        gender,
        activity,
        goal,
        targetWeightKg,
        parseInt(targetDays)
      );
      setCalculatedCalories(calories);
    } else {
      setCalculatedCalories(null);
    }
  }, [age, gender, heightFt, heightIn, weightLbs, targetWeightLbs, activity, goal, targetDays, canContinue]);

  const getGoalLabel = (selectedGoal: string): string => {
    switch (selectedGoal) {
      case 'weight-loss':
        return 'Weight Loss';
      case 'muscle-gain':
        return 'Muscle Gain';
      case 'performance':
        return 'Performance';
      case 'recomposition':
        return 'Body Recomposition';
      default:
        return 'Weight Loss';
    }
  };

  const getGoalContext = (selectedGoal: string, calories: number): string => {
    // Calculate the actual surplus/deficit for all goals, using target weight if provided
    const w = parseInt(weightLbs);
    const tw = parseInt(targetWeightLbs);
    const hFt = parseInt(heightFt);
    const hIn = parseInt(heightIn || '0');
    const hCm = hFt * 30.48 + hIn * 2.54;
    const a = parseInt(age);
    const g = gender;
    const act = activity;
    const days = parseInt(targetDays);
    if (!w || !hCm || !a || !g || !act) return '';
    const weightKg = w * 0.453592;
    const targetWeightKg = tw * 0.453592;
    // Calculate BMR
    let bmr = 0;
    if (g === 'Female') {
      bmr = 10 * weightKg + 6.25 * hCm - 5 * a - 161;
    } else {
      bmr = 10 * weightKg + 6.25 * hCm - 5 * a + 5;
    }
    // Activity multiplier
    let activityMultiplier = 1.2;
    switch (act) {
      case 'Sedentary': activityMultiplier = 1.2; break;
      case 'Light (1–3x/week)': activityMultiplier = 1.375; break;
      case 'Moderate (3–5x/week)': activityMultiplier = 1.55; break;
      case 'Very Active (5–7x/week)': activityMultiplier = 1.725; break;
    }
    const tdee = bmr * activityMultiplier;
    // If no target weight or days, just show maintenance/surplus/deficit from current
    if (!tw || !days || tw === w) {
      const diff = Math.round(calories - tdee);
      if (diff === 0) {
        return 'Maintenance';
      } else if (diff < 0) {
        return `${Math.abs(diff)} cal deficit`;
      } else {
        return `${diff} cal surplus`;
      }
    }
    // If target weight and days are set, show the actual daily adjustment
    const weightDifferenceKg = targetWeightKg - weightKg;
    const totalCalorieDifference = weightDifferenceKg * 7700;
    const dailyAdjustment = Math.round(totalCalorieDifference / days);
    if (dailyAdjustment === 0) {
      return 'Maintenance';
    } else if (dailyAdjustment < 0) {
      return `${Math.abs(dailyAdjustment)} cal deficit`;
    } else {
      return `${dailyAdjustment} cal surplus`;
    }
  };

  const onContinue = async () => {
    // Validation error messages
    if (!age || !gender || !heightFt || !weightLbs || !targetWeightLbs || !activity || !targetDays) {
      setDebugMsg('Please fill out all fields.');
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      setDebugMsg('Please enter a realistic age (10-120 years).');
      return;
    }
    if (!isValidHeight()) {
      setDebugMsg('Please enter a realistic height (ft < 8, in < 12).');
      return;
    }
    if (!isValidWeight() || !isValidTargetWeight()) {
      setDebugMsg('Please enter a realistic weight (50-700 lbs).');
      return;
    }
    if (!isGoalWeightAligned()) {
      if (goal === 'weight-loss') {
        setDebugMsg('For weight loss, your target weight must be less than your current weight.');
      } else if (goal === 'muscle-gain' || goal === 'weight-gain') {
        setDebugMsg('For muscle/weight gain, your target weight must be greater than your current weight.');
      } else if (goal === 'recomposition') {
        setDebugMsg('For body recomposition, your target weight should differ from your current weight.');
      } else {
        setDebugMsg('Your target weight does not match your selected goal.');
      }
      return;
    }
    if (isUnrealisticGoal()) {
      setDebugMsg('Your goal is too aggressive. Please choose a safer rate (max 2 lbs/week for loss, 1.5 lbs/week for gain).');
      return;
    }
    setDebugMsg('');
    const heightCm = (parseInt(heightFt) * 30.48 + (parseInt(heightIn || '0') * 2.54)).toFixed(0);
    const weightKg = (parseInt(weightLbs) * 0.453592).toFixed(1);
    const targetWeightKg = (parseInt(targetWeightLbs) * 0.453592).toFixed(1);
    
    console.log('🟢 Setting profile:', { heightCm, weightKg, targetWeightKg });
    userStore.setProfile({
      age: parseInt(age),
      gender,
      heightCm: parseFloat(heightCm),
      weightKg: parseFloat(weightKg),
      targetWeightKg: parseFloat(targetWeightKg),
      activity,
      targetDays: parseInt(targetDays),
    });
    
    console.log('🟢 Completing onboarding...');
    userStore.completeOnboarding();
    
    // Wait longer for the database save to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Force re-hydrate to confirm data was saved
    await userStore.hydrate(true);
    const finalState = userStore.getState();
    console.log('🟢 After re-hydrate, state:', finalState);
    
    // Navigate to home
    router.replace('/(tabs)');
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E8E8E8' }} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Your Information</Text>
        <Text style={styles.subtitle}>This helps us create your personalized plan.</Text>

        {debugMsg ? <Text style={styles.debugMsg}>{debugMsg}</Text> : null}

        <View style={styles.row}>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="25"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              autoComplete="off"
              textContentType="oneTimeCode"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
        </View>

        <View style={styles.selectorBlock}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipWrap}>
            {genders.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, gender === g && styles.chipActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Height (ft)</Text>
            <TextInput
              style={styles.input}
              placeholder="5"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              value={heightFt}
              onChangeText={setHeightFt}
              autoComplete="off"
              textContentType="oneTimeCode"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>In</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              value={heightIn}
              onChangeText={setHeightIn}
              autoComplete="off"
              textContentType="oneTimeCode"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Current Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              placeholder="170"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              value={weightLbs}
              onChangeText={setWeightLbs}
              autoComplete="off"
              textContentType="oneTimeCode"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Target Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              placeholder="155"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              value={targetWeightLbs}
              onChangeText={setTargetWeightLbs}
              autoComplete="off"
              textContentType="oneTimeCode"
              autoCorrect={false}
              spellCheck={false}
            />
            {targetWeightError ? (
              <Text style={{ color: 'red', marginTop: 4, fontSize: 13 }}>{targetWeightError}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.selectorBlock}>
          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.chipWrap}>
            {activities.map((act) => (
              <TouchableOpacity
                key={act}
                style={[styles.chip, styles.chipWide, activity === act && styles.chipActive]}
                onPress={() => setActivity(act)}
              >
                <Text style={[styles.chipText, activity === act && styles.chipTextActive]}>{act}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Target (days)</Text>
            <TextInput
              style={styles.input}
              placeholder="90"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              value={targetDays}
              onChangeText={setTargetDays}
              autoComplete="off"
              textContentType="oneTimeCode"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
        </View>

        {calculatedCalories !== null && (
          <View style={styles.calorieCard}>
            <Text style={styles.calorieLabel}>Your Personalized Calorie Target</Text>
            <Text style={styles.calorieValue}>{calculatedCalories} cal/day</Text>
            <Text style={styles.calorieContext}>
              {getGoalLabel(goal)} • {getGoalContext(goal, calculatedCalories)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryCta, !canContinue && styles.primaryCtaDisabled]}
          disabled={!canContinue}
          onPress={onContinue}
        >
          <Text style={styles.primaryCtaText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  scroll: {
    padding: 24,
    paddingBottom: 48,
    gap: 16,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B8A9',
    marginBottom: 8,
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
  debugMsg: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputBlock: {
    flex: 1,
    gap: 6,
  },
  fullWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  selectorBlock: {
    gap: 8,
  },
  calorieCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00B8A9',
    gap: 6,
  },
  calorieLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A4A4A',
    textTransform: 'uppercase',
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00B8A9',
  },
  calorieContext: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    backgroundColor: '#FFF',
  },
  chipWide: {
    paddingHorizontal: 16,
  },
  chipActive: {
    borderColor: '#00B8A9',
    backgroundColor: '#F0FFFE',
  },
  chipText: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#00B8A9',
  },
  primaryCta: {
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
