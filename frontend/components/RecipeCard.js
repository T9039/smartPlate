import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW, SPACING } from '../styles/theme';

export default function RecipeCard({ recipe, onPress }) {
  const matchColor =
    recipe.matchPercent >= 85
      ? COLORS.primaryMed
      : recipe.matchPercent >= 70
      ? COLORS.warning
      : COLORS.textLight;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image placeholder */}
      <View style={styles.iconWrap}>
        <Ionicons name={recipe.icon || 'restaurant-outline'} size={24} color={COLORS.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
          <View style={[styles.matchBadge, { borderColor: matchColor }]}>
            <Text style={[styles.matchText, { color: matchColor }]}>
              {recipe.matchPercent}%
            </Text>
          </View>
        </View>

        <Text style={styles.uses}>Uses {recipe.ingredientsUsedCount} ingredients you have</Text>
        <Text style={styles.meta}>{recipe.difficulty} · {recipe.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    ...SHADOW.soft,
    alignItems: 'center',
    padding: SPACING.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 21,
  },
  matchBadge: {
    borderWidth: 1.5,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  matchText: {
    fontSize: 11,
    fontWeight: '700',
  },
  uses: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primaryLight,
  },
});
