import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../styles/theme';

// type: 'warning' | 'success' | 'info' | 'neutral'
export default function Badge({ label, type = 'neutral', style }) {
  const bg = {
    warning: COLORS.warningBg,
    success: COLORS.paleGreen,
    info: '#EBF4FF',
    neutral: COLORS.divider,
  }[type];

  const textColor = {
    warning: COLORS.warning,
    success: COLORS.primaryMed,
    info: '#2563EB',
    neutral: COLORS.textLight,
  }[type];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
