import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../styles/theme';

export default function StatCard({ emoji, value, label, accent }) {
  return (
    <View style={[styles.card, { borderTopColor: accent || COLORS.sage }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.value, { color: accent || COLORS.primaryMed }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderTopWidth: 3,
    ...SHADOW.soft,
  },
  emoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
});
