import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../styles/theme';

export default function ProfileOptionRow({ emoji, label, onPress, danger, isLast }) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.lastRow]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, danger && styles.dangerIconWrap]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.label, danger && styles.dangerLabel]}>{label}</Text>
      {!danger && <Text style={styles.chevron}>›</Text>}
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
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIconWrap: {
    backgroundColor: '#FFE5E5',
  },
  emoji: {
    fontSize: 17,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  dangerLabel: {
    color: '#C0392B',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
});
