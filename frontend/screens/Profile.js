import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext, useColors } from '../context/AppContext';
import { useAlert } from '../context/AlertContext';
import ProfileOptionRow from '../components/ProfileOptionRow';
import PrimaryButton from '../components/PrimaryButton';
import { getValidIcon } from '../data/mockData';
import { SPACING, RADIUS, SHADOW } from '../styles/theme';

export default function ProfileScreen() {
  const { user, logout, updateUser, unlockedRewards, activeTheme, setActiveTheme, challengeTiers, challengeItemsUsedToday } = useAppContext();
  const { alert, toast } = useAlert();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [editModal, setEditModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);
  const [rewardsModal, setRewardsModal] = useState(false);

  const [editName, setEditName] = useState(user?.name || user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [recipeAlerts, setRecipeAlerts] = useState(true);
  const [donationReminders, setDonationReminders] = useState(false);
  const [suggestBudget, setSuggestBudget] = useState(true);
  const [alertSensitivity, setAlertSensitivity] = useState(true);

  const handleSaveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) { alert('Missing fields', 'Please fill in your name and email.'); return; }
    updateUser({ name: editName.trim(), email: editEmail.trim() });
    setEditModal(false);
    toast('Your profile has been updated.', 'success');
  };

  const handleLogout = () => {
    alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (!user) return null;
  const displayName = user.name || user.username || 'User';
  
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const hasIcon = unlockedRewards.includes('icon');

  // Theme-aware avatar and chip colors
  const avatarBg = activeTheme === 'premium' ? '#1A5C3E' : activeTheme === 'eco' ? '#2E7D32' : C.primaryMed;
  const memberLabel = activeTheme === 'premium' ? '👑 Premium Member' : activeTheme === 'eco' ? '🌿 Eco Member' : '🌿 SmartPlate Member';

  const themeOptions = [
    { id: 'default', label: 'Default', icon: 'leaf-outline', color: '#2D6A4F' },
    ...(unlockedRewards.includes('eco_theme') ? [{ id: 'eco', label: 'Eco', icon: 'color-palette-outline', color: '#2E7D32' }] : []),
    ...(unlockedRewards.includes('premium_theme') ? [{ id: 'premium', label: 'Premium', icon: 'star-outline', color: '#D4AC0D' }] : []),
  ];

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            {hasIcon ? <Ionicons name="medal-outline" size={38} color="#fff" /> : <Text style={styles.avatarText}>{initials}</Text>}
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.memberChip}>
            <Text style={styles.memberText}>{memberLabel}</Text>
          </View>
        </View>

        {/* Challenge summary */}
        <View style={styles.settingsCard}>
          <Text style={styles.groupLabel}>Use It Up Challenge</Text>
          <View style={styles.challengeSummary}>
            <Text style={styles.challengeProgress}>{challengeItemsUsedToday} items used today</Text>
            <TouchableOpacity onPress={() => setRewardsModal(true)} activeOpacity={0.7}>
              <Text style={styles.viewRewardsLink}>View Rewards →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.miniTiersRow}>
            {challengeTiers.map((tier) => {
              const isUnlocked = unlockedRewards.includes(tier.reward);
              return (
                <View key={tier.reward} style={[styles.miniTier, isUnlocked && styles.miniTierUnlocked]}>
                  <Ionicons name={isUnlocked ? getValidIcon(tier.emoji) : 'lock-closed-outline'} size={18} color={isUnlocked ? '#E67E22' : C.textMuted} style={{ marginBottom: 4 }} />
                  <Text style={[styles.miniTierLabel, isUnlocked && { color: '#E67E22' }]}>{tier.threshold}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Theme switcher — visible only if eco or premium is unlocked */}
        {themeOptions.length > 1 && (
          <View style={styles.settingsCard}>
            <Text style={styles.groupLabel}>App Theme</Text>
            <View style={styles.themeRow}>
              {themeOptions.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[styles.themeChip, activeTheme === theme.id && { borderColor: theme.color, backgroundColor: theme.color + '22' }]}
                  onPress={() => setActiveTheme(theme.id)} activeOpacity={0.8}
                >
                  <Ionicons name={theme.icon} size={24} color={activeTheme === theme.id ? theme.color : C.textMuted} style={{ marginBottom: 4 }} />
                  <Text style={[styles.themeChipLabel, activeTheme === theme.id && { color: theme.color, fontWeight: '700' }]}>{theme.label}</Text>
                  {activeTheme === theme.id && <Text style={[styles.themeCheck, { color: theme.color }]}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Account settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.groupLabel}>Account</Text>
          <ProfileOptionRow icon="person-circle-outline" label="Edit Profile" onPress={() => setEditModal(true)} />
          <ProfileOptionRow icon="notifications-outline" label="Notifications" onPress={() => setNotifModal(true)} />
          <ProfileOptionRow icon="medal-outline" label="My Rewards" onPress={() => setRewardsModal(true)} />
          <ProfileOptionRow icon="hardware-chip-outline" label="AI Preferences" onPress={() => setAiModal(true)} isLast />
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.groupLabel}>Info</Text>
          <ProfileOptionRow icon="help-circle-outline" label="Help & Support" onPress={() => setHelpModal(true)} />
          <ProfileOptionRow icon="information-circle-outline" label="About SmartPlate" onPress={() => setAboutModal(true)} isLast />
        </View>

        <View style={styles.settingsCard}>
          <ProfileOptionRow icon="log-out-outline" label="Log Out" onPress={handleLogout} danger isLast />
        </View>

        <Text style={styles.version}>SmartPlate v1.0.0 · Built with 💚</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModal} animationType="slide" transparent onRequestClose={() => setEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={C.textMuted} />
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} placeholder="your@email.com" placeholderTextColor={C.textMuted} keyboardType="email-address" autoCapitalize="none" />
              <PrimaryButton title="Save Changes" onPress={handleSaveProfile} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={notifModal} animationType="slide" transparent onRequestClose={() => setNotifModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {[
                { label: 'Expiry Alerts', sub: 'Warn when food is about to expire', value: expiryAlerts, setter: setExpiryAlerts },
                { label: 'Recipe Suggestions', sub: 'Get notified about new recipe matches', value: recipeAlerts, setter: setRecipeAlerts },
                { label: 'Donation Reminders', sub: 'Remind me to submit my hamper', value: donationReminders, setter: setDonationReminders },
              ].map((item) => (
                <View key={item.label} style={styles.toggleRow}>
                  <View style={{ flex: 1, marginRight: SPACING.md }}>
                    <Text style={styles.toggleLabel}>{item.label}</Text>
                    <Text style={styles.toggleSub}>{item.sub}</Text>
                  </View>
                  <Switch value={item.value} onValueChange={item.setter} trackColor={{ false: C.border, true: C.sage }} thumbColor={item.value ? C.primaryMed : C.textMuted} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Preferences Modal */}
      <Modal visible={aiModal} animationType="slide" transparent onRequestClose={() => setAiModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Preferences</Text>
              <TouchableOpacity onPress={() => setAiModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {[
                { label: 'Budget-friendly Recipes', sub: 'Prioritise low-cost recipe suggestions', value: suggestBudget, setter: setSuggestBudget },
                { label: 'Early Expiry Alerts', sub: 'Alert 5+ days before expiry (high sensitivity)', value: alertSensitivity, setter: setAlertSensitivity },
              ].map((item) => (
                <View key={item.label} style={styles.toggleRow}>
                  <View style={{ flex: 1, marginRight: SPACING.md }}>
                    <Text style={styles.toggleLabel}>{item.label}</Text>
                    <Text style={styles.toggleSub}>{item.sub}</Text>
                  </View>
                  <Switch value={item.value} onValueChange={item.setter} trackColor={{ false: C.border, true: C.sage }} thumbColor={item.value ? C.primaryMed : C.textMuted} />
                </View>
              ))}
              <View style={styles.aiNote}><Text style={styles.aiNoteText}>🤖 AI suggestions are generated based on your inventory and usage patterns.</Text></View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rewards Modal */}
      <Modal visible={rewardsModal} animationType="slide" transparent onRequestClose={() => setRewardsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Rewards</Text>
              <TouchableOpacity onPress={() => setRewardsModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.rewardsIntro}>Use items in the Use It Up Challenge to unlock exclusive rewards!</Text>
              {challengeTiers.map((tier) => {
                const isUnlocked = unlockedRewards.includes(tier.reward);
                return (
                  <View key={tier.reward} style={[styles.rewardRow, isUnlocked && styles.rewardRowUnlocked]}>
                    <View style={[styles.rewardIcon, isUnlocked && styles.rewardIconUnlocked]}>
                      <Ionicons name={isUnlocked ? getValidIcon(tier.emoji) : 'lock-closed-outline'} size={24} color={isUnlocked ? '#E67E22' : C.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rewardLabel, isUnlocked && styles.rewardLabelUnlocked]}>{tier.label}</Text>
                      <Text style={styles.rewardDesc}>{tier.description}</Text>
                      <Text style={styles.rewardThreshold}>{isUnlocked ? '✅ Unlocked!' : `Requires ${tier.threshold} items used in a day`}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal visible={helpModal} animationType="slide" transparent onRequestClose={() => setHelpModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setHelpModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {[
                { q: '📦 How do I add food items?', a: 'Tap "Add Food" on the Home screen or the "+ Add" button in Inventory.' },
                { q: '🍳 How are recipes suggested?', a: 'Our AI matches your inventory with popular recipes, prioritising expiring ingredients.' },
                { q: '🤝 How does donating work?', a: 'Add items to your Donation Hamper, then confirm and book a drop-off location.' },
                { q: '⚠️ What do expiry alerts mean?', a: 'Items within 5 days of expiry are marked as "Expiring Soon".' },
                { q: '🔥 What is the Use It Up Challenge?', a: 'Use 3 items to unlock a profile icon, 6 for the Eco Theme, and 9 for the Premium Theme.' },
              ].map((faq) => (
                <View key={faq.q} style={styles.faqItem}>
                  <Text style={styles.faqQ}>{faq.q}</Text>
                  <Text style={styles.faqA}>{faq.a}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal visible={aboutModal} animationType="slide" transparent onRequestClose={() => setAboutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About SmartPlate</Text>
              <TouchableOpacity onPress={() => setAboutModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
                <Ionicons name="leaf" size={48} color={C.primary} />
                <Text style={[styles.userName, { color: C.primary, marginTop: SPACING.sm, marginBottom: 0 }]}>SmartPlate</Text>
              </View>
              <Text style={styles.aboutText}>SmartPlate helps households track food inventory, get smart recipe suggestions, and donate surplus food to those in need.</Text>
              <Text style={styles.aboutText}>Our mission: reduce food waste in South African homes — one household at a time.</Text>
              <Text style={[styles.version, { marginTop: SPACING.sm }]}>Version 1.0.0 · University Group Project</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  profileHeader: { alignItems: 'center', paddingVertical: SPACING.xl, marginBottom: SPACING.md },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, ...SHADOW.medium },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  avatarEmoji: { fontSize: 38 },
  userName: { fontSize: 22, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  userEmail: { fontSize: 14, color: C.textLight, marginBottom: SPACING.sm },
  memberChip: { backgroundColor: C.paleGreen, borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: C.sage },
  memberText: { fontSize: 12, fontWeight: '600', color: C.primaryMed },
  settingsCard: { backgroundColor: C.surface, borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden', ...SHADOW.soft },
  groupLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: C.textMuted, letterSpacing: 0.8, paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.xs },
  challengeSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  challengeProgress: { fontSize: 14, fontWeight: '600', color: '#E67E22' },
  viewRewardsLink: { fontSize: 13, color: C.primaryMed, fontWeight: '600' },
  miniTiersRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  miniTier: { flex: 1, alignItems: 'center', backgroundColor: C.card, borderRadius: RADIUS.sm, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: C.border },
  miniTierUnlocked: { backgroundColor: '#FFF8F0', borderColor: '#E67E22' },
  miniTierEmoji: { fontSize: 16 },
  miniTierLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600', marginTop: 2 },
  themeRow: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, paddingTop: SPACING.sm },
  themeChip: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card },
  themeChipEmoji: { fontSize: 18, marginBottom: 3 },
  themeChipLabel: { fontSize: 11, fontWeight: '500', color: C.textMuted },
  themeCheck: { fontSize: 12, marginTop: 2 },
  version: { textAlign: 'center', fontSize: 12, color: C.textMuted, marginTop: SPACING.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', ...SHADOW.strong },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: C.divider },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.textDark },
  modalClose: { fontSize: 18, color: C.textLight },
  modalBody: { padding: SPACING.lg, gap: SPACING.md },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.textMid, marginBottom: 6 },
  input: { backgroundColor: C.inputBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border, paddingHorizontal: SPACING.md, paddingVertical: 13, fontSize: 15, color: C.textDark, marginBottom: SPACING.md },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: C.divider },
  toggleLabel: { fontSize: 15, fontWeight: '500', color: C.textDark },
  toggleSub: { fontSize: 12, color: C.textLight, marginTop: 2 },
  aiNote: { backgroundColor: C.paleGreen, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.sm },
  aiNoteText: { fontSize: 13, color: C.textMid, lineHeight: 19 },
  rewardsIntro: { fontSize: 13, color: C.textLight, lineHeight: 19, marginBottom: SPACING.sm },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: C.divider },
  rewardRowUnlocked: { backgroundColor: '#FFF8F0', borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, borderBottomWidth: 0, marginBottom: SPACING.sm },
  rewardIcon: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  rewardIconUnlocked: { backgroundColor: '#FFF3E0', borderColor: '#E67E22' },
  rewardEmoji: { fontSize: 22 },
  rewardLabel: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  rewardLabelUnlocked: { color: '#E67E22' },
  rewardDesc: { fontSize: 12, color: C.textLight, marginTop: 2 },
  rewardThreshold: { fontSize: 11, color: C.textMuted, marginTop: 4, fontWeight: '500' },
  faqItem: { paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: C.divider },
  faqQ: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  faqA: { fontSize: 13, color: C.textLight, lineHeight: 19 },
  aboutText: { fontSize: 14, color: C.textMid, lineHeight: 22, textAlign: 'center' },
});
