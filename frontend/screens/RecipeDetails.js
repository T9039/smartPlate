import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useAlert } from '../context/AlertContext';
import AppHeader from '../components/AppHeader';
import PrimaryButton from '../components/PrimaryButton';
import { getValidIcon } from '../data/mockData';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';

const STATUS_CONFIG = {
  expiring: {
    label: 'Expiring Soon',
    color: COLORS.warning,
    bg: COLORS.warningBg,
    icon: 'warning-outline',
  },
  'in-inventory': {
    label: 'In Inventory',
    color: COLORS.primaryMed,
    bg: COLORS.paleGreen,
    icon: 'checkmark-circle-outline',
  },
  missing: {
    label: 'Need to buy',
    color: COLORS.textMuted,
    bg: COLORS.divider,
    icon: 'ellipse-outline',
  },
};

export default function RecipeDetailsScreen({ navigation, route }) {
  const { recipe } = route.params;
  const { markItemUsed, savedRecipes, saveRecipe, unsaveRecipe } = useAppContext();
  const { alert } = useAlert();

  const matchColor =
    recipe.matchPercent >= 85
      ? COLORS.primaryMed
      : recipe.matchPercent >= 70
      ? COLORS.warning
      : COLORS.textLight;

  const isSaved = savedRecipes.some(r => r.id === recipe.id);

  const toggleSave = async () => {
    if (isSaved) {
      await unsaveRecipe(recipe.id);
    } else {
      await saveRecipe(recipe.id, recipe);
    }
  };

  const handleCookedIt = () => {
    alert(
      '🎉 Great job!',
      `You cooked "${recipe.title}"! Expiring ingredients have been marked as used.`,
      [
        {
          text: 'Awesome!',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Recipe Details"
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={toggleSave} style={styles.saveBtn}>
            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={24} color={COLORS.primaryMed} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <Ionicons name={getValidIcon(recipe.icon || recipe.emoji)} size={60} color={COLORS.primary} />
        </View>

        {/* Title and meta */}
        <View style={styles.titleSection}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaText}><Ionicons name="time-outline" size={12} /> {recipe.time}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaText}><Ionicons name="stats-chart-outline" size={12} /> {recipe.difficulty}</Text>
            </View>
            <View style={[styles.metaChip, styles.matchChip, { borderColor: matchColor }]}>
              <Text style={[styles.matchChipText, { color: matchColor }]}>
                {recipe.matchPercent}% match
              </Text>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>

          {/* Legend */}
          <View style={styles.legend}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <View key={key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
                <Text style={styles.legendText}>{cfg.label}</Text>
              </View>
            ))}
          </View>

          {recipe.ingredients.map((ing, index) => {
            const cfg = STATUS_CONFIG[ing.status] || STATUS_CONFIG.missing;
            return (
              <View key={index} style={[styles.ingredientRow, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={18} color={cfg.color} style={styles.ingredientIcon} />
                <Text style={styles.ingredientName}>{ing.name}</Text>
                <View style={[styles.ingredientBadge, { backgroundColor: cfg.color }]}>
                  <Text style={styles.ingredientBadgeText}>{cfg.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Cooked it button */}
        <View style={styles.cookedSection}>
          <PrimaryButton
            title="✓  Cooked It!"
            onPress={handleCookedIt}
            style={styles.cookedBtn}
          />
          <Text style={styles.cookedSubtext}>
            This will mark expiring ingredients as used in your inventory
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    paddingBottom: SPACING.xxl,
  },
  heroSection: {
    height: 220,
    backgroundColor: COLORS.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  saveBtn: {
    padding: 5,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 30,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metaChip: {
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMid,
  },
  matchChip: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  matchChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  ingredientIcon: { width: 22 },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  ingredientBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ingredientBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryMed,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMid,
    lineHeight: 22,
  },
  cookedSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  cookedBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  cookedSubtext: {
    marginTop: SPACING.sm,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
