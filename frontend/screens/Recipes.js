import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RecipeCard from '../components/RecipeCard';
import EmptyState from '../components/EmptyState';
import { useColors, useAppContext } from '../context/AppContext';
import { SPACING, RADIUS, SHADOW } from '../styles/theme';

export default function RecipesScreen({ navigation }) {
  const C = useColors();
  const { recipes, fetchRecipes } = useAppContext();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const displayedRecipes = showAll ? recipes : recipes.slice(0, 3);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recipes</Text>
          <Text style={styles.subtitle}>AI Recipe Suggestions</Text>
        </View>
        <View style={styles.aiChip}>
          <Text style={styles.aiChipText}>🤖 AI Powered</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />
        }
      >
        <View style={styles.infoBanner}>
          <Text style={styles.infoEmoji}>✨</Text>
          <Text style={styles.infoText}>Recipes matched to ingredients you already have — use what's expiring first!</Text>
        </View>

        {displayedRecipes.length === 0 ? (
          <EmptyState icon="restaurant-outline" title="No recipes yet" message="Add some food items to your inventory and we'll suggest recipes!" />
        ) : (
          displayedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onPress={() => navigation.navigate('RecipeDetails', { recipe })} />
          ))
        )}

        {!showAll && recipes.length > 3 && (
          <TouchableOpacity style={styles.viewMoreBtn} onPress={() => setShowAll(true)} activeOpacity={0.8}>
            <Text style={styles.viewMoreText}>View More Recipes ({recipes.length - 3} more)</Text>
          </TouchableOpacity>
        )}
        {showAll && (
          <TouchableOpacity style={styles.viewMoreBtn} onPress={() => setShowAll(false)} activeOpacity={0.8}>
            <Text style={styles.viewMoreText}>Show Less</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.refreshBtn, refreshing && { opacity: 0.7 }]} 
          onPress={onRefresh} 
          activeOpacity={0.8}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.refreshBtnText}>↻ Generate New Recipes</Text>
          )}
        </TouchableOpacity>

        <View style={styles.matchLegend}>
          <Text style={styles.legendTitle}>Match % Guide</Text>
          <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: C.primaryMed }]} /><Text style={styles.legendText}>85%+ Great match</Text></View>
          <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: C.warning }]} /><Text style={styles.legendText}>70–84% Good match</Text></View>
          <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: C.textMuted }]} /><Text style={styles.legendText}>Below 70% Partial match</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: C.divider, backgroundColor: C.background,
  },
  title: { fontSize: 24, fontWeight: '800', color: C.textDark },
  subtitle: { fontSize: 13, color: C.textLight, marginTop: 2 },
  aiChip: { backgroundColor: C.paleGreen, borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.sage },
  aiChipText: { fontSize: 12, fontWeight: '600', color: C.primaryMed },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  infoBanner: {
    backgroundColor: C.paleGreen, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.lg, borderLeftWidth: 3, borderLeftColor: C.primaryLight,
  },
  infoEmoji: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 13, color: C.textMid, lineHeight: 19 },
  viewMoreBtn: {
    marginTop: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5,
    borderColor: C.primaryMed, paddingVertical: 13, alignItems: 'center', backgroundColor: C.surface,
  },
  viewMoreText: { color: C.primaryMed, fontSize: 14, fontWeight: '600' },
  matchLegend: {
    backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginTop: SPACING.lg, borderWidth: 1, borderColor: C.border, gap: SPACING.xs,
  },
  legendTitle: { fontSize: 13, fontWeight: '700', color: C.textDark, marginBottom: SPACING.xs },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: C.textLight },
  refreshBtn: {
    marginTop: SPACING.md, borderRadius: RADIUS.md, backgroundColor: C.primaryMed,
    paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    gap: 8, ...SHADOW.soft,
  },
  refreshBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
