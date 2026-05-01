import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW, SPACING } from '../styles/theme';

export default function StatCard({ icon, value, label, accent }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent || COLORS.sage}20` }]}>
        <Ionicons name={icon} size={20} color={accent || COLORS.sage} />
      </View>
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
  iconWrap: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 8,
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
