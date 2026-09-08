import { authStore } from '@/app/lib/authStore';
import { nutritionStore } from '@/app/lib/nutritionStore';
import { recipeStore } from '@/app/lib/recipeStore';
import { userStore } from '@/app/lib/userStore';
import { workoutStore } from '@/app/lib/workoutStore';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSignIn = async () => {
    setError('');
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    const result = await authStore.signin(username, password);
    if (!result.success) {
      // More helpful error for user not found
      if (result.error?.includes('not found')) {
        setError('Account not found. This could mean the app data was cleared. Please sign up to create a new account.');
      } else {
        setError(result.error || 'Sign in failed.');
      }
      return;
    }

    // Force fresh hydration of user data
    userStore.invalidate();
    await userStore.hydrate(true);
    await nutritionStore.hydrate(true);
    await recipeStore.forceHydrate();
    await workoutStore.forceHydrate();

    // Check if user has completed onboarding
    // First check the userStore state
    const userState = userStore.getState();
    // Also check AsyncStorage directly as a fallback
    const normalizedUsername = username.toLowerCase().trim();
    let hasCompletedOnboarding = userState.onboardingComplete || (userState.goal && userState.profile?.weightKg);
    // Check AsyncStorage fallback for user-specific data
    if (!hasCompletedOnboarding) {
      try {
        const storedUserData = await AsyncStorage.getItem(`user_${normalizedUsername}_profile`);
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          hasCompletedOnboarding = userData.onboardingComplete || (userData.goal && userData.profile?.weightKg);
        }
      } catch (e) {
        // Ignore AsyncStorage errors
      }
    }
    if (hasCompletedOnboarding) {
      // User has completed onboarding, go to home
      router.replace('/(tabs)');
    } else {
      // User hasn't completed onboarding, send to goal selection
      router.replace('/onboarding/goal');
    }
  };

  const isValid = username.length > 0 && password.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E8E8E8' }} edges={['top', 'bottom']}>
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
          <ScrollView 
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your Fit4Fitness account.</Text>
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
                autoCorrect={false}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="off"
                  autoCorrect={false}
                  textContentType="none"
                  clearTextOnFocus={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.primaryCta, !isValid && styles.primaryCtaDisabled]}
              disabled={!isValid}
              onPress={onSignIn}
            >
              <Text style={styles.primaryCtaText}>Sign In</Text>
            </TouchableOpacity>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/signup')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
    </SafeAreaView>
  );
    }

    const styles = StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: '#F8F8F8',
      },
      scroll: {
        flexGrow: 1,
        padding: 24,
        paddingBottom: 40,
      },
      backButton: {
        fontSize: 18,
        color: '#00B8A9',
        marginBottom: 16,
        fontWeight: '700',
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
      passwordContainer: {
        position: 'relative',
      },
      passwordInput: {
        paddingRight: 48,
      },
      eyeButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        padding: 4,
      },
      eyeIcon: {
        fontSize: 20,
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

