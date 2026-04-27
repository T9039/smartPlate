import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../styles/theme';

export default function SearchBar({ value, onChangeText, placeholder = 'Search...' }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    ...SHADOW.soft,
  },
  input: {
    fontSize: 15,
    color: COLORS.textDark,
    height: 44,
  },
});
