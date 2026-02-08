import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { soundStore, useSoundStore } from '../lib/soundStore';

export default function SoundSettings() {
  const { musicEnabled, soundEffectsEnabled } = useSoundStore();

  const handleMusicToggle = async () => {
    await soundStore.toggleMusic();
  };

  const handleSoundEffectsToggle = async () => {
    await soundStore.toggleSoundEffects();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Settings</Text>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>🎵 Background Music</Text>
          <Text style={styles.settingDescription}>Play music throughout the app</Text>
        </View>
        <Switch
          value={musicEnabled}
          onValueChange={handleMusicToggle}
          trackColor={{ false: '#D1D1D1', true: '#00B8A9' }}
          thumbColor={musicEnabled ? '#FFF' : '#F4F4F4'}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>🔔 Sound Effects</Text>
          <Text style={styles.settingDescription}>Timer beeps & countdown sounds</Text>
        </View>
        <Switch
          value={soundEffectsEnabled}
          onValueChange={handleSoundEffectsToggle}
          trackColor={{ false: '#D1D1D1', true: '#00B8A9' }}
          thumbColor={soundEffectsEnabled ? '#FFF' : '#F4F4F4'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
});
