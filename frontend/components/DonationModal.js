import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../styles/theme';

export default function DonationModal({ visible, onClose, onGoToInventory, onAddNew }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />

              <Text style={styles.title}>Add to Hamper</Text>
              <Text style={styles.subtitle}>
                Choose how you'd like to add a donation item.
              </Text>

              <TouchableOpacity style={styles.optionCard} onPress={onGoToInventory} activeOpacity={0.8}>
                <Text style={styles.optionEmoji}>📦</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>From Inventory</Text>
                  <Text style={styles.optionDesc}>Pick an item you already have tracked</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard} onPress={onAddNew} activeOpacity={0.8}>
                <Text style={styles.optionEmoji}>➕</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Add New Item</Text>
                  <Text style={styles.optionDesc}>Manually add a new donation item</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    ...SHADOW.strong,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  optionEmoji: {
    fontSize: 26,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  optionDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  optionArrow: {
    fontSize: 22,
    color: COLORS.textMuted,
  },
  cancelBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});
