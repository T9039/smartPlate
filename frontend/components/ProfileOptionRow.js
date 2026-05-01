import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../styles/theme';

export default function ProfileOptionRow({ icon, label, onPress, danger, isLast }) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.lastRow]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon || 'settings-outline'} size={22} color={danger ? COLORS.danger : COLORS.textMid} />
      </View>
      <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    gap: SPACING.md,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 36, 
    height: 36, 
    borderRadius: RADIUS.md, 
    backgroundColor: COLORS.card,
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: SPACING.md,
  },
  label: { 
    flex: 1, 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.textDark 
  },
  labelDanger: { 
    color: COLORS.danger 
  },
});
