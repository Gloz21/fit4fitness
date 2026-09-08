import SoundSettings from '@/app/components/SoundSettings';
import { authStore } from '@/app/lib/authStore';
import { nutritionStore } from '@/app/lib/nutritionStore';
import { recipeStore } from '@/app/lib/recipeStore';
import { userStore } from '@/app/lib/userStore';
import { workoutSessionStore } from '@/app/lib/workoutSessionStore';
import { workoutStore } from '@/app/lib/workoutStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'account' | 'preferences'>('account');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const username = authStore.getCurrentUserEmail()?.split("@")[0] || 'User';

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields required.');
      return;
    }

    if (newPassword.length < 3 || newPassword.length > 20) {
      setPasswordError('Password must be 3–20 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    // Actually change the password via authStore
    const result = await authStore.changePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(result.error || 'Password change failed.');
    }
  };

  const handleLogout = async () => {
    console.log('🔴 Logging out...');
    // Clear ALL auth and data stores
    await authStore.logout();
    await userStore.reset();
    await nutritionStore.reset();
    await workoutStore.reset();
    await workoutSessionStore.reset();
    await recipeStore.reset();
    console.log('🔴 Logout complete, navigating to welcome screen');
    // Close modal and navigate
    onClose();
    setTimeout(() => {
      router.dismissAll();
      router.replace('/');
    }, 300);
  };

  const doDeleteAccount = async () => {
    const result = await authStore.deleteAccount();
    if (result.success) {
      await userStore.reset();
      await nutritionStore.reset();
      await workoutStore.reset();
      await workoutSessionStore.reset();
      await recipeStore.reset();
      onClose();
      setTimeout(() => {
        router.dismissAll();
        router.replace('/');
      }, 300);
    } else {
      if (Platform.OS === 'web') {
        window.alert(result.error || 'Failed to delete account.');
      } else {
        Alert.alert('Error', result.error || 'Failed to delete account.');
      }
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to permanently delete your account and all your data? This cannot be undone.');
      if (confirmed) {
        doDeleteAccount();
      }
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to permanently delete your account and all your data? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: doDeleteAccount,
          },
        ]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 50) }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} style={{ padding: 8 }}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'account' && styles.tabActive]}
            onPress={() => setActiveTab('account')}
          >
            <Text style={[styles.tabLabel, activeTab === 'account' && styles.tabLabelActive]}>
              Account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'preferences' && styles.tabActive]}
            onPress={() => setActiveTab('preferences')}
          >
            <Text style={[styles.tabLabel, activeTab === 'preferences' && styles.tabLabelActive]}>
              Preferences
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === 'account' ? (
            <View style={styles.section}>
              {/* Username Display */}
              <View style={styles.settingGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.usernameDisplay}>
                  <Text style={styles.usernameText}>{username}</Text>
                </View>
              </View>

              {/* Change Password */}
              <View style={styles.settingGroup}>
                <Text style={styles.sectionTitle}>Change Password</Text>

                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                {passwordSuccess ? <Text style={styles.successText}>{passwordSuccess}</Text> : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor="#888"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password (3–20 chars)"
                    placeholderTextColor="#888"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    maxLength={20}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#888"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    maxLength={20}
                  />
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.primaryButtonText}>Update Password</Text>
                </TouchableOpacity>
              </View>

              {/* Logout */}
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>

              {/* Delete Account */}
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.section}>
              {/* Audio Settings */}
              <SoundSettings />

              {/* About */}
              <View style={styles.aboutSection}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.aboutItem}>
                  <Text style={styles.aboutLabel}>App Version</Text>
                  <Text style={styles.aboutValue}>1.0.0</Text>
                </View>
                <View style={styles.aboutItem}>
                  <Text style={styles.aboutLabel}>Support</Text>
                  <Text style={styles.aboutValue}>fit4fitness123@gmail.com</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  closeButton: {
    fontSize: 24,
    color: '#888',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#00B8A9',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
  },
  tabLabelActive: {
    color: '#00B8A9',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    gap: 24,
  },
  section: {
    gap: 20,
  },
  settingGroup: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
  },
  usernameDisplay: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#CCC',
    color: '#1A1A1A',
  },
  primaryButton: {
    backgroundColor: '#00B8A9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  successText: {
    color: '#00B8A9',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: '800',
    fontSize: 14,
  },
  preferencesGroup: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  aboutSection: {
    gap: 12,
  },
  aboutItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  aboutLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  aboutValue: {
    fontSize: 14,
    color: '#888',
  },
});
