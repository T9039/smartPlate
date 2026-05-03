import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../../context/AppContext';
import { useAlert } from '../../context/AlertContext';
import { getValidIcon } from '../../data/mockData';
import { SPACING, RADIUS, SHADOW } from '../../styles/theme';

const A = {
  bg: '#F0F4F8', surface: '#FFFFFF', headerBg: '#1B4332', headerText: '#FFFFFF',
  primary: '#1B4332', primaryMed: '#2D6A4F', primaryLight: '#52B788',
  danger: '#C0392B', dangerBg: '#FFEAEA', warning: '#C96A12', warningBg: '#FFF3E0',
  success: '#1E8449', successBg: '#E8F8F0', info: '#2471A3', infoBg: '#EBF5FB',
  textDark: '#1A202C', textMid: '#4A5568', textLight: '#718096', textMuted: '#A0AEC0',
  border: '#E2E8F0', divider: '#EDF2F7',
};

function StatBox({ label, value, icon, color }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color }]}>
      <Ionicons name={icon} size={24} color={color} style={{ marginBottom: SPACING.xs }} />
      <Text style={[styles.statBoxValue, { color }]}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard({ navigation }) {
  const { allUsers, allInventoryEntries, donationComplaints, adminStats, logout } = useAppContext();
  const { alert } = useAlert();
  const insets = useSafeAreaInsets();

  const activeUsers = allUsers.filter((u) => u.status === 'active').length;
  const flaggedEntries = allInventoryEntries.filter((e) => e.flagged).length;
  const openComplaints = donationComplaints.filter((c) => c.status === 'open').length;
  
  const totalFoodSaved = adminStats?.totalItemsTracked || 0;
  const totalDonations = adminStats?.totalDonations || 0;

  const handleLogout = () => {
    alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const recentEntries = [...allInventoryEntries]
    .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
    .slice(0, 4);

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      {/* Admin header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛡️ Admin Dashboard</Text>
          <Text style={styles.headerSub}>SmartPlate Management Console</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Key stats */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatBox label="Total Users" value={allUsers.length} icon="people-outline" color={A.primary} />
          <StatBox label="Active Users" value={activeUsers} icon="checkmark-circle-outline" color={A.success} />
          <StatBox label="Food Saved" value={`${totalFoodSaved} kg`} icon="leaf-outline" color={A.primaryMed} />
          <StatBox label="Donations" value={totalDonations} icon="heart-outline" color={A.info} />
        </View>

        {/* Alert cards */}
        {flaggedEntries > 0 && (
          <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate('AdminFoodMonitor')} activeOpacity={0.85}>
            <Ionicons name="warning-outline" size={24} color={A.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertCardTitle}>Flagged Inventory Entries</Text>
              <Text style={styles.alertCardDesc}>{flaggedEntries} entr{flaggedEntries > 1 ? 'ies need' : 'y needs'} review — possible spam or non-food items</Text>
            </View>
            <Text style={styles.alertCardArrow}>→</Text>
          </TouchableOpacity>
        )}

        {openComplaints > 0 && (
          <TouchableOpacity style={styles.issueCard} onPress={() => navigation.navigate('AdminDonations')} activeOpacity={0.85}>
            <Ionicons name="mail-unread-outline" size={24} color={A.info} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertCardTitle, { color: A.info }]}>Open Complaints</Text>
              <Text style={styles.alertCardDesc}>{openComplaints} donation complaint{openComplaints > 1 ? 's' : ''} awaiting resolution</Text>
            </View>
            <Text style={styles.alertCardArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Manage Users', icon: 'people-outline', screen: 'AdminUsers', color: A.primary },
            { label: 'Food Monitor', icon: 'folder-outline', screen: 'AdminFoodMonitor', color: A.warning },
            { label: 'Donations', icon: 'heart-outline', screen: 'AdminDonations', color: A.info },
            { label: 'Analytics', icon: 'stats-chart-outline', screen: 'AdminAnalytics', color: A.success },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionCard, { borderTopColor: action.color }]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.85}
            >
              <Ionicons name={action.icon} size={28} color={action.color} style={{ marginBottom: SPACING.xs }} />
              <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent inventory activity */}
        <Text style={styles.sectionTitle}>Recent Food Entries</Text>
        <View style={styles.card}>
          {recentEntries.map((entry, idx) => (
            <View key={entry.id} style={[styles.recentRow, idx < recentEntries.length - 1 && styles.recentRowBorder]}>
              <Ionicons name={getValidIcon(entry.emoji)} size={24} color={A.primaryMed} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>{entry.name}</Text>
                <Text style={styles.recentMeta}>{entry.userName} · {entry.addedDate}</Text>
              </View>
              {entry.flagged && (
                <View style={styles.flaggedBadge}>
                  <Text style={styles.flaggedBadgeText}>Flagged</Text>
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('AdminFoodMonitor')} activeOpacity={0.7}>
            <Text style={styles.viewAllBtnText}>View All Entries →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: A.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: A.headerBg,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: A.headerText },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  logoutBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: SPACING.sm, marginTop: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  statBox: {
    flex: 1, minWidth: '45%', backgroundColor: A.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', borderTopWidth: 3, ...SHADOW.soft,
  },
  statBoxValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statBoxLabel: { fontSize: 11, color: A.textMuted, fontWeight: '500', textAlign: 'center' },
  alertCard: {
    backgroundColor: A.warningBg, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: '#FDDBB4', ...SHADOW.soft,
  },
  issueCard: {
    backgroundColor: A.infoBg, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: '#BEE3F8', ...SHADOW.soft,
  },
  alertCardTitle: { fontSize: 14, fontWeight: '700', color: A.warning },
  alertCardDesc: { fontSize: 12, color: A.textMid, marginTop: 2 },
  alertCardArrow: { fontSize: 18, color: A.textMuted, fontWeight: '700' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  actionCard: {
    flex: 1, minWidth: '45%', backgroundColor: A.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', borderTopWidth: 3, ...SHADOW.soft,
  },
  actionLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  card: { backgroundColor: A.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.soft, marginBottom: SPACING.md },
  recentRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  recentRowBorder: { borderBottomWidth: 1, borderBottomColor: A.divider },
  recentName: { fontSize: 14, fontWeight: '600', color: A.textDark },
  recentMeta: { fontSize: 12, color: A.textLight, marginTop: 2 },
  flaggedBadge: { backgroundColor: '#FFF0F0', borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#FECACA' },
  flaggedBadgeText: { fontSize: 11, fontWeight: '700', color: A.danger },
  viewAllBtn: { padding: SPACING.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: A.divider },
  viewAllBtnText: { fontSize: 13, color: A.primaryMed, fontWeight: '600' },
});
