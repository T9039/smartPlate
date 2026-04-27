import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../styles/theme';
import { getExpiryLabel, getDaysUntilExpiry } from '../data/mockData';
import Badge from './Badge';

export default function InventoryItemCard({ item, onUseUp, onDonate }) {
  const days = getDaysUntilExpiry(item.expiryDate);
  const expiring = days <= 5;
  const expired = days < 0;

  const badgeType = expired ? 'warning' : expiring ? 'warning' : 'success';
  const badgeLabel = getExpiryLabel(item.expiryDate);

  return (
    <View style={[styles.card, expiring && styles.cardExpiring]}>
      {/* Image placeholder */}
      <View style={[styles.imagePlaceholder, { backgroundColor: expiring ? COLORS.warningBg : COLORS.paleGreen }]}>
        <Text style={styles.emoji}>{item.emoji || '🥗'}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Badge label={badgeLabel} type={badgeType} />
        </View>

        <Text style={styles.meta}>{item.quantity} {item.unit} · {item.category}</Text>
        <Text style={styles.price}>R{item.price?.toFixed(2)}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.useBtn} onPress={onUseUp} activeOpacity={0.7}>
            <Text style={styles.useBtnText}>Use Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.donateBtn} onPress={onDonate} activeOpacity={0.7}>
            <Text style={styles.donateBtnText}>Donate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    ...SHADOW.soft,
  },
  cardExpiring: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  imagePlaceholder: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 30,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryMed,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  useBtn: {
    flex: 1,
    backgroundColor: COLORS.paleGreen,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  useBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryMed,
  },
  donateBtn: {
    flex: 1,
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  donateBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
});
