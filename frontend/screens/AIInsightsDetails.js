import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useAlert } from '../context/AlertContext';
import { isExpiringSoon, isExpired, getDaysUntilExpiry, getValidIcon } from '../data/mockData';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { PieChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function AIInsightsDetailsScreen({ navigation }) {
  const { inventory, addToDonationHamper, throwAwayItem, algoInsights } = useAppContext();
  const { toast } = useAlert();

  const expiringItems = inventory.filter((item) => isExpiringSoon(item.expiryDate) && !item.donated && !item.usedRecently);
  const expiredItems = inventory.filter((item) => isExpired(item.expiryDate) && !item.donated && !item.usedRecently);

  const handleUseUp = () => {
    navigation.navigate('Recipes');
  };

  const handleDonate = (item) => {
    addToDonationHamper({ ...item, sourceType: 'inventory' });
    toast(`${item.name} has been added to your donation hamper.`, 'success');
  };

  // Prepare chart data
  const consumedData = [];
  if (algoInsights?.consumedCounts) {
    const sorted = Object.entries(algoInsights.consumedCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    sorted.forEach(([name, count], index) => {
      consumedData.push({
        name,
        population: count,
        color: ['#2ECC71', '#27AE60', '#F1C40F', '#E67E22', '#E74C3C'][index] || COLORS.primary,
        legendFontColor: COLORS.textDark,
        legendFontSize: 12
      });
    });
  }

  const wastedData = [];
  if (algoInsights?.wastedCounts) {
    const sorted = Object.entries(algoInsights.wastedCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    sorted.forEach(([name, count], index) => {
      wastedData.push({
        name,
        population: count,
        color: ['#E74C3C', '#C0392B', '#E67E22', '#D35400', '#F39C12'][index] || COLORS.warning,
        legendFontColor: COLORS.textDark,
        legendFontSize: 12
      });
    });
  }

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Algo Insights"
        subtitle="Data-driven waste analysis"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Financial Waste Banner */}
        <View style={styles.summaryBanner}>
          <Ionicons name="cash-outline" size={28} color="#fff" />
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>Estimated Financial Waste</Text>
            <Text style={styles.summaryMsg}>
              R{algoInsights?.totalMoneyWasted?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        {/* Actionable Algorithm Suggestions */}
        <Text style={styles.listTitle}>Algorithm Suggestions</Text>
        {algoInsights && algoInsights.suggestions && algoInsights.suggestions.length > 0 ? (
          algoInsights.suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionCard}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: COLORS.textMuted, marginBottom: SPACING.lg }}>Not enough data to generate suggestions yet.</Text>
        )}

        {/* Charts */}
        {wastedData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Most Wasted Items</Text>
            <PieChart
              data={wastedData}
              width={screenWidth - SPACING.lg * 2}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          </View>
        )}

        {consumedData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Most Consumed Items</Text>
            <PieChart
              data={consumedData}
              width={screenWidth - SPACING.lg * 2}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          </View>
        )}

        {/* Expired Items Section */}
        {expiredItems.length > 0 && (
          <>
            <Text style={[styles.listTitle, { marginTop: SPACING.lg, color: COLORS.warning }]}>Expired Items</Text>
            {expiredItems.map((item) => (
              <View key={item.id} style={[styles.card, { borderLeftWidth: 3, borderLeftColor: COLORS.warning }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.cardEmojiWrap, { backgroundColor: COLORS.warningBg }]}>
                    <Ionicons name={getValidIcon(item.emoji)} size={24} color={COLORS.warning} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { textDecorationLine: 'line-through', color: COLORS.textLight }]}>{item.name}</Text>
                    <Text style={styles.cardMeta}>
                      {item.quantity} {item.unit} · {item.category}
                    </Text>
                    <Text style={styles.cardPrice}>R{item.price?.toFixed(2)}</Text>
                    <Badge
                      label="Expired"
                      type="warning"
                    />
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.donateBtn, { backgroundColor: COLORS.warning, flex: 1 }]}
                    onPress={() => throwAwayItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <Ionicons name="trash-outline" size={16} color="#fff" />
                      <Text style={[styles.donateBtnText, { color: '#fff' }]}>Throw Away</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Expiring Soon Section */}
        <Text style={[styles.listTitle, { marginTop: SPACING.lg }]}>At Risk Right Now</Text>
        {expiringItems.length === 0 && expiredItems.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="All clear!"
            message="No items are expiring soon. Your inventory is in great shape."
          />
        ) : (
          expiringItems.map((item) => {
            const days = getDaysUntilExpiry(item.expiryDate);
            const urgency = days <= 1 ? 'danger' : days <= 3 ? 'warning' : 'neutral';

            return (
              <View key={item.id} style={[styles.card, days <= 2 && styles.cardUrgent]}>
                <View style={styles.cardTop}>
                  <View style={styles.cardEmojiWrap}>
                    <Ionicons name={getValidIcon(item.emoji)} size={24} color={COLORS.primaryMed} />
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="restaurant-outline" size={16} color={COLORS.primaryMed} />
                      <Text style={styles.useBtnText}>Use Up in Recipe</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.donateBtn}
                    onPress={() => handleDonate(item)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="heart-outline" size={16} color={COLORS.warning} />
                      <Text style={styles.donateBtnText}>Donate</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
    backgroundColor: COLORS.warning,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOW.medium,
  },
  summaryText: { flex: 1 },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryMsg: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  suggestionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    ...SHADOW.soft,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOW.soft,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    alignSelf: 'flex-start',
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '800',
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
  cardEmojiWrap: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
