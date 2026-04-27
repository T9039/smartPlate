import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../styles/theme';

export default function FilterChips({ options, selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.row}>
        {options.map((option) => {
          const active = selected === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  chip: {
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    backgroundColor: COLORS.primaryMed,
    borderColor: COLORS.primaryMed,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
