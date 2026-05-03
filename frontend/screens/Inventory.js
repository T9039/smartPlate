import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext, useColors } from '../context/AppContext';
import { useAlert } from '../context/AlertContext';
import { api } from '../lib/api';
import { isExpiringSoon } from '../data/mockData';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import InventoryItemCard from '../components/InventoryItemCard';
import EmptyState from '../components/EmptyState';
import { SPACING, RADIUS, SHADOW } from '../styles/theme';

const FILTERS = ['All', 'Expiring Soon', 'Used Recently'];

export default function InventoryScreen({ navigation }) {
  const { inventory, markItemUsed, addToDonationHamper } = useAppContext();
  const { alert } = useAlert();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const expiringSoonCount = inventory.filter((i) => isExpiringSoon(i.expiryDate)).length;

  const filtered = useMemo(() => {
    let items = inventory;
    if (filter === 'Expiring Soon') items = items.filter((i) => isExpiringSoon(i.expiryDate));
    else if (filter === 'Used Recently') items = items.filter((i) => i.usedRecently);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    return items;
  }, [inventory, filter, search]);

  const handleUseUp = (item) => {
    alert('Use up this item?', `Mark "${item.name}" as used up? It will be removed from your inventory.`, [
      { text: 'Yes — Use It Up', onPress: () => { markItemUsed(item.id); } },
      { text: 'Find Recipes', onPress: () => navigation.navigate('Recipes') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDonate = (item) => {
    alert('Add to donation hamper?', `Add "${item.name}" to your donation hamper? It will be removed from your inventory.`, [
      { text: 'Add to Hamper', onPress: () => { addToDonationHamper({ ...item, sourceType: 'inventory' }); } },
      { text: 'Go to Donations', onPress: () => navigation.navigate('Donations') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleItemPress = async (item) => {
    setSelectedItem(item);
    setInsights(item.insights || null);
    
    if (!item.insights) {
      setLoadingInsights(true);
      try {
        const data = await api.getInventoryInsights(item.id);
        // If quota exceeded, show the fallback tips without an error alert
        setInsights(data);
      } catch (err) {
        console.warn('Insights fetch failed:', err?.message);
        // Only show alert for unexpected errors, not quota issues
        if (!err?.message?.includes('quota') && !err?.message?.includes('503')) {
          alert('Error', 'Failed to load storage tips');
        }
        setInsights({ quotaExceeded: true, tips: ['AI insights are temporarily unavailable. The daily quota has been reached — try again tomorrow!'] });
      } finally {
        setLoadingInsights(false);
      }
    }
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddFood')} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search food items..." />
        <View style={{ marginTop: SPACING.md, marginBottom: SPACING.sm }}>
          <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
        </View>

        {expiringSoonCount > 0 && (
          <View style={styles.expiryAlert}>
            <Text style={styles.expiryIcon}>⚠️</Text>
            <Text style={styles.expiryText}>
              You have <Text style={styles.bold}>{expiringSoonCount} item{expiringSoonCount > 1 ? 's' : ''}</Text> expiring soon
            </Text>
          </View>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon="cube-outline" title="Nothing here"
            message={search ? `No items matching "${search}"` : filter !== 'All' ? 'No items in this category right now.' : 'Your inventory is empty. Add your first item!'} />
        ) : (
          filtered.map((item) => (
            <InventoryItemCard 
              key={item.id} 
              item={item} 
              onPress={() => handleItemPress(item)}
              onUseUp={() => handleUseUp(item)} 
              onDonate={() => handleDonate(item)} 
            />
          ))
        )}

        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipText}>Tip: Use expiring items in recipes to reduce waste</Text>
            <TouchableOpacity style={styles.viewRecipesBtn} onPress={() => navigation.navigate('Recipes')} activeOpacity={0.7}>
              <Text style={styles.viewRecipesBtnText}>View Recipes →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Item Details Modal */}
      <Modal visible={!!selectedItem} transparent animationType="slide" onRequestClose={() => setSelectedItem(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                <Text style={styles.modalSubtitle}>{selectedItem.category} • Added {new Date(selectedItem.addedDate).toLocaleDateString()}</Text>
                
                <View style={styles.insightsContainer}>
                  <Text style={styles.insightsHeader}>✨ AI Storage Tips</Text>
                  
                  {loadingInsights ? (
                    <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: SPACING.lg }} />
                  ) : insights ? (
                    <View style={styles.insightsBody}>
                      <View style={styles.insightRow}>
                        <Text style={styles.insightIcon}>🧊</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.insightLabel}>Storage</Text>
                          <Text style={styles.insightText}>{insights.storageTip}</Text>
                        </View>
                      </View>
                      <View style={styles.insightRow}>
                        <Text style={styles.insightIcon}>⏳</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.insightLabel}>Shelf Life</Text>
                          <Text style={styles.insightText}>{insights.shelfLife}</Text>
                        </View>
                      </View>
                      <View style={styles.insightRow}>
                        <Text style={styles.insightIcon}>💡</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.insightLabel}>Fun Fact</Text>
                          <Text style={styles.insightText}>{insights.funFact}</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.errorText}>Could not load tips.</Text>
                  )}
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedItem(null)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  addBtn: { backgroundColor: C.primaryMed, borderRadius: RADIUS.pill, paddingHorizontal: 16, paddingVertical: 8, ...SHADOW.soft },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  expiryAlert: {
    backgroundColor: C.warningBg, borderRadius: RADIUS.md, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: C.warning,
  },
  expiryIcon: { fontSize: 18 },
  expiryText: { fontSize: 13, color: C.textMid, flex: 1 },
  bold: { fontWeight: '700', color: C.warning },
  tipCard: {
    backgroundColor: C.paleGreen, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: C.primaryLight,
  },
  tipEmoji: { fontSize: 22, alignSelf: 'flex-start', marginTop: 2 },
  tipText: { fontSize: 13, color: C.textMid, lineHeight: 19, marginBottom: SPACING.sm },
  viewRecipesBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: C.primaryMed, borderRadius: RADIUS.pill },
  viewRecipesBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING.xxl },
  modalTitle: { fontSize: 24, fontWeight: '800', color: C.textDark, marginBottom: 2 },
  modalSubtitle: { fontSize: 14, color: C.textLight, marginBottom: SPACING.lg },
  insightsContainer: { backgroundColor: C.paleGreen, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xl },
  insightsHeader: { fontSize: 16, fontWeight: '700', color: C.primaryMed, marginBottom: SPACING.md },
  insightsBody: { gap: SPACING.md },
  insightRow: { flexDirection: 'row', gap: SPACING.md },
  insightIcon: { fontSize: 20 },
  insightLabel: { fontSize: 12, fontWeight: '700', color: C.textMid, textTransform: 'uppercase', marginBottom: 2 },
  insightText: { fontSize: 14, color: C.textDark, lineHeight: 20 },
  errorText: { color: C.warning, fontSize: 14, fontStyle: 'italic' },
  closeBtn: { backgroundColor: C.background, borderWidth: 1, borderColor: C.border, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
  closeBtnText: { color: C.textDark, fontSize: 16, fontWeight: '600' },
});
