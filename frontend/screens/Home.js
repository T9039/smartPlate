import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext, useColors } from '../context/AppContext';
import StatCard from '../components/StatCard';
import ActionCard from '../components/ActionCard';
import InsightCard from '../components/InsightCard';
import BottomSheetModal from '../components/BottomSheetModal';
import { getValidIcon } from '../data/mockData';
import { SPACING, RADIUS, SHADOW } from '../styles/theme';

export default function HomeScreen({ navigation }) {
  const { user, impact, inventory, challengeItemsUsedToday, unlockedRewards, challengeTiers, incomingRequests, notifications } = useAppContext();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const [notifVisible, setNotifVisible] = useState(false);

  if (!user) return null;

  const displayName = user.name || user.username || 'User';
  const expiringSoonCount = inventory.filter((i) => i.expiringSoon).length;
  const expiringSoonValue = inventory.filter((i) => i.expiringSoon).reduce((sum, i) => sum + (i.price || 0), 0);
  const insightMessage = expiringSoonCount > 0
    ? `You might waste ${expiringSoonCount} item${expiringSoonCount > 1 ? 's' : ''} worth R${expiringSoonValue.toFixed(0)} this week`
    : 'Your inventory is looking great — no urgent items this week!';

  const pendingRequestCount = incomingRequests.filter((r) => r.status === 'pending').length;
  const maxItems = Math.max(...challengeTiers.map((t) => t.threshold), 9);
  const progressPercent = Math.min((challengeItemsUsedToday / maxItems) * 100, 100);
  const nextTier = challengeTiers.find((t) => !unlockedRewards.includes(t.reward));
  const nextTierText = nextTier
    ? `Use ${Math.max(nextTier.threshold - challengeItemsUsedToday, 0)} more to unlock ${nextTier.label}`
    : 'All rewards unlocked!';

  const allNotifications = [
    ...(incomingRequests || []).filter((r) => r.status === 'pending').map((r) => ({
      id: r.id, title: `Item Request from ${r.fromUser}`,
      message: `They want "${r.requestedItem}" from your donation hamper.`, time: 'Today', type: 'request',
    })),
    ...(notifications || []),
  ];

  const handleNotificationPress = (item) => {
    setNotifVisible(false);
    
    let targetTab = 'Home';
    const title = item.title.toLowerCase();
    const message = item.message.toLowerCase();

    if (item.type === 'request') targetTab = 'Donations';
    else if (item.type === 'warning' || title.includes('expir') || message.includes('expir')) targetTab = 'Inventory';
    else if (title.includes('recipe') || message.includes('recipe')) targetTab = 'Recipes';
    else if (title.includes('donat') || message.includes('donat') || item.type === 'success') targetTab = 'Donations';

    navigation.navigate(targetTab);
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {displayName.split(' ')[0]}</Text>
          <Text style={styles.subGreeting}>Here's your food waste summary</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => setNotifVisible(true)} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color={C.textDark} />
          {allNotifications.length > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Impact card */}
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>Your impact this month</Text>
          <View style={styles.statsRow}>
            <StatCard icon="leaf-outline" value={impact.itemsSaved} label="Items Saved" accent={C.primaryLight} />
            <StatCard icon="cash-outline" value={`R${impact.moneySaved.toFixed(0)}`} label="Money Saved" accent={C.sage} />
            <StatCard icon="heart-outline" value={impact.donationsMade} label="Donations" accent={C.warning} />
          </View>
        </View>

        {/* Use It Up Challenge */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeaderRow}>
            <Text style={styles.challengeTitle}>🔥 Use It Up Challenge</Text>
            <Text style={styles.challengeCount}>{challengeItemsUsedToday}/{maxItems}</Text>
          </View>
          <Text style={styles.challengeSubtitle}>{nextTierText}</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.tiersRow}>
            {challengeTiers.map((tier) => {
              const isUnlocked = unlockedRewards.includes(tier.reward);
              return (
                <View key={tier.reward} style={[styles.tierBadge, isUnlocked && styles.tierBadgeUnlocked]}>
                  <Ionicons name={getValidIcon(tier.emoji)} size={24} color={isUnlocked ? '#E67E22' : C.textMuted} style={{ marginBottom: 4 }} />
                  <Text style={[styles.tierLabel, isUnlocked && styles.tierLabelUnlocked]} numberOfLines={1}>{tier.label}</Text>
                  <Text style={styles.tierThreshold}>{tier.threshold} items</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <ActionCard icon="scan-outline" title="Add Food" subtitle="Scan receipt or barcode" onPress={() => navigation.navigate('AddFood')} accent={C.primaryMed} />
          <View style={{ width: SPACING.sm }} />
          <ActionCard icon="heart-outline" title="Donate Food" subtitle="Help your community" onPress={() => navigation.navigate('Donations')} accent={C.primary} />
        </View>

        {/* AI Insights */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <InsightCard message={insightMessage} onViewDetails={() => navigation.navigate('AIInsightsDetails')} />
        </View>

        {/* Expiring alert */}
        {expiringSoonCount > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="warning-outline" size={24} color={C.warning} style={{ marginRight: 4 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Expiring Soon</Text>
              <Text style={styles.alertMsg}>{expiringSoonCount} item{expiringSoonCount > 1 ? 's are' : ' is'} expiring within 5 days</Text>
            </View>
            <TouchableOpacity style={styles.alertBtn} onPress={() => navigation.navigate('Inventory')} activeOpacity={0.7}>
              <Text style={styles.alertBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Incoming requests banner */}
        {pendingRequestCount > 0 && (
          <TouchableOpacity style={styles.requestBanner} onPress={() => navigation.navigate('Donations')} activeOpacity={0.8}>
            <Ionicons name="mail-unread-outline" size={24} color={C.primaryMed} style={{ marginRight: 4 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: C.primaryMed }]}>Item Requests</Text>
              <Text style={styles.alertMsg}>{pendingRequestCount} neighbour{pendingRequestCount > 1 ? 's are' : ' is'} requesting items from your hamper</Text>
            </View>
            <View style={[styles.alertBtn, { backgroundColor: C.primaryMed }]}>
              <Text style={styles.alertBtnText}>View</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Notifications modal */}
      <BottomSheetModal visible={notifVisible} onClose={() => setNotifVisible(false)} title="Notifications">
        <FlatList
              data={allNotifications}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.notifItem} 
                  activeOpacity={0.7} 
                  onPress={() => handleNotificationPress(item)}
                >
                  <View style={styles.notifIconWrap}>
                    <Ionicons 
                      name={item.type === 'warning' ? 'warning-outline' : item.type === 'success' ? 'checkmark-circle-outline' : item.type === 'request' ? 'mail-outline' : 'information-circle-outline'} 
                      size={24} 
                      color={item.type === 'warning' ? C.warning : item.type === 'success' ? C.success : item.type === 'request' ? C.primaryMed : C.info} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifItemTitle}>{item.title}</Text>
                    <Text style={styles.notifItemMsg}>{item.message}</Text>
                    <Text style={styles.notifItemTime}>{item.time}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.notifSep} />}
            />
      </BottomSheetModal>
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
  greeting: { fontSize: 22, fontWeight: '800', color: C.textDark },
  subGreeting: { fontSize: 13, color: C.textLight, marginTop: 2 },
  bellBtn: {
    position: 'relative', width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.paleGreen, alignItems: 'center', justifyContent: 'center',
  },
  bellIcon: { fontSize: 20 },
  notifDot: {
    position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.warning, borderWidth: 1.5, borderColor: C.background,
  },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  impactCard: {
    backgroundColor: C.surface, borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderTopWidth: 4, borderTopColor: C.primaryMed, ...SHADOW.medium,
  },
  impactTitle: {
    fontSize: 13, fontWeight: '700', color: C.textLight,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: SPACING.md,
  },
  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  challengeCard: {
    backgroundColor: C.surface, borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderTopWidth: 4, borderTopColor: '#E67E22', ...SHADOW.medium,
  },
  challengeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  challengeTitle: { fontSize: 15, fontWeight: '800', color: C.textDark },
  challengeCount: { fontSize: 13, fontWeight: '700', color: '#E67E22' },
  challengeSubtitle: { fontSize: 12, color: C.textLight, marginBottom: SPACING.sm },
  progressBarTrack: { height: 8, backgroundColor: C.border, borderRadius: RADIUS.pill, marginBottom: SPACING.md, overflow: 'hidden' },
  progressBarFill: { height: 8, backgroundColor: '#E67E22', borderRadius: RADIUS.pill },
  tiersRow: { flexDirection: 'row', gap: SPACING.sm },
  tierBadge: {
    flex: 1, backgroundColor: C.card, borderRadius: RADIUS.md, padding: SPACING.sm,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  tierBadgeUnlocked: { backgroundColor: '#FFF8F0', borderColor: '#E67E22' },
  tierEmoji: { fontSize: 18, marginBottom: 4 },
  tierLabel: { fontSize: 10, fontWeight: '600', color: C.textMuted, textAlign: 'center' },
  tierLabelUnlocked: { color: '#E67E22' },
  tierThreshold: { fontSize: 9, color: C.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: SPACING.sm, marginTop: SPACING.xs },
  actionsRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  alertBanner: {
    backgroundColor: C.warningBg, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#FDDBB4',
    gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  requestBanner: {
    backgroundColor: C.paleGreen, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.sage,
    gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  alertEmoji: { fontSize: 22 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: C.warning },
  alertMsg: { fontSize: 12, color: C.textMid, marginTop: 2 },
  alertBtn: { backgroundColor: C.warning, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 7 },
  alertBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  notifItem: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.md, alignItems: 'flex-start' },
  notifIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  notifItemTitle: { fontSize: 14, fontWeight: '600', color: C.textDark },
  notifItemMsg: { fontSize: 13, color: C.textLight, marginTop: 2, lineHeight: 18 },
  notifItemTime: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  notifSep: { height: 1, backgroundColor: C.divider, marginLeft: SPACING.lg + 36 + SPACING.md },
});
