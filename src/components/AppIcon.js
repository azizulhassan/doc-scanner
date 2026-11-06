import React from 'react';
import { Text, StyleSheet } from 'react-native';

const ICON_MAP = {
  'document-text-outline': '📄',
  'trash-outline': '🗑',
  'search-outline': '🔍',
  'close-circle': '✕',
  'scan-outline': '⛶',
  'images-outline': '🖼',
  'camera-outline': '📷',
  'arrow-back': '←',
  'pencil-outline': '✎',
  'share-outline': '↗',
  'expand-outline': '⤢',
  'refresh-outline': '↻',
  'chevron-back-outline': '‹',
  'chevron-forward-outline': '›',
  close: '✕',
};

/**
 * Lightweight icon component that renders crisp symbols without requiring
 * native `expo-font` loading, avoiding SDK mismatches in Expo Go.
 */
export default function AppIcon({ name, size = 20, color = '#0F172A', style }) {
  const glyph = ICON_MAP[name] || '•';
  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: size,
          lineHeight: size * 1.15,
          color,
        },
        style,
      ]}
    >
      {glyph}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});

