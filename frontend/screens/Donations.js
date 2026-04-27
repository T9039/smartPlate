import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext, useColors } from '../context/AppContext';
import DonationModal from '../components/DonationModal';
import EmptyState from '../components/EmptyState';
import { mockDonationLocations } from '../data/mockData';
import { SPACING, RADIUS, SHADOW } from '../styles/theme';

export default function DonationsScreen({ navigation }) {
  const { donationHamper, removeFromDonationHamper, communityDropOffs, incomingRequests, requestCommunityItem, acceptIncomingRequest, declineIncomingRequest } = useAppContext();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(null);

  const handleRemove = (item) => {
    Alert.alert('Remove item?', `Remove "${item.name}" from the hamper?`, [
      { text: 'Remove', style: 'destructive', onPress: () => removeFromDonationHamper(item.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openBookingModal = () => {
    if (donationHamper.length === 0) { Alert.alert('Empty hamper', 'Add some items to your hamper before confirming.'); return; }
    setSelectedLocation(null); setSelectedSlot(null); setBookingModalVisible(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedLocation) { Alert.alert('Select a location', 'Please choose a drop-off location.'); return; }
    if (!selectedSlot) { Alert.alert('Select a time slot', 'Please choose a time slot.'); return; }
    setBooking({ location: selectedLocation, slot: selectedSlot });
    setBookingModalVisible(false);
    Alert.alert('🎉 Donation booked!', `Drop off at ${selectedLocation.name}\n${selectedSlot}\n\nThank you for giving back!`, [{ text: 'Wonderful!' }]);
  };

  const handleRequestItem = (dropOff, itemName) => {
    Alert.alert('Request this item?', `Send a request to ${dropOff.user} for "${itemName}"?`, [
      { text: 'Send Request', onPress: () => { requestCommunityItem(dropOff.id, itemName); Alert.alert('Request sent! 📬', `${dropOff.user} will be notified.`); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const communityAtLocation = booking && communityDropOffs[booking.location.id] ? communityDropOffs[booking.location.id] : [];
  const pendingRequests = incomingRequests.filter((r) => r.status === 'pending');

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Donations</Text>
          <Text style={styles.subtitle}>Share food, reduce waste</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Incoming requests */}
        {pendingRequests.length > 0 && (
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={styles.sectionTitle}>📬 Item Requests ({pendingRequests.length})</Text>
            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestUser}>{req.fromUser}</Text>
                  <Text style={styles.requestItem}>is requesting "{req.requestedItem}"</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => { acceptIncomingRequest(req.id); Alert.alert('Reserved! ✅', `"${req.requestedItem}" reserved for ${req.fromUser}.`); }} activeOpacity={0.8}>
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => declineIncomingRequest(req.id)} activeOpacity={0.8}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Booking confirmation */}
        {booking && (
          <View style={styles.bookingCard}>
            <Text style={styles.bookingEmoji}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingTitle}>Drop-off Booked</Text>
              <Text style={styles.bookingLocation}>{booking.location.name}</Text>
              <Text style={styles.bookingSlot}>{booking.slot}</Text>
            </View>
          </View>
        )}

        {/* Hamper ready card */}
        {donationHamper.length > 0 && !booking && (
          <TouchableOpacity style={styles.hamperReadyCard} onPress={openBookingModal} activeOpacity={0.85}>
            <Text style={styles.hamperEmoji}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.hamperReadyTitle}>Your hamper is ready!</Text>
              <Text style={styles.hamperReadyDesc}>{donationHamper.length} item{donationHamper.length > 1 ? 's' : ''} packed · Tap to book a drop-off</Text>
            </View>
            <Text style={styles.hamperArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Hamper items */}
        <Text style={styles.sectionTitle}>In Donation Hamper</Text>
        {donationHamper.length === 0 ? (
          <EmptyState emoji="🧺" title="Hamper is empty" message="Add food items to donate to your community.">
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setAddModalVisible(true)} activeOpacity={0.8}>
              <Text style={styles.emptyAddBtnText}>+ Add Item</Text>
            </TouchableOpacity>
          </EmptyState>
        ) : (
          donationHamper.map((item) => (
            <View key={item.id} style={styles.hamperItem}>
              <View style={styles.hamperItemLeft}>
                <View style={styles.hamperItemIcon}><Text style={styles.hamperItemEmoji}>{item.emoji || '📦'}</Text></View>
                <View>
                  <Text style={styles.hamperItemName}>{item.name}</Text>
                  <Text style={styles.hamperItemMeta}>{item.quantity} · {item.sourceType === 'inventory' ? 'From inventory' : 'Manually added'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item)} activeOpacity={0.7}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Community drop-offs */}
        {booking && communityAtLocation.length > 0 && (
          <View style={{ marginTop: SPACING.lg }}>
            <Text style={styles.sectionTitle}>👥 Others at {booking.location.name}</Text>
            <Text style={styles.communityNote}>See what others are bringing. Request items you need.</Text>
            {communityAtLocation.map((dropOff) => (
              <View key={dropOff.id} style={styles.communityCard}>
                <View style={styles.communityHeader}>
                  <View style={styles.communityAvatar}><Text style={styles.communityAvatarText}>{dropOff.user.charAt(0)}</Text></View>
                  <Text style={styles.communityUser}>{dropOff.user}</Text>
                </View>
                {dropOff.items.map((itemName) => {
                  const alreadyRequested = (dropOff.requests || []).some((r) => r.item === itemName);
                  return (
                    <View key={itemName} style={styles.communityItemRow}>
                      <Text style={styles.communityItemName}>• {itemName}</Text>
                      <TouchableOpacity
                        style={[styles.requestItemBtn, alreadyRequested && styles.requestItemBtnSent]}
                        onPress={() => !alreadyRequested && handleRequestItem(dropOff, itemName)}
                        activeOpacity={alreadyRequested ? 1 : 0.8}
                      >
                        <Text style={styles.requestItemBtnText}>{alreadyRequested ? 'Requested ✓' : 'Request'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Impact note */}
        <View style={styles.impactNote}>
          <Text style={styles.impactNoteEmoji}>🌍</Text>
          <Text style={styles.impactNoteText}>Every donation helps reduce food waste in your community and supports families in need.</Text>
        </View>

        {/* Confirm button */}
        {donationHamper.length > 0 && (
          <TouchableOpacity
            style={[styles.confirmBtn, booking && { backgroundColor: C.primary }]}
            onPress={booking ? () => Alert.alert('Already booked!', `Donation booked at ${booking.location.name} for ${booking.slot}.`) : openBookingModal}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmBtnText}>{booking ? '✅  Donation Booked — View Details' : '📍  Confirm Donation Bundle'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <DonationModal visible={addModalVisible} onClose={() => setAddModalVisible(false)}
        onGoToInventory={() => { setAddModalVisible(false); navigation.navigate('Inventory'); }}
        onAddNew={() => { setAddModalVisible(false); navigation.navigate('AddFood'); }} />

      {/* Booking modal */}
      <Modal visible={bookingModalVisible} animationType="slide" transparent onRequestClose={() => setBookingModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bookingSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Drop-off</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.modalSectionLabel}>Select a Location</Text>
              {mockDonationLocations.map((loc) => (
                <TouchableOpacity key={loc.id}
                  style={[styles.locationOption, selectedLocation?.id === loc.id && styles.locationOptionSelected]}
                  onPress={() => { setSelectedLocation(loc); setSelectedSlot(null); }} activeOpacity={0.8}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locationName}>{loc.name}</Text>
                    <Text style={styles.locationAddress}>{loc.address}</Text>
                  </View>
                  {selectedLocation?.id === loc.id && <Text style={styles.locationCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
              {selectedLocation && (
                <>
                  <Text style={[styles.modalSectionLabel, { marginTop: SPACING.lg }]}>Select a Time Slot</Text>
                  <View style={styles.slotsRow}>
                    {selectedLocation.slots.map((slot) => (
                      <TouchableOpacity key={slot} style={[styles.slotChip, selectedSlot === slot && styles.slotChipSelected]}
                        onPress={() => setSelectedSlot(slot)} activeOpacity={0.8}>
                        <Text style={[styles.slotChipText, selectedSlot === slot && styles.slotChipTextSelected]}>{slot}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              <TouchableOpacity
                style={[styles.bookConfirmBtn, (!selectedLocation || !selectedSlot) && styles.bookConfirmBtnDisabled]}
                onPress={handleConfirmBooking} activeOpacity={0.85}>
                <Text style={styles.bookConfirmBtnText}>✅  Confirm Booking</Text>
              </TouchableOpacity>
            </ScrollView>
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
  subtitle: { fontSize: 13, color: C.textLight, marginTop: 2 },
  addBtn: { backgroundColor: C.primaryMed, borderRadius: RADIUS.pill, paddingHorizontal: 16, paddingVertical: 8, ...SHADOW.soft },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: SPACING.md },
  requestCard: {
    backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.sm, borderLeftWidth: 3, borderLeftColor: C.primaryMed, ...SHADOW.soft,
  },
  requestUser: { fontSize: 14, fontWeight: '700', color: C.textDark },
  requestItem: { fontSize: 13, color: C.textLight, marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: SPACING.sm, marginLeft: SPACING.sm },
  acceptBtn: { backgroundColor: C.primaryMed, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 7 },
  acceptBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  declineBtn: { backgroundColor: '#FFE5E5', borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 7 },
  declineBtnText: { color: '#C0392B', fontSize: 12, fontWeight: '700' },
  bookingCard: {
    backgroundColor: C.primary, borderRadius: RADIUS.xl, padding: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg, ...SHADOW.medium,
  },
  bookingEmoji: { fontSize: 28 },
  bookingTitle: { fontSize: 12, color: C.mint, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  bookingLocation: { fontSize: 15, fontWeight: '700', color: '#fff' },
  bookingSlot: { fontSize: 13, color: C.sage, marginTop: 2 },
  hamperReadyCard: {
    backgroundColor: C.primary, borderRadius: RADIUS.xl, padding: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg, ...SHADOW.medium,
  },
  hamperEmoji: { fontSize: 30 },
  hamperReadyTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  hamperReadyDesc: { fontSize: 12, color: C.mint, marginTop: 3 },
  hamperArrow: { fontSize: 22, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  hamperItem: {
    backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.sm, ...SHADOW.soft,
  },
  hamperItemLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  hamperItemIcon: { width: 46, height: 46, borderRadius: RADIUS.md, backgroundColor: C.paleGreen, alignItems: 'center', justifyContent: 'center' },
  hamperItemEmoji: { fontSize: 22 },
  hamperItemName: { fontSize: 15, fontWeight: '600', color: C.textDark },
  hamperItemMeta: { fontSize: 12, color: C.textLight, marginTop: 2 },
  removeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFE5E5', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 13, color: '#C0392B', fontWeight: '700' },
  communityNote: { fontSize: 12, color: C.textLight, marginBottom: SPACING.md },
  communityCard: { backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.soft },
  communityHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  communityAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryMed, alignItems: 'center', justifyContent: 'center' },
  communityAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  communityUser: { fontSize: 14, fontWeight: '700', color: C.textDark },
  communityItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderTopWidth: 1, borderTopColor: C.divider },
  communityItemName: { fontSize: 13, color: C.textMid, flex: 1 },
  requestItemBtn: { backgroundColor: C.paleGreen, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.sage },
  requestItemBtnSent: { backgroundColor: '#E8F5E9', borderColor: C.primaryLight },
  requestItemBtnText: { fontSize: 11, fontWeight: '600', color: C.primaryMed },
  impactNote: {
    backgroundColor: C.paleGreen, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    marginTop: SPACING.md, borderLeftWidth: 3, borderLeftColor: C.primaryLight,
  },
  impactNoteEmoji: { fontSize: 20 },
  impactNoteText: { flex: 1, fontSize: 13, color: C.textMid, lineHeight: 19 },
  confirmBtn: { marginTop: SPACING.lg, backgroundColor: C.primaryMed, borderRadius: RADIUS.lg, paddingVertical: 16, alignItems: 'center', ...SHADOW.medium },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyAddBtn: { marginTop: SPACING.md, backgroundColor: C.primaryMed, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: 12 },
  emptyAddBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bookingSheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', ...SHADOW.strong },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: C.divider },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.textDark },
  modalClose: { fontSize: 18, color: C.textLight },
  modalBody: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  modalSectionLabel: { fontSize: 13, fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
  locationOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: C.border },
  locationOptionSelected: { borderColor: C.primaryMed, backgroundColor: C.paleGreen },
  locationName: { fontSize: 14, fontWeight: '600', color: C.textDark },
  locationAddress: { fontSize: 12, color: C.textLight, marginTop: 2 },
  locationCheck: { fontSize: 16, color: C.primaryMed, fontWeight: '700', marginLeft: SPACING.sm },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  slotChip: { borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border },
  slotChipSelected: { backgroundColor: C.primaryMed, borderColor: C.primaryMed },
  slotChipText: { fontSize: 13, fontWeight: '600', color: C.textMid },
  slotChipTextSelected: { color: '#fff' },
  bookConfirmBtn: { backgroundColor: C.primaryMed, borderRadius: RADIUS.lg, paddingVertical: 16, alignItems: 'center', marginTop: SPACING.md, ...SHADOW.medium },
  bookConfirmBtnDisabled: { backgroundColor: C.border },
  bookConfirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
