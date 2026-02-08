import { authStore } from '@/app/lib/authStore';
import { nutritionStore } from '@/app/lib/nutritionStore';
import { userStore } from '@/app/lib/userStore';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const validateInputs = () => {
    setError('');
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    
    return true;
  };

  const onSignUp = async () => {
    if (!validateInputs()) return;

    const result = await authStore.signup(username, password);
    if (!result.success) {
      setError(result.error || 'Sign up failed.');
      return;
    }
    
    // Load user stores
    await userStore.hydrate();
    await nutritionStore.hydrate();
    
    router.replace('/onboarding/goal');
  };

  const isValid = username.length >= 3 && password.length >= 6 && password === confirmPassword;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E8E8E8' }} edges={['top', 'bottom']}>
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Set up your Fit4Fitness account to start your journey.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="off"
            textContentType="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="off"
            textContentType="oneTimeCode"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            maxLength={20}
            autoComplete="off"
            textContentType="oneTimeCode"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryCta, !isValid && styles.primaryCtaDisabled]}
          disabled={!isValid}
          onPress={onSignUp}
        >
          <Text style={styles.primaryCtaText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/auth/signin')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
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
  scroll: {
    padding: 24,
    paddingBottom: 48,
    gap: 16,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B8A9',
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
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#FDE8E8',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  inputGroup: {
    gap: 6,
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
  inputHint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B8A9',
  },
});
