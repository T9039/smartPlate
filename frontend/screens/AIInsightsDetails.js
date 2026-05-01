import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useAlert } from '../context/AlertContext';
import { isExpiringSoon, getDaysUntilExpiry } from '../data/mockData';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';

export default function AIInsightsDetailsScreen({ navigation }) {
  const { inventory, addToDonationHamper } = useAppContext();
  const { toast } = useAlert();

  const expiringItems = inventory.filter((item) => isExpiringSoon(item.expiryDate) && !item.donated);

  const handleUseUp = () => {
    navigation.navigate('Recipes');
  };

  const handleDonate = (item) => {
    addToDonationHamper({ ...item, sourceType: 'inventory' });
    toast(`${item.name} has been added to your donation hamper.`, 'success');
  };

  return (
    <View style={styles.flex}>
      <AppHeader
        title="AI Insights"
        subtitle="Items going to waste soon"
        onBack={() => navigation.goBack()}
      />

      {expiringItems.length === 0 ? (
        <EmptyState
          emoji="✅"
          title="All clear!"
          message="No items are expiring soon. Your inventory is in great shape."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Summary banner */}
          <View style={styles.summaryBanner}>
            <Text style={styles.summaryEmoji}>🤖</Text>
            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>AI Waste Prediction</Text>
              <Text style={styles.summaryMsg}>
                {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} might go to waste
                worth R{expiringItems.reduce((s, i) => s + (i.price || 0), 0).toFixed(0)} — act now!
              </Text>
            </View>
          </View>

          <Text style={styles.listTitle}>Take action on these items</Text>

          {expiringItems.map((item) => {
            const days = getDaysUntilExpiry(item.expiryDate);
            const urgency = days <= 1 ? 'danger' : days <= 3 ? 'warning' : 'neutral';

            return (
              <View key={item.id} style={[styles.card, days <= 2 && styles.cardUrgent]}>
                <View style={styles.cardTop}>
                  <View style={[styles.imagePlaceholder, { backgroundColor: days <= 2 ? '#FFE5CC' : COLORS.paleGreen }]}>
                    <Text style={styles.cardEmoji}>{item.emoji || '🥗'}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardMeta}>
                      {item.quantity} {item.unit} · {item.category}
                    </Text>
                    <Text style={styles.cardPrice}>R{item.price?.toFixed(2)}</Text>
                    <Badge
                      label={days <= 0 ? 'Expired!' : days === 1 ? 'Expires tomorrow!' : `${days} days left`}
                      type={urgency === 'danger' ? 'warning' : 'warning'}
                    />
                  </View>
                </View>

                {/* Urgency bar */}
                <View style={styles.urgencyBarBg}>
                  <View
                    style={[
                      styles.urgencyBar,
                      {
                        width: `${Math.max(10, 100 - days * 15)}%`,
                        backgroundColor: days <= 2 ? COLORS.warning : COLORS.sage,
                      },
                    ]}
                  />
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.useBtn} onPress={handleUseUp} activeOpacity={0.7}>
                    <Text style={styles.useBtnText}>🍳  Use Up in Recipe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.donateBtn}
                    onPress={() => handleDonate(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.donateBtnText}>🤝  Donate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  summaryBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOW.medium,
  },
  summaryEmoji: { fontSize: 28, alignSelf: 'center' },
  summaryText: { flex: 1 },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.mint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryMsg: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.soft,
  },
  cardUrgent: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  cardTop: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 30 },
  cardInfo: { flex: 1, gap: 3 },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cardMeta: { fontSize: 12, color: COLORS.textLight },
  cardPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryMed,
  },
  urgencyBarBg: {
    height: 4,
    backgroundColor: COLORS.divider,
    borderRadius: 2,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
  },
  urgencyBar: {
    height: 4,
    borderRadius: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  useBtn: {
    flex: 1,
    backgroundColor: COLORS.paleGreen,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  useBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryMed,
  },
  donateBtn: {
    flex: 1,
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  donateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.warning,
  },
});
