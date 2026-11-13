import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { buildAvatarSvg, type AvatarData } from '@/app/lib/avatar';

interface AvatarProps {
  data: AvatarData | null | undefined;
  /** Fallback initials shown when there is no avatar configured. */
  initials?: string;
  size: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Renders a user's avatar: an illustrated avataaars character, an uploaded
 * photo, or (as a fallback) their initials on a solid circle.
 */
export function Avatar({ data, initials = '', size, style }: AvatarProps) {
  const isDicebear = data?.kind === 'dicebear';
  const config = isDicebear ? data.config : null;

  const svg = useMemo(
    () => (config ? buildAvatarSvg(config, 'transparent') : null),
    [config],
  );

  const container: StyleProp<ViewStyle> = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style,
  ];

  if (data?.kind === 'photo') {
    return (
      <View style={container}>
        <Image source={{ uri: data.photoUri }} style={{ width: size, height: size }} resizeMode="cover" />
      </View>
    );
  }

  if (svg) {
    const bg = (data?.kind === 'dicebear' && data.bgColor) || '#00B8A9';
    return (
      <View style={[container, { backgroundColor: bg === 'transparent' ? '#E8E8E8' : `#${bg.replace('#', '')}` }]}>
        <SvgXml xml={svg} width={size} height={size} />
      </View>
    );
  }

  return (
    <View style={[container, styles.initialsCircle]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsCircle: {
    backgroundColor: '#00B8A9',
  },
  initials: {
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
