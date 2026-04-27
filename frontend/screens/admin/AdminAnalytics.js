import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockAnalyticsData } from '../../data/mockData';
import { SPACING, RADIUS, SHADOW } from '../../styles/theme';

const A = {
  bg: '#F0F4F8', surface: '#FFFFFF', headerBg: '#1B4332', headerText: '#FFFFFF',
  primary: '#1B4332', primaryMed: '#2D6A4F', primaryLight: '#52B788',
  danger: '#C0392B', dangerBg: '#FFEAEA',
  warning: '#C96A12', warningBg: '#FFF3E0',
  success: '#1E8449', successBg: '#E8F8F0',
  info: '#2471A3', infoBg: '#EBF5FB',
  textDark: '#1A202C', textMid: '#4A5568', textLight: '#718096', textMuted: '#A0AEC0',
  border: '#E2E8F0', divider: '#EDF2F7',
};

const data = mockAnalyticsData;

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function BigStat({ label, value, emoji, color, sub }) {
  return (
    <View style={[styles.bigStatCard, { borderTopColor: color }]}>
      <Text style={styles.bigStatEmoji}>{emoji}</Text>
      <Text style={[styles.bigStatValue, { color }]}>{value}</Text>
      <Text style={styles.bigStatLabel}>{label}</Text>
      {sub && <Text style={styles.bigStatSub}>{sub}</Text>}
    </View>
  );
}

function BarRow({ label, savedVal, wastedVal, maxVal }) {
  const savedWidth = Math.max((savedVal / maxVal) * 100, 2);
  const wastedWidth = Math.max((wastedVal / maxVal) * 100, 2);
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTracks}>
        <View style={styles.barTrack}>
          <View style={[styles.barFillSaved, { width: `${savedWidth}%` }]} />
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFillWasted, { width: `${wastedWidth}%` }]} />
        </View>
      </View>
      <View style={styles.barValues}>
        <Text style={[styles.barValue, { color: A.success }]}>{savedVal} kg</Text>
        <Text style={[styles.barValue, { color: A.danger }]}>{wastedVal} kg</Text>
      </View>
    </View>
  );
}

function WeekBar({ week, saved, wasted, donations, maxSaved }) {
  const barH = Math.max((saved / maxSaved) * 80, 4);
  return (
    <View style={styles.weekCol}>
      <Text style={styles.weekDonCount}>{donations}</Text>
      <View style={styles.weekBarWrap}>
        <View style={[styles.weekBarSaved, { height: barH }]} />
      </View>
      <Text style={styles.weekLabel}>{week}</Text>
    </View>
  );
}

export default function AdminAnalytics() {
  const insets = useSafeAreaInsets();
  const maxCategory = Math.max(...data.categoryBreakdown.map((c) => c.saved + c.wasted));
  const maxSaved = Math.max(...data.weeklyTrend.map((w) => w.saved));
  const wastePercent = Math.round((data.totalFoodWasted / (data.totalFoodSaved + data.totalFoodWasted)) * 100);
  const savePercent = 100 - wastePercent;

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📈 Analytics</Text>
        <Text style={styles.headerSub}>Platform-wide food waste data</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top stats */}
        <SectionTitle title="Key Metrics" />
        <View style={styles.bigStatsGrid}>
          <BigStat label="Food Saved" value={`${data.totalFoodSaved} kg`} emoji="🥗" color={A.success} sub={`${data.totalItemsSaved} items`} />
          <BigStat label="Food Wasted" value={`${data.totalFoodWasted} kg`} emoji="🗑️" color={A.danger} sub={`${wastePercent}% of total`} />
        </View>
        <View style={styles.bigStatsGrid}>
          <BigStat label="Total Donations" value={data.totalDonations} emoji="🤝" color={A.info} />
          <BigStat label="Money Saved" value={`R${data.moneySavedTotal.toLocaleString()}`} emoji="💰" color={A.primaryMed} />
        </View>

        {/* Save vs waste summary */}
        <SectionTitle title="Save vs Waste Rate" />
        <View style={styles.card}>
          <View style={styles.rateRow}>
            <View style={styles.rateItem}>
              <Text style={styles.rateEmoji}>✅</Text>
              <Text style={[styles.ratePercent, { color: A.success }]}>{savePercent}%</Text>
              <Text style={styles.rateLabel}>Saved</Text>
            </View>
            <View style={styles.rateBarContainer}>
              <View style={[styles.rateBarFill, { width: `${savePercent}%`, backgroundColor: A.success }]} />
              <View style={[styles.rateBarFill, { width: `${wastePercent}%`, backgroundColor: A.danger }]} />
            </View>
            <View style={[styles.rateItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.rateEmoji}>⚠️</Text>
              <Text style={[styles.ratePercent, { color: A.danger }]}>{wastePercent}%</Text>
              <Text style={styles.rateLabel}>Wasted</Text>
            </View>
          </View>
          <Text style={styles.rateNote}>Based on {data.totalFoodSaved + data.totalFoodWasted} kg total food tracked</Text>
        </View>

        {/* Weekly trend */}
        <SectionTitle title="Weekly Trend (Items Saved)" />
        <View style={styles.card}>
          <View style={styles.weekLegend}>
            <View style={styles.legendDot} /><Text style={styles.legendText}>Saved (kg)</Text>
            <View style={[styles.legendDot, { backgroundColor: A.info, marginLeft: SPACING.md }]} /><Text style={styles.legendText}>Donations</Text>
          </View>
          <View style={styles.weekBarsRow}>
            {data.weeklyTrend.map((w) => (
              <WeekBar key={w.week} {...w} maxSaved={maxSaved} />
            ))}
          </View>
        </View>

        {/* Category breakdown */}
        <SectionTitle title="Category Breakdown" />
        <View style={styles.card}>
          <View style={styles.barLegend}>
            <View style={styles.legendDotGreen} /><Text style={styles.legendText}>Saved</Text>
            <View style={[styles.legendDotGreen, { backgroundColor: A.danger, marginLeft: SPACING.md }]} /><Text style={styles.legendText}>Wasted</Text>
          </View>
          {data.categoryBreakdown.map((cat) => (
            <BarRow key={cat.category} label={cat.category} savedVal={cat.saved} wastedVal={cat.wasted} maxVal={maxCategory} />
          ))}
        </View>

        {/* Donations by location */}
        <SectionTitle title="Donations by Drop-off Location" />
        <View style={styles.card}>
          {data.donationsByLocation.map((loc, idx) => {
            const pct = Math.round((loc.count / data.totalDonations) * 100);
            return (
              <View key={loc.location} style={[styles.locRow, idx < data.donationsByLocation.length - 1 && styles.locRowBorder]}>
                <Text style={styles.locName}>{loc.location}</Text>
                <View style={styles.locBarWrap}>
                  <View style={[styles.locBar, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.locCount}>{loc.count}</Text>
              </View>
            );
          })}
        </View>

        {/* Top insights */}
        <SectionTitle title="Platform Insights" />
        <View style={styles.insightsCard}>
          {[
            { label: 'Top Wasted Category', value: data.topWastedCategory, emoji: '⚠️', color: A.danger },
            { label: 'Most Donated Item', value: data.topDonatedItem, emoji: '🏆', color: A.success },
            { label: 'Active Users', value: `${data.activeUsers} of ${data.totalUsers}`, emoji: '👥', color: A.info },
          ].map((insight, idx) => (
            <View key={insight.label} style={[styles.insightRow, idx < 2 && styles.insightRowBorder]}>
              <Text style={styles.insightEmoji}>{insight.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightLabel}>{insight.label}</Text>
                <Text style={[styles.insightValue, { color: insight.color }]}>{insight.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: A.bg },
  header: { backgroundColor: A.headerBg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: SPACING.sm, marginTop: SPACING.md },
  bigStatsGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  bigStatCard: {
    flex: 1, backgroundColor: A.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', borderTopWidth: 3, ...SHADOW.soft,
  },
  bigStatEmoji: { fontSize: 28, marginBottom: SPACING.xs },
  bigStatValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  bigStatLabel: { fontSize: 11, color: A.textMuted, fontWeight: '500', textAlign: 'center' },
  bigStatSub: { fontSize: 11, color: A.textLight, marginTop: 2 },
  card: { backgroundColor: A.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.soft },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  rateItem: { alignItems: 'center', width: 56 },
  rateEmoji: { fontSize: 20 },
  ratePercent: { fontSize: 18, fontWeight: '800' },
  rateLabel: { fontSize: 10, color: A.textMuted, fontWeight: '500' },
  rateBarContainer: { flex: 1, flexDirection: 'row', height: 14, borderRadius: RADIUS.pill, overflow: 'hidden', backgroundColor: A.border },
  rateBarFill: { height: 14 },
  rateNote: { fontSize: 11, color: A.textMuted, textAlign: 'center' },
  weekLegend: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  legendDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: A.success, marginRight: 4 },
  legendDotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: A.success, marginRight: 4 },
  legendText: { fontSize: 12, color: A.textLight },
  weekBarsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100 },
  weekCol: { alignItems: 'center', gap: 4 },
  weekDonCount: { fontSize: 10, color: A.info, fontWeight: '700' },
  weekBarWrap: { justifyContent: 'flex-end', height: 80 },
  weekBarSaved: { width: 28, backgroundColor: A.primaryMed, borderRadius: RADIUS.sm },
  weekLabel: { fontSize: 10, color: A.textMuted, fontWeight: '500' },
  barRow: { marginBottom: SPACING.sm },
  barLabel: { fontSize: 12, fontWeight: '600', color: A.textDark, marginBottom: 4 },
  barTracks: { gap: 3 },
  barTrack: { height: 10, backgroundColor: A.border, borderRadius: RADIUS.pill, overflow: 'hidden' },
  barFillSaved: { height: 10, backgroundColor: A.primaryLight, borderRadius: RADIUS.pill },
  barFillWasted: { height: 10, backgroundColor: '#FFABAB', borderRadius: RADIUS.pill },
  barValues: { flexDirection: 'row', gap: SPACING.md, marginTop: 3 },
  barValue: { fontSize: 11, fontWeight: '600' },
  barLegend: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  locRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.sm },
  locRowBorder: { borderBottomWidth: 1, borderBottomColor: A.divider },
  locName: { fontSize: 12, color: A.textDark, fontWeight: '500', width: 110 },
  locBarWrap: { flex: 1, height: 10, backgroundColor: A.border, borderRadius: RADIUS.pill, overflow: 'hidden' },
  locBar: { height: 10, backgroundColor: A.info, borderRadius: RADIUS.pill },
  locCount: { fontSize: 13, fontWeight: '700', color: A.primary, width: 30, textAlign: 'right' },
  insightsCard: { backgroundColor: A.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.soft },
  insightRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  insightRowBorder: { borderBottomWidth: 1, borderBottomColor: A.divider },
  insightEmoji: { fontSize: 24 },
  insightLabel: { fontSize: 12, color: A.textLight, marginBottom: 2 },
  insightValue: { fontSize: 15, fontWeight: '700' },
});
