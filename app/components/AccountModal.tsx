import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authStore } from '../lib/authStore';
import { getLevelFromXP, getLevelProgress, getXPNeededForNextLevel, getXPToNextLevel, useUserStore } from '../lib/userStore';

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
}

// Avatar customization options
const backgroundColors = ['#00B8A9', '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#DDA0DD', '#87CEEB', '#FFA07A', '#98D8C8', '#F7DC6F'];
const skinEmojis = ['🧑', '🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿', '👩', '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿', '👨', '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿'];
const accessories = ['none', '👓', '🕶️', '🎩', '🧢', '👑', '🎀', '💪', '🎧', '✨'];
const badges = ['🔥', '⭐', '🏆', '💯', '🎯', '💎', '🌟', '🥇', '❤️', '✅'];

export default function AccountModal({ visible, onClose }: AccountModalProps) {
  const { profile } = useUserStore();
  const xp = profile?.xp || 0;
  const level = getLevelFromXP(xp);
  const xpForNext = getXPNeededForNextLevel(level);
  const xpToGo = getXPToNextLevel(xp);
  const progress = getLevelProgress(xp);
  
  const [activeTab, setActiveTab] = useState<'progress' | 'avatar'>('progress');
  
  // Load saved avatar settings
  const userId = authStore.getCurrentUserId();
  const defaultAvatar = { bgColor: backgroundColors[0], skinEmoji: skinEmojis[0], accessory: 'none', badge: badges[0] };
  
  const [avatar, setAvatar] = useState(defaultAvatar);
  
  // Load avatar from AsyncStorage on mount
  useEffect(() => {
    if (userId) {
      AsyncStorage.getItem(`avatar_${userId}`).then((data) => {
        if (data) setAvatar(JSON.parse(data));
      }).catch(() => {});
    }
  }, [userId]);
  
  const saveAvatar = (newAvatar: typeof avatar) => {
    setAvatar(newAvatar);
    if (userId) {
      AsyncStorage.setItem(`avatar_${userId}`, JSON.stringify(newAvatar)).catch(() => {});
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
              onPress={() => setActiveTab('progress')}
            >
              <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'avatar' && styles.activeTab]}
              onPress={() => setActiveTab('avatar')}
            >
              <Text style={[styles.tabText, activeTab === 'avatar' && styles.activeTabText]}>Avatar</Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'progress' ? (
            <>
              <Text style={styles.title}>Your Progress</Text>
              
              {/* Level Badge */}
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{level}</Text>
                <Text style={styles.levelLabel}>Level</Text>
              </View>
              
              {/* XP Progress Bar */}
              <View style={styles.xpContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.xpText}>{Math.round(progress * xpForNext)} / {xpForNext} XP</Text>
                <Text style={styles.xpToGo}>{xpToGo} XP to Level {level + 1}</Text>
              </View>
              
              {/* Total XP */}
              <View style={styles.totalXpContainer}>
                <Text style={styles.totalXpLabel}>Total XP Earned</Text>
                <Text style={styles.totalXpValue}>{xp.toLocaleString()}</Text>
              </View>
            </>
          ) : (
            <ScrollView style={styles.avatarScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Customize Avatar</Text>
              
              {/* Avatar Preview */}
              <View style={styles.avatarPreview}>
                <View style={[styles.avatarCircle, { backgroundColor: avatar.bgColor || backgroundColors[0] }]}>
                  {/* Badge in top left */}
                  {avatar.badge && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeEmoji}>{avatar.badge}</Text>
                    </View>
                  )}
                  {/* Accessory in top right */}
                  {avatar.accessory && avatar.accessory !== 'none' && (
                    <View style={styles.accessoryContainer}>
                      <Text style={styles.accessoryEmoji}>{avatar.accessory}</Text>
                    </View>
                  )}
                  {/* Main skin emoji */}
                  <Text style={styles.avatarEmoji}>{avatar.skinEmoji || skinEmojis[0]}</Text>
                </View>
              </View>
              
              {/* Background Color */}
              <Text style={styles.optionLabel}>Background Color</Text>
              <View style={styles.optionRow}>
                {backgroundColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorOption, { backgroundColor: color }, avatar.bgColor === color && styles.selectedOption]}
                    onPress={() => saveAvatar({ ...avatar, bgColor: color })}
                  />
                ))}
              </View>
              
              {/* Skin / Person */}
              <Text style={styles.optionLabel}>Character</Text>
              <View style={styles.optionRow}>
                {skinEmojis.map((emoji, idx) => (
                  <TouchableOpacity
                    key={`${emoji}-${idx}`}
                    style={[styles.emojiOption, avatar.skinEmoji === emoji && styles.selectedOption]}
                    onPress={() => saveAvatar({ ...avatar, skinEmoji: emoji })}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Accessory */}
              <Text style={styles.optionLabel}>Accessory</Text>
              <View style={styles.optionRow}>
                {accessories.map((acc) => (
                  <TouchableOpacity
                    key={acc}
                    style={[styles.emojiOption, avatar.accessory === acc && styles.selectedOption]}
                    onPress={() => saveAvatar({ ...avatar, accessory: acc })}
                  >
                    <Text style={styles.emojiText}>{acc === 'none' ? '✕' : acc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Badge */}
              <Text style={styles.optionLabel}>Badge</Text>
              <View style={styles.optionRow}>
                {badges.map((badge) => (
                  <TouchableOpacity
                    key={badge}
                    style={[styles.emojiOption, avatar.badge === badge && styles.selectedOption]}
                    onPress={() => saveAvatar({ ...avatar, badge: badge })}
                  >
                    <Text style={styles.emojiText}>{badge}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 340,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#00B8A9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  levelBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00B8A9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00B8A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  levelNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: -4,
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: 12,
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  xpToGo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  totalXpContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalXpLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  totalXpValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD700',
  },
  closeButton: {
    backgroundColor: '#00B8A9',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Avatar styles
  avatarScroll: {
    width: '100%',
    maxHeight: 350,
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#00B8A9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  badgeEmoji: {
    fontSize: 18,
  },
  accessoryContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  accessoryEmoji: {
    fontSize: 18,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiText: {
    fontSize: 22,
  },
  selectedOption: {
    borderColor: '#00B8A9',
    borderWidth: 3,
  },
});
