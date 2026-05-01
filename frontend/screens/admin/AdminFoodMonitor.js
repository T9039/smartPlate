import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../../context/AppContext';
import { useAlert } from '../../context/AlertContext';
import { getValidIcon } from '../../data/mockData';
import { SPACING, RADIUS, SHADOW } from '../../styles/theme';

const A = {
  bg: '#F0F4F8', surface: '#FFFFFF', headerBg: '#1B4332', headerText: '#FFFFFF',
  primary: '#1B4332', primaryMed: '#2D6A4F',
  danger: '#C0392B', dangerBg: '#FFEAEA',
  warning: '#C96A12', warningBg: '#FFF3E0',
  success: '#1E8449', successBg: '#E8F8F0',
  textDark: '#1A202C', textMid: '#4A5568', textLight: '#718096', textMuted: '#A0AEC0',
  border: '#E2E8F0', divider: '#EDF2F7',
};

const FILTERS = ['All', 'Flagged', 'Clean'];

export default function AdminFoodMonitor() {
  const { allInventoryEntries, adminRemoveEntry, adminFlagEntry, adminUnflagEntry } = useAppContext();
  const { alert, toast } = useAlert();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [flagModal, setFlagModal] = useState(false);
  const [flagTarget, setFlagTarget] = useState(null);
  const [flagReason, setFlagReason] = useState('');

  const filtered = useMemo(() => {
    let entries = allInventoryEntries;
    if (filter === 'Flagged') entries = entries.filter((e) => e.flagged);
    else if (filter === 'Clean') entries = entries.filter((e) => !e.flagged);
    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter((e) => e.name.toLowerCase().includes(q) || e.userName.toLowerCase().includes(q));
    }
    // Show flagged entries first
    return entries.sort((a, b) => (b.flagged ? 1 : 0) - (a.flagged ? 1 : 0));
  }, [allInventoryEntries, filter, search]);

  const handleRemove = (entry) => {
    alert('Remove Entry?', `Remove "${entry.name}" added by ${entry.userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { adminRemoveEntry(entry.id); toast(`"${entry.name}" removed.`, 'warning'); } },
    ]);
  };

  const openFlagModal = (entry) => { setFlagTarget(entry); setFlagReason(''); setFlagModal(true); };

  const handleFlag = () => {
    if (!flagReason.trim()) { alert('Enter a reason', 'Please provide a reason for flagging this entry.'); return; }
    adminFlagEntry(flagTarget.id, flagReason.trim());
    setFlagModal(false);
    toast(`"${flagTarget.name}" flagged.`, 'warning');
  };

  const flaggedCount = allInventoryEntries.filter((e) => e.flagged).length;

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗂️ Food Monitor</Text>
        <Text style={styles.headerSub}>{allInventoryEntries.length} entries · {flaggedCount} flagged</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search entries or users..." placeholderTextColor={A.textMuted} />
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)} activeOpacity={0.8}>
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>No entries found.</Text></View>
        ) : (
          filtered.map((entry) => (
            <View key={entry.id} style={[styles.entryCard, entry.flagged && styles.entryCardFlagged]}>
              <View style={styles.entryHeader}>
                <View style={styles.entryEmojiWrap}>
                  <Ionicons name={getValidIcon(entry.emoji)} size={26} color={A.primaryMed} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.entryNameRow}>
                    <Text style={styles.entryName}>{entry.name}</Text>
                    {entry.flagged && (
                      <View style={styles.flaggedBadge}><Text style={styles.flaggedBadgeText}><Ionicons name="warning" size={12} /> Flagged</Text></View>
                    )}
                  </View>
                  <Text style={styles.entryMeta}>By {entry.userName} · {entry.category} · {entry.addedDate}</Text>
                  {entry.flagged && entry.flagReason && (
                    <Text style={styles.flagReason}>Reason: {entry.flagReason}</Text>
                  )}
                </View>
              </View>

              <View style={styles.entryActions}>
                {entry.flagged ? (
                  <TouchableOpacity style={styles.unflagBtn} onPress={() => adminUnflagEntry(entry.id)} activeOpacity={0.8}>
                    <Text style={styles.unflagBtnText}><Ionicons name="checkmark-circle-outline" size={14} /> Unflag</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.flagBtn} onPress={() => openFlagModal(entry)} activeOpacity={0.8}>
                    <Text style={styles.flagBtnText}><Ionicons name="warning-outline" size={14} /> Flag</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(entry)} activeOpacity={0.8}>
                  <Text style={styles.removeBtnText}><Ionicons name="trash-outline" size={14} /> Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Flag reason modal */}
      <Modal visible={flagModal} animationType="slide" transparent onRequestClose={() => setFlagModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Flag Entry</Text>
              <TouchableOpacity onPress={() => setFlagModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalDesc}>Flagging: <Text style={{ fontWeight: '700' }}>{flagTarget?.name}</Text> by {flagTarget?.userName}</Text>
              <Text style={styles.fieldLabel}>Reason for flagging</Text>
              <TextInput
                style={styles.reasonInput}
                value={flagReason}
                onChangeText={setFlagReason}
                placeholder="e.g. Non-food item, Spam entry..."
                placeholderTextColor={A.textMuted}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={styles.confirmFlagBtn} onPress={handleFlag} activeOpacity={0.85}>
                <Text style={styles.confirmFlagBtnText}><Ionicons name="warning" size={16} color="#fff" /> Flag This Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: A.bg },
  header: { backgroundColor: A.headerBg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  searchWrap: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  searchInput: { backgroundColor: A.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: A.border, paddingHorizontal: SPACING.md, paddingVertical: 12, fontSize: 14, color: A.textDark },
  filtersRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.sm },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.pill, backgroundColor: A.surface, borderWidth: 1, borderColor: A.border },
  filterChipActive: { backgroundColor: A.primary, borderColor: A.primary },
  filterChipText: { fontSize: 13, color: A.textMid, fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  empty: { alignItems: 'center', padding: SPACING.xxl },
  emptyText: { fontSize: 14, color: A.textMuted },
  entryCard: { backgroundColor: A.surface, borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden', ...SHADOW.soft },
  entryCardFlagged: { borderLeftWidth: 4, borderLeftColor: A.danger },
  entryHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: SPACING.md, gap: SPACING.md },
  entryEmojiWrap: { marginRight: SPACING.md, marginTop: 2 },
  entryNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  entryName: { fontSize: 15, fontWeight: '700', color: A.textDark },
  entryMeta: { fontSize: 12, color: A.textLight, marginTop: 3 },
  flagReason: { fontSize: 12, color: A.danger, marginTop: 4, fontStyle: 'italic' },
  flaggedBadge: { backgroundColor: '#FFEAEA', borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#FECACA' },
  flaggedBadgeText: { fontSize: 11, fontWeight: '700', color: A.danger },
  entryActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: A.divider },
  flagBtn: { flex: 1, paddingVertical: 11, alignItems: 'center', backgroundColor: A.warningBg, borderRightWidth: 1, borderRightColor: A.divider },
  flagBtnText: { fontSize: 13, fontWeight: '700', color: A.warning },
  unflagBtn: { flex: 1, paddingVertical: 11, alignItems: 'center', backgroundColor: A.successBg, borderRightWidth: 1, borderRightColor: A.divider },
  unflagBtnText: { fontSize: 13, fontWeight: '700', color: A.success },
  removeBtn: { flex: 1, paddingVertical: 11, alignItems: 'center', backgroundColor: A.dangerBg },
  removeBtnText: { fontSize: 13, fontWeight: '700', color: A.danger },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: A.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, ...SHADOW.strong },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: A.divider },
  modalTitle: { fontSize: 18, fontWeight: '700', color: A.textDark },
  modalClose: { fontSize: 18, color: A.textLight },
  modalBody: { padding: SPACING.lg },
  modalDesc: { fontSize: 14, color: A.textMid, marginBottom: SPACING.md },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: A.textMid, marginBottom: 6 },
  reasonInput: { backgroundColor: '#F7FAFC', borderRadius: RADIUS.md, borderWidth: 1, borderColor: A.border, paddingHorizontal: SPACING.md, paddingVertical: 12, fontSize: 14, color: A.textDark, textAlignVertical: 'top', marginBottom: SPACING.lg },
  confirmFlagBtn: { backgroundColor: A.warning, borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center' },
  confirmFlagBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
