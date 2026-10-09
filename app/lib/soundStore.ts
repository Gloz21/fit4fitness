import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioPlayer, AudioStatus, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
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
let backgroundMusic: AudioPlayer | null = null;

// Play a one-shot sound effect from a remote URI and release it when finished.
async function playEffect(uri: string, volume: number): Promise<void> {
  try {
    const player = createAudioPlayer({ uri });
    player.volume = volume;
    player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (status.didJustFinish) {
        player.remove();
      }
    });
    player.play();
  } catch (e) {
    console.log('Sound unavailable:', e);
  }
}

export const soundStore = {
  async hydrate() {
    try {
      const stored = await AsyncStorage.getItem('fitlearn:sound');
      if (stored) {
        soundState = JSON.parse(stored);
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
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
    console.log('🔊 Playing beep...');
    await playEffect('https://actions.google.com/sounds/v1/alarms/beep_short.ogg', 0.6);
  },

  async playButtonClick(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    await playEffect('https://actions.google.com/sounds/v1/foley/click_hit.ogg', 0.4);
  },

  async playCountdownTick(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    await playEffect('https://actions.google.com/sounds/v1/alarms/beep_short.ogg', 0.5);
  },

  async playTimerComplete(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    console.log('🔔 Playing timer complete sound...');
    await playEffect('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg', 0.7);
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
      const player = createAudioPlayer({
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      });
      player.volume = 0.3;
      player.loop = true;
      player.play();

      backgroundMusic = player;
      console.log('🎵 Background music started successfully');
    } catch (e) {
      console.log('Background music unavailable:', e);
    }
  },

  async stopBackgroundMusic(): Promise<void> {
    if (backgroundMusic) {
      try {
        backgroundMusic.pause();
        backgroundMusic.remove();
        backgroundMusic = null;
      } catch (e) {
        console.log('Error stopping music');
      }
    }
  },

  async playWorkoutComplete(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    console.log('🎉 Playing workout complete sound...');
    await playEffect('https://actions.google.com/sounds/v1/cartoon/cartoon_cowbell.ogg', 0.7);
  },

  async playCorrectAnswer(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    await playEffect('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg', 0.6);
  },

  async playIncorrectAnswer(): Promise<void> {
    if (!soundState.soundEffectsEnabled) return;
    await playEffect('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg', 0.5);
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
