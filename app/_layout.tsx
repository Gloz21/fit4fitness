import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { authStore } from './lib/authStore';
import { nutritionStore } from './lib/nutritionStore';
import { soundStore } from './lib/soundStore';
import { userStore } from './lib/userStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Hydrate stores on app startup
  useEffect(() => {
    // Always hydrate sound store for background music
    soundStore.hydrate();
    
    const userId = authStore.getCurrentUserId();
    if (userId) {
      console.log('🔵 App startup - hydrating stores for userId:', userId);
      userStore.hydrate(true);
      nutritionStore.hydrate(true);
    }
  }, []);

  return (
    <SafeAreaProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </SafeAreaProvider>
  );
}
