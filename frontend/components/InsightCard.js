import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../styles/theme';

export default function InsightCard({ message, onViewDetails }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🤖</Text>
        </View>
        <Text style={styles.tag}>AI Insight</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.ctaBtn} onPress={onViewDetails} activeOpacity={0.7}>
        <Text style={styles.ctaText}>View Details  →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOW.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  tag: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.mint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  message: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  ctaBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  ctaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
