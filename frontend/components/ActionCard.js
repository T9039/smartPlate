import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../styles/theme';

export default function ActionCard({ emoji, title, subtitle, onPress, accent, style }) {
  const bg = accent || COLORS.primaryMed;
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bg }, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    minHeight: 140,
    justifyContent: 'space-between',
    ...SHADOW.medium,
  },
  emoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  arrow: {
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
  },
  arrowText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 20,
    fontWeight: '700',
  },
});
