import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../../context/AppContext';
import { useAlert } from '../../context/AlertContext';
import { SPACING, RADIUS, SHADOW } from '../../styles/theme';

const A = {
  bg: '#F0F4F8', surface: '#FFFFFF', headerBg: '#1B4332', headerText: '#FFFFFF',
  primary: '#1B4332', primaryMed: '#2D6A4F',
  danger: '#C0392B', dangerBg: '#FFEAEA',
  warning: '#C96A12', warningBg: '#FFF3E0',
  success: '#1E8449', successBg: '#E8F8F0',
  textDark: '#1A202C', textMid: '#4A5568', textLight: '#718096', textMuted: '#A0AEC0',
  border: '#E2E8F0', divider: '#EDF2F7', inputBg: '#F7FAFC',
};

const FILTERS = ['All', 'Active', 'Suspended'];

export default function AdminUsers() {
  const { allUsers, adminRemoveUser, adminToggleSuspendUser } = useAppContext();
  const { alert, toast } = useAlert();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    let users = allUsers;
    if (filter === 'Active') users = users.filter((u) => u.status === 'active');
    else if (filter === 'Suspended') users = users.filter((u) => u.status === 'suspended');
    if (search.trim()) {
      const q = search.toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return users;
  }, [allUsers, filter, search]);

  const handleRemove = (user) => {
    alert('Remove User?', `Permanently remove "${user.name}" from the platform? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { adminRemoveUser(user.id); toast(`${user.name} removed.`, 'warning'); } },
    ]);
  };

  const handleToggleSuspend = (user) => {
    const action = user.status === 'suspended' ? 'Reactivate' : 'Suspend';
    const message = user.status === 'suspended'
      ? `Reactivate ${user.name}'s account?`
      : `Suspend ${user.name}'s account? They will lose access until reactivated.`;
    alert(`${action} User?`, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: action, style: user.status === 'suspended' ? 'default' : 'destructive', onPress: () => { adminToggleSuspendUser(user.id); toast(`User ${action.toLowerCase()}ed.`, 'info'); } },
    ]);
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 User Management</Text>
        <Text style={styles.headerSub}>{allUsers.length} registered users</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or email..."
          placeholderTextColor={A.textMuted}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)} activeOpacity={0.8}>
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>No users found.</Text></View>
        ) : (
          filtered.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={[styles.avatar, { backgroundColor: user.status === 'suspended' ? A.textMuted : A.primary }]}>
                  <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <View style={[styles.statusBadge, user.status === 'suspended' ? styles.badgeSuspended : styles.badgeActive]}>
                      <Text style={[styles.statusText, user.status === 'suspended' ? { color: A.danger } : { color: A.success }]}>
                        {user.status === 'suspended' ? '⛔ Suspended' : '✅ Active'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Text style={styles.userJoinDate}>Joined {user.joinDate}</Text>
                </View>
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}><Text style={styles.statValue}>{user.itemsAdded}</Text><Text style={styles.statLabel}>Items Added</Text></View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}><Text style={styles.statValue}>{user.itemsSaved}</Text><Text style={styles.statLabel}>Items Saved</Text></View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}><Text style={styles.statValue}>{user.donationsMade}</Text><Text style={styles.statLabel}>Donations</Text></View>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, user.status === 'suspended' ? styles.actionBtnSuccess : styles.actionBtnWarning]}
                  onPress={() => handleToggleSuspend(user)} activeOpacity={0.8}
                >
                  <Text style={[styles.actionBtnText, user.status === 'suspended' ? { color: A.success } : { color: A.warning }]}>
                    {user.status === 'suspended' ? '✅ Reactivate' : '⛔ Suspend'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => handleRemove(user)} activeOpacity={0.8}>
                  <Text style={[styles.actionBtnText, { color: A.danger }]}>🗑️ Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: A.bg },
  header: { backgroundColor: A.headerBg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  searchWrap: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  searchInput: {
    backgroundColor: A.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: A.border,
    paddingHorizontal: SPACING.md, paddingVertical: 12, fontSize: 14, color: A.textDark,
  },
  filtersRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.sm },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.pill, backgroundColor: A.surface, borderWidth: 1, borderColor: A.border },
  filterChipActive: { backgroundColor: A.primary, borderColor: A.primary },
  filterChipText: { fontSize: 13, color: A.textMid, fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  empty: { alignItems: 'center', padding: SPACING.xxl },
  emptyText: { fontSize: 14, color: A.textMuted },
  userCard: { backgroundColor: A.surface, borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden', ...SHADOW.soft },
  userHeader: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.md, alignItems: 'flex-start' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  userName: { fontSize: 15, fontWeight: '700', color: A.textDark },
  userEmail: { fontSize: 12, color: A.textLight, marginTop: 2 },
  userJoinDate: { fontSize: 11, color: A.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  badgeActive: { backgroundColor: '#E8F8F0', borderColor: '#A3E4C0' },
  badgeSuspended: { backgroundColor: '#FFEAEA', borderColor: '#FECACA' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: A.divider, paddingVertical: SPACING.sm },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: A.textDark },
  statLabel: { fontSize: 10, color: A.textMuted, marginTop: 2, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: A.divider },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: A.divider },
  actionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRightWidth: 1, borderRightColor: A.divider },
  actionBtnWarning: { backgroundColor: A.warningBg },
  actionBtnSuccess: { backgroundColor: A.successBg },
  actionBtnDanger: { backgroundColor: A.dangerBg },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
});
