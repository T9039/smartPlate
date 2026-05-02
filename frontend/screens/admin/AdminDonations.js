import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../../context/AppContext';
import { useAlert } from '../../context/AlertContext';
import BottomSheetModal from '../../components/BottomSheetModal';
import { SPACING, RADIUS, SHADOW } from '../../styles/theme';

const A = {
  bg: '#F0F4F8', surface: '#FFFFFF', headerBg: '#1B4332', headerText: '#FFFFFF',
  primary: '#1B4332', primaryMed: '#2D6A4F',
  danger: '#C0392B', dangerBg: '#FFEAEA',
  warning: '#C96A12', warningBg: '#FFF3E0',
  success: '#1E8449', successBg: '#E8F8F0',
  info: '#2471A3', infoBg: '#EBF5FB',
  textDark: '#1A202C', textMid: '#4A5568', textLight: '#718096', textMuted: '#A0AEC0',
  border: '#E2E8F0', divider: '#EDF2F7',
};

const FILTERS = ['All', 'Open', 'Resolved'];

export default function AdminDonations() {
  const { donationComplaints, adminResolveComplaint, donationLocations } = useAppContext();
  const { alert, toast } = useAlert();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('All');
  const [resolveModal, setResolveModal] = useState(false);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  const filtered = useMemo(() => {
    let items = donationComplaints;
    if (filter === 'Open') items = items.filter((c) => c.status === 'open');
    else if (filter === 'Resolved') items = items.filter((c) => c.status === 'resolved');
    return items.sort((a, b) => (a.status === 'open' ? -1 : 1) - (b.status === 'open' ? -1 : 1));
  }, [donationComplaints, filter]);

  const openCount = donationComplaints.filter((c) => c.status === 'open').length;

  const openResolveModal = (complaint) => { setResolveTarget(complaint); setResolutionText(''); setResolveModal(true); };

  const handleResolve = () => {
    if (!resolutionText.trim()) { alert('Note required', 'Please add a resolution note.'); return; }
    adminResolveComplaint(resolveTarget.id, resolutionText.trim());
    setResolveModal(false);
    toast('Issue resolved ✅', 'success');
  };

  const typeLabel = (type) => type === 'failed_pickup' ? '📦 Failed Pickup' : '📩 Complaint';
  const typeColor = (type) => type === 'failed_pickup' ? A.warning : A.info;
  const typeBg = (type) => type === 'failed_pickup' ? A.warningBg : A.infoBg;

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤝 Donation Oversight</Text>
        <Text style={styles.headerSub}>{openCount} open complaint{openCount !== 1 ? 's' : ''}</Text>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Total Donations</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: openCount > 0 ? A.warning : A.success }]}>{openCount}</Text>
          <Text style={styles.statLabel}>Open Issues</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{donationLocations.length}</Text>
          <Text style={styles.statLabel}>Drop-off Points</Text>
        </View>
      </View>

      {/* Location overview */}
      <View style={styles.locationOverview}>
        <Text style={styles.locationOverviewTitle}>Drop-off Locations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.sm }}>
          {donationLocations.map((loc) => (
            <View key={loc.id} style={styles.locationChip}>
              <Text style={styles.locationChipName}>{loc.name}</Text>
              <Text style={styles.locationChipSlots}>{loc.slots.length} slots</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Complaints filters */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)} activeOpacity={0.8}>
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyEmoji}>✅</Text><Text style={styles.emptyText}>No complaints in this category.</Text></View>
        ) : (
          filtered.map((complaint) => (
            <View key={complaint.id} style={[styles.complaintCard, complaint.status === 'open' && styles.complaintCardOpen]}>
              {/* Type badge */}
              <View style={[styles.typeBadge, { backgroundColor: typeBg(complaint.type) }]}>
                <Text style={[styles.typeBadgeText, { color: typeColor(complaint.type) }]}>{typeLabel(complaint.type)}</Text>
              </View>

              <View style={styles.complaintBody}>
                <View style={styles.complaintUserRow}>
                  <View style={styles.userAvatar}><Text style={styles.userAvatarText}>{complaint.userName.charAt(0)}</Text></View>
                  <View>
                    <Text style={styles.complaintUser}>{complaint.userName}</Text>
                    <Text style={styles.complaintDate}>{complaint.date} · {complaint.locationName}</Text>
                  </View>
                </View>
                <Text style={styles.complaintDesc}>{complaint.description}</Text>

                {complaint.status === 'resolved' && complaint.resolution && (
                  <View style={styles.resolutionBox}>
                    <Text style={styles.resolutionLabel}>✅ Resolution</Text>
                    <Text style={styles.resolutionText}>{complaint.resolution}</Text>
                  </View>
                )}
              </View>

              <View style={styles.complaintFooter}>
                <View style={[styles.statusBadge, complaint.status === 'open' ? styles.statusOpen : styles.statusResolved]}>
                  <Text style={[styles.statusText, { color: complaint.status === 'open' ? A.warning : A.success }]}>
                    {complaint.status === 'open' ? '⏳ Open' : '✅ Resolved'}
                  </Text>
                </View>
                {complaint.status === 'open' && (
                  <TouchableOpacity style={styles.resolveBtn} onPress={() => openResolveModal(complaint)} activeOpacity={0.8}>
                    <Text style={styles.resolveBtnText}>Mark Resolved</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Resolve modal */}
      <BottomSheetModal visible={resolveModal} onClose={() => setResolveModal(false)} title="Resolve Complaint">
        <View style={styles.modalBody}>
              <Text style={styles.modalDesc}>Complaint by <Text style={{ fontWeight: '700' }}>{resolveTarget?.userName}</Text> at {resolveTarget?.locationName}</Text>
              <Text style={styles.fieldLabel}>Resolution / Action Taken</Text>
              <TextInput
                style={styles.reasonInput}
                value={resolutionText}
                onChangeText={setResolutionText}
                placeholder="Describe how this was resolved..."
                placeholderTextColor={A.textMuted}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity style={styles.confirmResolveBtn} onPress={handleResolve} activeOpacity={0.85}>
                <Text style={styles.confirmResolveBtnText}>✅ Mark as Resolved</Text>
              </TouchableOpacity>
            </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: A.bg },
  header: { backgroundColor: A.headerBg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  statsRow: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, backgroundColor: A.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOW.soft },
  statValue: { fontSize: 22, fontWeight: '800', color: A.primary },
  statLabel: { fontSize: 10, color: A.textMuted, marginTop: 2, fontWeight: '500', textAlign: 'center' },
  locationOverview: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  locationOverviewTitle: { fontSize: 12, fontWeight: '700', color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
  locationChip: { backgroundColor: A.surface, borderRadius: RADIUS.md, padding: SPACING.sm, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: A.border, minWidth: 130 },
  locationChipName: { fontSize: 12, fontWeight: '600', color: A.textDark },
  locationChipSlots: { fontSize: 11, color: A.textMuted, marginTop: 2 },
  filtersRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.sm },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.pill, backgroundColor: A.surface, borderWidth: 1, borderColor: A.border },
  filterChipActive: { backgroundColor: A.primary, borderColor: A.primary },
  filterChipText: { fontSize: 13, color: A.textMid, fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  empty: { alignItems: 'center', padding: SPACING.xxl, gap: SPACING.sm },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 14, color: A.textMuted },
  complaintCard: { backgroundColor: A.surface, borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden', ...SHADOW.soft },
  complaintCardOpen: { borderLeftWidth: 4, borderLeftColor: A.warning },
  typeBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  typeBadgeText: { fontSize: 12, fontWeight: '700' },
  complaintBody: { padding: SPACING.md },
  complaintUserRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: A.primaryMed, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  complaintUser: { fontSize: 14, fontWeight: '700', color: A.textDark },
  complaintDate: { fontSize: 11, color: A.textMuted, marginTop: 1 },
  complaintDesc: { fontSize: 13, color: A.textMid, lineHeight: 20 },
  resolutionBox: { backgroundColor: A.successBg, borderRadius: RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.sm, borderLeftWidth: 3, borderLeftColor: A.success },
  resolutionLabel: { fontSize: 12, fontWeight: '700', color: A.success, marginBottom: 3 },
  resolutionText: { fontSize: 12, color: A.textMid, lineHeight: 18 },
  complaintFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderTopWidth: 1, borderTopColor: A.divider },
  statusBadge: { borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusOpen: { backgroundColor: A.warningBg, borderColor: '#FDDBB4' },
  statusResolved: { backgroundColor: A.successBg, borderColor: '#A3E4C0' },
  statusText: { fontSize: 12, fontWeight: '700' },
  resolveBtn: { backgroundColor: A.primaryMed, borderRadius: RADIUS.sm, paddingHorizontal: 14, paddingVertical: 8 },
  resolveBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  modalBody: { paddingHorizontal: 0, paddingBottom: SPACING.lg },
  modalDesc: { fontSize: 14, color: A.textMid, marginBottom: SPACING.md },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: A.textMid, marginBottom: 6 },
  reasonInput: { backgroundColor: '#F7FAFC', borderRadius: RADIUS.md, borderWidth: 1, borderColor: A.border, paddingHorizontal: SPACING.md, paddingVertical: 12, fontSize: 14, color: A.textDark, textAlignVertical: 'top', marginBottom: SPACING.lg },
  confirmResolveBtn: { backgroundColor: A.success, borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center' },
  confirmResolveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
