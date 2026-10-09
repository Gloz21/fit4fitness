import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ACTIVITY_LEVELS, ActivityGuide } from '@/components/activity-guide';
import { UnitToggle } from '@/components/unit-toggle';
import { cmToFeetInches, displayToKg, feetInchesToCm, getUnits, kgToDisplay, UnitSystem, weightUnitFor } from '../lib/units';
import { calculateBMR, calculateCalories, getActivityMultiplier, userStore } from '../lib/userStore';

const genders = ['Male', 'Female', 'Other'];
const activities = ACTIVITY_LEVELS.map((l) => l.value);
const goals = ['weight-loss', 'muscle-gain', 'performance', 'recomposition'];

export default function ProfileScreen() {
  const [units, setUnitsLocal] = useState<UnitSystem>(getUnits());
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [heightCmText, setHeightCmText] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [activity, setActivity] = useState('');
  const [activityGuideVisible, setActivityGuideVisible] = useState(false);
  const [targetDays, setTargetDays] = useState('');
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);
  const [debugMsg, setDebugMsg] = useState('');
  const [targetWeightError, setTargetWeightError] = useState('');
  const router = useRouter();

  const goal = userStore.getState().goal || 'weight-loss';
  const wUnit = weightUnitFor(units);

  // Everything below works in metric (cm / kg) regardless of what the user typed in.
  const heightCm =
    units === 'metric'
      ? parseFloat(heightCmText)
      : heightFt
        ? feetInchesToCm(parseInt(heightFt), parseInt(heightIn || '0'))
        : NaN;
  const weightKg = weight ? displayToKg(parseFloat(weight), units) : NaN;
  const targetWeightKg = targetWeight ? displayToKg(parseFloat(targetWeight), units) : NaN;

  const switchUnits = (next: UnitSystem) => {
    if (next === units) return;
    if (next === 'metric') {
      if (!isNaN(heightCm)) setHeightCmText(String(Math.round(heightCm)));
    } else if (!isNaN(heightCm)) {
      const { ft, inch } = cmToFeetInches(heightCm);
      setHeightFt(String(ft));
      setHeightIn(String(inch));
    }
    if (!isNaN(weightKg)) setWeight(kgToDisplay(weightKg, next).toFixed(next === 'metric' ? 1 : 0));
    if (!isNaN(targetWeightKg)) setTargetWeight(kgToDisplay(targetWeightKg, next).toFixed(next === 'metric' ? 1 : 0));
    setUnitsLocal(next);
  };

  const isValidHeight = () => {
    if (units === 'metric') return heightCm > 90 && heightCm < 245;
    const ft = parseInt(heightFt);
    const inch = parseInt(heightIn || '0');
    return ft > 0 && ft < 8 && inch >= 0 && inch < 12;
  };
  // 50–700 lbs ≈ 23–318 kg
  const isValidKg = (kg: number) => kg > 22.6 && kg < 318;
  const isValidWeight = () => isValidKg(weightKg);
  const isValidTargetWeight = () => isValidKg(targetWeightKg);
  const isGoalWeightAligned = () => {
    if (isNaN(weightKg) || isNaN(targetWeightKg)) return true;
    if (goal === 'weight-loss') return targetWeightKg < weightKg;
    if (goal === 'muscle-gain' || goal === 'weight-gain') return targetWeightKg > weightKg;
    if (goal === 'recomposition') return targetWeightKg !== weightKg;
    return true;
  };
  const hasHeight = units === 'metric' ? !!heightCmText : !!heightFt;
  const canContinue = !!(age && gender && hasHeight && weight && targetWeight && activity && targetDays && isValidHeight() && isValidWeight() && isValidTargetWeight() && isGoalWeightAligned());

  const isUnrealisticGoal = () => {
    const days = parseInt(targetDays);
    if (isNaN(weightKg) || isNaN(targetWeightKg) || isNaN(days) || days < 1) return false;
    // Safe rate: max 2 lbs/week for loss, 1.5 lbs/week for gain
    const diffLbs = (targetWeightKg - weightKg) * 2.20462;
    const weeks = days / 7;
    if (goal === 'weight-loss' && diffLbs < 0) return -diffLbs / weeks > 2;
    if ((goal === 'muscle-gain' || goal === 'weight-gain') && diffLbs > 0) return diffLbs / weeks > 1.5;
    return false;
  };

  useEffect(() => {
    let error = '';
    if (!isNaN(weightKg) && !isNaN(targetWeightKg)) {
      if (goal === 'weight-loss' && targetWeightKg >= weightKg) {
        error = 'For weight loss, your target weight must be less than your current weight.';
      } else if ((goal === 'muscle-gain' || goal === 'weight-gain') && targetWeightKg <= weightKg) {
        error = 'For muscle/weight gain, your target weight must be greater than your current weight.';
      } else if (goal === 'recomposition' && targetWeightKg === weightKg) {
        error = 'For body recomposition, your target weight should differ from your current weight.';
      }
    }
    setTargetWeightError(error);
    if (canContinue) {
      setCalculatedCalories(
        calculateCalories(weightKg, heightCm, parseInt(age), gender, activity, goal, targetWeightKg, parseInt(targetDays))
      );
    } else {
      setCalculatedCalories(null);
    }
  }, [age, gender, heightCm, weightKg, targetWeightKg, activity, goal, targetDays, canContinue]);

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

  const getGoalContext = (calories: number): string => {
    const a = parseInt(age);
    const days = parseInt(targetDays);
    if (isNaN(weightKg) || isNaN(heightCm) || !a || !gender || !activity) return '';
    const bmr = calculateBMR(weightKg, heightCm, a, gender);
    const tdee = bmr * getActivityMultiplier(activity);
    if (isNaN(targetWeightKg) || !days || targetWeightKg === weightKg) {
      const diff = Math.round(calories - tdee);
      if (diff === 0) return 'Maintenance';
      return diff < 0 ? `${Math.abs(diff)} cal deficit` : `${diff} cal surplus`;
    }
    const dailyAdjustment = Math.round(((targetWeightKg - weightKg) * 7700) / days);
    if (dailyAdjustment === 0) return 'Maintenance';
    return dailyAdjustment < 0 ? `${Math.abs(dailyAdjustment)} cal deficit` : `${dailyAdjustment} cal surplus`;
  };

  const onContinue = async () => {
    if (!age || !gender || !hasHeight || !weight || !targetWeight || !activity || !targetDays) {
      setDebugMsg('Please fill out all fields.');
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      setDebugMsg('Please enter a realistic age (10-120 years).');
      return;
    }
    if (!isValidHeight()) {
      setDebugMsg(units === 'metric' ? 'Please enter a realistic height (90–245 cm).' : 'Please enter a realistic height (ft < 8, in < 12).');
      return;
    }
    if (!isValidWeight() || !isValidTargetWeight()) {
      setDebugMsg(units === 'metric' ? 'Please enter a realistic weight (23–318 kg).' : 'Please enter a realistic weight (50–700 lbs).');
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
      setDebugMsg(
        units === 'metric'
          ? 'Your goal is too aggressive. Please choose a safer rate (max 0.9 kg/week for loss, 0.7 kg/week for gain).'
          : 'Your goal is too aggressive. Please choose a safer rate (max 2 lbs/week for loss, 1.5 lbs/week for gain).'
      );
      return;
    }
    setDebugMsg('');

    userStore.setProfile({
      age: ageNum,
      gender,
      heightCm: Math.round(heightCm),
      weightKg: Math.round(weightKg * 10) / 10,
      targetWeightKg: Math.round(targetWeightKg * 10) / 10,
      activity,
      targetDays: parseInt(targetDays),
      units,
    });

    userStore.completeOnboarding();

    // Wait for the database save to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    await userStore.hydrate(true);

    router.replace('/(tabs)');
  };

  const numericInputProps = {
    placeholderTextColor: '#888',
    autoComplete: 'off' as const,
    textContentType: 'oneTimeCode' as const,
    autoCorrect: false,
    spellCheck: false,
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

        <View style={styles.selectorBlock}>
          <Text style={styles.label}>Units</Text>
          <UnitToggle value={units} onChange={switchUnits} />
        </View>

        <View style={styles.row}>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Age</Text>
            <TextInput style={styles.input} placeholder="25" keyboardType="number-pad" value={age} onChangeText={setAge} {...numericInputProps} />
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

        {units === 'metric' ? (
          <View style={styles.row}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput style={styles.input} placeholder="178" keyboardType="number-pad" value={heightCmText} onChangeText={setHeightCmText} {...numericInputProps} />
            </View>
          </View>
        ) : (
          <View style={styles.row}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Height (ft)</Text>
              <TextInput style={styles.input} placeholder="5" keyboardType="number-pad" value={heightFt} onChangeText={setHeightFt} {...numericInputProps} />
            </View>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>In</Text>
              <TextInput style={styles.input} placeholder="10" keyboardType="number-pad" value={heightIn} onChangeText={setHeightIn} {...numericInputProps} />
            </View>
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Current Weight ({wUnit})</Text>
            <TextInput
              style={styles.input}
              placeholder={units === 'metric' ? '77' : '170'}
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
              {...numericInputProps}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Target Weight ({wUnit})</Text>
            <TextInput
              style={styles.input}
              placeholder={units === 'metric' ? '70' : '155'}
              keyboardType="decimal-pad"
              value={targetWeight}
              onChangeText={setTargetWeight}
              {...numericInputProps}
            />
            {targetWeightError ? (
              <Text style={{ color: 'red', marginTop: 4, fontSize: 13 }}>{targetWeightError}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.selectorBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Activity Level</Text>
            <TouchableOpacity onPress={() => setActivityGuideVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.helpLink}>Not sure? Find your level</Text>
            </TouchableOpacity>
          </View>
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
            <TextInput style={styles.input} placeholder="90" keyboardType="number-pad" value={targetDays} onChangeText={setTargetDays} {...numericInputProps} />
          </View>
        </View>

        {calculatedCalories !== null && (
          <View style={styles.calorieCard}>
            <Text style={styles.calorieLabel}>Your Personalized Calorie Target</Text>
            <Text style={styles.calorieValue}>{calculatedCalories} cal/day</Text>
            <Text style={styles.calorieContext}>
              {getGoalLabel(goal)} • {getGoalContext(calculatedCalories)}
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
    <ActivityGuide
      visible={activityGuideVisible}
      onClose={() => setActivityGuideVisible(false)}
      onSelect={setActivity}
    />
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00B8A9',
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
