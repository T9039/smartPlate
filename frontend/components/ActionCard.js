import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW, SPACING } from '../styles/theme';

export default function ActionCard({ icon, title, subtitle, onPress, accent, style }) {
  const bg = accent || COLORS.primaryMed;
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bg }, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconWrap, accent && { backgroundColor: `${accent}20` }]}>
        <Ionicons name={icon || 'add-circle-outline'} size={24} color={'white'} />
      </View>
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    alignSelf: 'flex-start'
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
