import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Avatar } from '@/components/avatar';
import {
  ACCESSORY_STYLES,
  AvataaarsConfig,
  AvatarData,
  BG_COLORS,
  buildAvatarSvg,
  CLOTHES_COLORS,
  CLOTHING_STYLES,
  DEFAULT_AVATAAARS,
  EYE_COLORS,
  EYE_STYLES,
  EYEBROW_STYLES,
  FACIAL_HAIR_STYLES,
  HAIR_COLORS,
  HAIR_STYLES,
  labelFor,
  MOUTH_STYLES,
  Option,
  randomAvataaars,
  SKIN_COLORS,
} from '../lib/avatar';
import { authStore } from '../lib/authStore';
import { getLevelFromXP, getLevelProgress, getXPNeededForNextLevel, getXPToNextLevel, useUserStore } from '../lib/userStore';

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
}

// --- Memoized avatar preview tile (keyed on a signature so taps don't rebuild) ---

const PreviewTile = React.memo(function PreviewTile({
  sig,
  config,
  selected,
  label,
  onPress,
}: {
  sig: string;
  config: AvataaarsConfig;
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  const svg = useMemo(() => buildAvatarSvg(config, 'transparent'), [sig]);
  return (
    <TouchableOpacity style={[styles.previewTile, selected && styles.previewTileSelected]} onPress={onPress}>
      <View style={styles.previewSvgWrap}>
        <SvgXml xml={svg} width={52} height={52} />
      </View>
      <Text style={styles.previewLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
});

export default function AccountModal({ visible, onClose }: AccountModalProps) {
  const { profile } = useUserStore();
  const xp = profile?.xp || 0;
  const level = getLevelFromXP(xp);
  const xpForNext = getXPNeededForNextLevel(level);
  const xpToGo = getXPToNextLevel(xp);
  const progress = getLevelProgress(xp);

  const userId = authStore.getCurrentUserId();
  const email = authStore.getCurrentUserEmail() || '';
  const initials = (email.split('@')[0] || 'U').slice(0, 2).toUpperCase();

  const [activeTab, setActiveTab] = useState<'progress' | 'avatar'>('progress');
  const [mode, setMode] = useState<'character' | 'photo'>('character');
  const [config, setConfig] = useState<AvataaarsConfig>(DEFAULT_AVATAAARS);
  const [bgColor, setBgColor] = useState('00B8A9');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadedRef = useRef(false);

  // Load saved avatar
  useEffect(() => {
    if (!userId) return;
    loadedRef.current = false;
    AsyncStorage.getItem(`avatar_${userId}`)
      .then((raw) => {
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.kind === 'dicebear') {
            setConfig({ ...DEFAULT_AVATAAARS, ...data.config });
            setBgColor(data.bgColor || '00B8A9');
            setMode('character');
          } else if (data?.kind === 'photo' && data.photoUri) {
            setPhotoUri(data.photoUri);
            setMode('photo');
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        loadedRef.current = true;
      });
  }, [userId]);

  const avatarData: AvatarData = useMemo(() => {
    if (mode === 'photo' && photoUri) return { kind: 'photo', photoUri };
    return { kind: 'dicebear', bgColor, config };
  }, [mode, photoUri, bgColor, config]);

  // Persist on any change (after the initial load)
  useEffect(() => {
    if (!userId || !loadedRef.current) return;
    AsyncStorage.setItem(`avatar_${userId}`, JSON.stringify(avatarData)).catch(() => {});
  }, [avatarData, userId]);

  const set = (patch: Partial<AvataaarsConfig>) => setConfig((c) => ({ ...c, ...patch }));

  const applyPhoto = async (uri: string) => {
    let finalUri = uri;
    try {
      if (userId) {
        const dest = new File(Paths.document, `avatar-${userId}.jpg`);
        try {
          dest.delete();
        } catch {}
        await new File(uri).copy(dest);
        finalUri = dest.uri;
      }
    } catch {}
    setPhotoUri(finalUri);
    setMode('photo');
  };

  const pickFromLibrary = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!res.canceled && res.assets?.[0]) applyPhoto(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Enable camera access in Settings to take a photo.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!res.canceled && res.assets?.[0]) applyPhoto(res.assets[0].uri);
  };

  const removePhoto = () => {
    setPhotoUri(null);
    setMode('character');
  };

  const renderColorRow = (label: string, colors: string[], value: string, onSelect: (c: string) => void) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatchRow}>
        {colors.map((c) => {
          const bg = c === 'transparent' ? '#EDEDED' : c === 'natural' ? '#4a3b34' : `#${c}`;
          return (
            <TouchableOpacity
              key={c}
              style={[styles.swatch, { backgroundColor: bg }, value === c && styles.swatchSelected]}
              onPress={() => onSelect(c)}
            >
              {c === 'transparent' && <Text style={styles.swatchNone}>∅</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderStyleField = (label: string, field: keyof AvataaarsConfig, options: Option[]) => {
    const open = expanded === field;
    const current = config[field];
    return (
      <View style={styles.field}>
        <TouchableOpacity style={styles.fieldHeader} onPress={() => setExpanded(open ? null : field)}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>
            {labelFor(options, current)} {open ? '▲' : '▾'}
          </Text>
        </TouchableOpacity>
        {open && (
          <View style={styles.previewGrid}>
            {options.map((opt) => {
              const previewConfig = { ...config, [field]: opt.value } as AvataaarsConfig;
              const sig = JSON.stringify(previewConfig);
              return (
                <PreviewTile
                  key={opt.value || 'none'}
                  sig={sig}
                  config={previewConfig}
                  selected={current === opt.value}
                  label={opt.label}
                  onPress={() => set({ [field]: opt.value } as Partial<AvataaarsConfig>)}
                />
              );
            })}
          </View>
        )}
      </View>
    );
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

              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{level}</Text>
                <Text style={styles.levelLabel}>Level</Text>
              </View>

              <View style={styles.xpContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.xpText}>
                  {Math.round(progress * xpForNext)} / {xpForNext} XP
                </Text>
                <Text style={styles.xpToGo}>
                  {xpToGo} XP to Level {level + 1}
                </Text>
              </View>

              <View style={styles.totalXpContainer}>
                <Text style={styles.totalXpLabel}>Total XP Earned</Text>
                <Text style={styles.totalXpValue}>{xp.toLocaleString()}</Text>
              </View>
            </>
          ) : (
            <ScrollView style={styles.avatarScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Customize Avatar</Text>

              {/* Live preview */}
              <View style={styles.avatarPreview}>
                <Avatar data={avatarData} initials={initials} size={120} />
              </View>

              {/* Character / Photo switch */}
              <View style={styles.modeSwitch}>
                <TouchableOpacity
                  style={[styles.modeButton, mode === 'character' && styles.modeButtonActive]}
                  onPress={() => setMode('character')}
                >
                  <Text style={[styles.modeButtonText, mode === 'character' && styles.modeButtonTextActive]}>Character</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, mode === 'photo' && styles.modeButtonActive]}
                  onPress={() => (photoUri ? setMode('photo') : pickFromLibrary())}
                >
                  <Text style={[styles.modeButtonText, mode === 'photo' && styles.modeButtonTextActive]}>Photo</Text>
                </TouchableOpacity>
              </View>

              {mode === 'photo' ? (
                <View style={styles.photoSection}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  ) : (
                    <Text style={styles.photoHint}>Pick a photo to use as your profile picture.</Text>
                  )}
                  <TouchableOpacity style={styles.photoButton} onPress={pickFromLibrary}>
                    <Text style={styles.photoButtonText}>📷  Choose from Library</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                    <Text style={styles.photoButtonText}>📸  Take Photo</Text>
                  </TouchableOpacity>
                  {photoUri && (
                    <TouchableOpacity style={[styles.photoButton, styles.photoButtonDanger]} onPress={removePhoto}>
                      <Text style={[styles.photoButtonText, styles.photoButtonDangerText]}>Remove Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View>
                  <TouchableOpacity style={styles.randomizeButton} onPress={() => setConfig(randomAvataaars())}>
                    <Text style={styles.randomizeText}>🎲  Randomize</Text>
                  </TouchableOpacity>

                  {renderColorRow('Skin tone', SKIN_COLORS, config.skinColor, (c) => set({ skinColor: c }))}
                  {renderStyleField('Hair', 'top', HAIR_STYLES)}
                  {renderColorRow('Hair color', HAIR_COLORS, config.hairColor, (c) => set({ hairColor: c }))}
                  {renderStyleField('Eyebrows', 'eyebrows', EYEBROW_STYLES)}
                  {renderStyleField('Eyes', 'eyes', EYE_STYLES)}
                  {renderColorRow('Eye color', EYE_COLORS, config.eyeColor, (c) => set({ eyeColor: c }))}
                  {renderStyleField('Mouth', 'mouth', MOUTH_STYLES)}
                  {renderStyleField('Facial hair', 'facialHair', FACIAL_HAIR_STYLES)}
                  {config.facialHair
                    ? renderColorRow('Facial hair color', HAIR_COLORS, config.facialHairColor, (c) => set({ facialHairColor: c }))
                    : null}
                  {renderStyleField('Glasses', 'accessories', ACCESSORY_STYLES)}
                  {renderStyleField('Outfit', 'clothing', CLOTHING_STYLES)}
                  {renderColorRow('Outfit color', CLOTHES_COLORS, config.clothesColor, (c) => set({ clothesColor: c }))}
                  {renderColorRow('Background', BG_COLORS, bgColor, setBgColor)}
                </View>
              )}
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
    width: '88%',
    maxWidth: 360,
    maxHeight: '86%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
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
    marginBottom: 16,
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
    marginTop: 14,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Avatar
  avatarScroll: {
    width: '100%',
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  modeButtonTextActive: {
    color: '#00B8A9',
  },
  randomizeButton: {
    alignSelf: 'center',
    backgroundColor: '#F0FBFA',
    borderColor: '#00B8A9',
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  randomizeText: {
    color: '#00B8A9',
    fontWeight: '700',
    fontSize: 14,
  },
  field: {
    width: '100%',
    marginBottom: 14,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00B8A9',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  previewTile: {
    width: 64,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F7F7F7',
  },
  previewTileSelected: {
    borderColor: '#00B8A9',
    backgroundColor: '#E9F8F6',
  },
  previewSvgWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#ECECEC',
  },
  previewLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 3,
    maxWidth: 60,
    textAlign: 'center',
  },
  swatchRow: {
    gap: 10,
    paddingVertical: 4,
    paddingRight: 8,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderColor: '#00B8A9',
    borderWidth: 3,
  },
  swatchNone: {
    color: '#999',
    fontSize: 14,
  },
  photoSection: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 6,
  },
  photoHint: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    marginBottom: 6,
  },
  photoButton: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  photoButtonDanger: {
    backgroundColor: '#FDECEC',
  },
  photoButtonDangerText: {
    color: '#E74C3C',
  },
});
