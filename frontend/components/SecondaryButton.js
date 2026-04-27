import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../styles/theme';

export default function SecondaryButton({ title, onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryMed,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  label: {
    color: COLORS.primaryMed,
    fontSize: 15,
    fontWeight: '600',
  },
});
