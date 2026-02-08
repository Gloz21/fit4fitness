import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React from 'react';

interface SoundState {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
}

let soundState: SoundState = {
  musicEnabled: false,
  soundEffectsEnabled: true,
};

const listeners: Set<(state: SoundState) => void> = new Set();
let backgroundMusic: Audio.Sound | null = null;

export const soundStore = {
  async hydrate() {
    try {
      const stored = await AsyncStorage.getItem('fitlearn:sound');
      if (stored) {
        soundState = JSON.parse(stored);
      }
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      // Start background music if enabled after hydration
      if (soundState.musicEnabled) {
        await this.playBackgroundMusic();
      }
      this.notify();
    } catch (e) {
      console.error('Failed to hydrate sound state:', e);
    }
  },

  async toggleMusic(): Promise<void> {
    soundState.musicEnabled = !soundState.musicEnabled;
    
    if (!soundState.musicEnabled) {
      await this.stopBackgroundMusic();
    } else {
      await this.playBackgroundMusic();
    }
    
    try {
      await AsyncStorage.setItem('fitlearn:sound', JSON.stringify(soundState));
    } catch (e) {
      console.error('Failed to persist sound state:', e);
    }
    this.notify();
  },

  async toggleSoundEffects(): Promise<void> {
    soundState.soundEffectsEnabled = !soundState.soundEffectsEnabled;
    
    try {
      await AsyncStorage.setItem('fitlearn:sound', JSON.stringify(soundState));
    } catch (e) {
      console.error('Failed to persist sound state:', e);
    }
    this.notify();
  },

  isMusicEnabled(): boolean {
    return soundState.musicEnabled;
  },

  areSoundEffectsEnabled(): boolean {
    return soundState.soundEffectsEnabled;
  },

  async playBeep(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    
    try {
      console.log('🔊 Playing beep...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
        { shouldPlay: true, volume: 0.6 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log('Beep sound unavailable:', e);
    }
  },

  async playButtonClick(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/foley/click_hit.ogg' },
        { shouldPlay: true, volume: 0.4 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log('Click sound unavailable:', e);
    }
  },

  async playCountdownTick(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
        { shouldPlay: true, volume: 0.5 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log('Countdown tick unavailable:', e);
    }
  },

  async playTimerComplete(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    
    try {
      console.log('🔔 Playing timer complete sound...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
        { shouldPlay: true, volume: 0.7 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log('Timer complete sound unavailable:', e);
    }
  },

  async playCountdownVoice(number: number): Promise<void> {
    if (!soundState.soundEffectsEnabled || number > 3) return;
    await this.playCountdownTick();
  },

  async playBackgroundMusic(): Promise<void> {
    if (!soundState.musicEnabled) return;
    if (backgroundMusic) return;

    try {
      console.log('🎵 Starting background music...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { shouldPlay: true, volume: 0.3, isLooping: true }
      );
      
      backgroundMusic = sound;
      console.log('🎵 Background music started successfully');
    } catch (e) {
      console.log('Background music unavailable:', e);
    }
  },

  async stopBackgroundMusic(): Promise<void> {
    if (backgroundMusic) {
      try {
        await backgroundMusic.stopAsync();
        await backgroundMusic.unloadAsync();
        backgroundMusic = null;
      } catch (e) {
        console.log('Error stopping music');
      }
    }
  },

  async playWorkoutComplete(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    
    try {
      console.log('🎉 Playing workout complete sound...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/cartoon/cartoon_cowbell.ogg' },
        { shouldPlay: true, volume: 0.7 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log('Completion sound unavailable:', e);
    }
  },

  async playCorrectAnswer(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg' },
        { shouldPlay: true, volume: 0.6 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log('Correct answer sound unavailable:', e);
    }
  },

  async playIncorrectAnswer(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg' },
        { shouldPlay: true, volume: 0.5 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log('Incorrect answer sound unavailable:', e);
    }
  },

  getState(): SoundState {
    return { ...soundState };
  },

  subscribe(listener: (state: SoundState) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify() {
    listeners.forEach((listener) => listener({ ...soundState }));
  },
};

export function useSoundStore() {
  const [state, setState] = React.useState(soundState);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    soundStore.hydrate().then(() => setHydrated(true));
  }, []);

  React.useEffect(() => {
    return soundStore.subscribe((newState) => setState(newState));
  }, []);

  return { ...state, hydrated };
}
