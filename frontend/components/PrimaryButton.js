import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../styles/theme';

export default function PrimaryButton({ title, onPress, loading, disabled, style }) {
  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primaryMed,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.soft,
  },
  disabled: {
    backgroundColor: COLORS.sage,
    opacity: 0.6,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
