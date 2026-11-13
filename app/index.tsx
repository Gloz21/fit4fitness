import { ThemedView } from '@/components/themed-view';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authStore } from './lib/authStore';
import { userStore } from './lib/userStore';

export default function StarterScreen() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  // Still signed in from last time? Skip the welcome screen.
  useEffect(() => {
    let active = true;
    (async () => {
      await authStore.hydrate();
      if (!active) return;
      if (authStore.isLoggedIn()) {
        await userStore.hydrate(true);
        if (!active) return;
        const { onboardingComplete, goal, profile } = userStore.getState();
        router.replace(onboardingComplete || (goal && profile?.weightKg) ? '/(tabs)' : '/onboarding/goal');
        return;
      }
      setCheckingSession(false);
    })();
    return () => {
      active = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (checkingSession) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#00B8A9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E8E8E8' }} edges={['top', 'bottom']}>
    <ThemedView style={styles.screen}>
      <View style={styles.container}>
        <Image 
          source={require('@/assets/images/photo1.png')}
          style={styles.logoPlaceholder}
          resizeMode="cover"
        />

        <Text style={styles.brand}>Fit4Fitness</Text>
        <Text style={styles.tagline}>Learn why you train. Reach your goals.</Text>

        <View style={styles.ctaContainer}>
          <Link href="/auth/signup" asChild>
            <TouchableOpacity style={styles.primaryCta}>
              <Text style={styles.primaryCtaText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/auth/signin" asChild>
            <TouchableOpacity style={styles.secondaryCta}>
              <Text style={styles.secondaryCtaText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
    gap: 16,
  },
  logoPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#00B8A9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 50,
  },
  brand: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaContainer: {
    gap: 12,
    width: '100%',
    marginTop: 12,
  },
  primaryCta: {
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryCtaText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryCta: {
    borderColor: '#00B8A9',
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryCtaText: {
    color: '#00B8A9',
    fontWeight: '800',
    fontSize: 16,
  },
});
