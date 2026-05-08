import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../../context/AppContext';
import { LineChart, PieChart } from 'react-native-gifted-charts';
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

// Fallback empty data
const emptyData = {
  totalFoodSaved: 0, totalFoodWasted: 0, totalDonations: 0,
  totalUsers: 0, activeUsers: 0, totalItemsSaved: 0, moneySavedTotal: 0, avgWastePerUser: 0,
  topWastedCategory: '—', topDonatedItem: '—',
  weeklyTrend: [{ week: '—', saved: 0, wasted: 0, donations: 0 }],
  categoryBreakdown: [],
  donationsByLocation: [],
};

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function BigStat({ label, value, icon, color, sub }) {
  return (
    <View style={[styles.bigStatCard, { borderTopColor: color }]}>
      <Ionicons name={icon} size={28} color={color} style={{ marginBottom: SPACING.xs }} />
      <Text style={[styles.bigStatValue, { color }]}>{value}</Text>
      <Text style={styles.bigStatLabel}>{label}</Text>
      {sub && <Text style={styles.bigStatSub}>{sub}</Text>}
    </View>
  );
}



export default function AdminAnalytics() {
  const { adminStats } = useAppContext();
  const insets = useSafeAreaInsets();
  
  const data = (adminStats && adminStats.categoryBreakdown) ? adminStats : emptyData;
  const maxCategory = Math.max(...data.categoryBreakdown.map((c) => c.saved + c.wasted), 1);
  const maxSaved = Math.max(...data.weeklyTrend.map((w) => w.saved), 1);
  const wastePercent = (data.totalFoodSaved + data.totalFoodWasted) > 0 
    ? Math.round((data.totalFoodWasted / (data.totalFoodSaved + data.totalFoodWasted)) * 100) 
    : 0;
  const savePercent = (data.totalFoodSaved + data.totalFoodWasted) > 0 ? 100 - wastePercent : 0;

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
          <BigStat label="Food Saved" value={`${data.totalFoodSaved} kg`} icon="leaf-outline" color={A.success} sub={`${data.totalItemsSaved} items`} />
          <BigStat label="Food Wasted" value={`${data.totalFoodWasted} kg`} icon="trash-outline" color={A.danger} sub={`${wastePercent}% of total`} />
        </View>
        <View style={styles.bigStatsGrid}>
          <BigStat label="Total Donations" value={data.totalDonations} icon="heart-outline" color={A.info} />
          <BigStat label="Money Saved" value={`R${data.moneySavedTotal.toLocaleString()}`} icon="cash-outline" color={A.primaryMed} />
        </View>

        {/* Environmental Impact */}
        <SectionTitle title="Environmental Impact" />
        <View style={styles.bigStatsGrid}>
          <BigStat label="CO₂ Prevented" value={`${(data.totalFoodSaved * 2.5).toFixed(1)} kg`} icon="cloud-outline" color="#3498DB" sub="Emissions saved" />
          <BigStat label="Water Saved" value={`${(data.totalFoodSaved * 800).toLocaleString()} L`} icon="water-outline" color="#2980B9" sub="Water footprint offset" />
        </View>

        {/* Save vs Waste summary */}
        <SectionTitle title="Save vs Waste Rate" />
        <View style={styles.card}>
          <View style={styles.rateRow}>
            <View style={styles.rateItem}>
              <Ionicons name="checkmark-circle-outline" size={24} color={A.success} />
              <Text style={[styles.ratePercent, { color: A.success }]}>{savePercent}%</Text>
              <Text style={styles.rateLabel}>Saved</Text>
            </View>
            <View style={styles.rateBarContainer}>
              <View style={[styles.rateBarFill, { width: `${savePercent}%`, backgroundColor: A.success }]} />
              <View style={[styles.rateBarFill, { width: `${wastePercent}%`, backgroundColor: A.danger }]} />
            </View>
            <View style={[styles.rateItem, { alignItems: 'flex-end' }]}>
              <Ionicons name="warning-outline" size={24} color={A.danger} />
              <Text style={[styles.ratePercent, { color: A.danger }]}>{wastePercent}%</Text>
              <Text style={styles.rateLabel}>Wasted</Text>
            </View>
          </View>
          <Text style={styles.rateNote}>Based on {data.totalFoodSaved + data.totalFoodWasted} kg total food tracked</Text>
        </View>

        {/* Weekly Trend */}
        <SectionTitle title="Weekly Trend (Items Saved vs Wasted)" />
        <View style={styles.card}>
          <View style={styles.weekLegend}>
            <View style={styles.legendDot} /><Text style={styles.legendText}>Saved</Text>
            <View style={[styles.legendDot, { backgroundColor: A.danger, marginLeft: SPACING.md }]} /><Text style={styles.legendText}>Wasted</Text>
          </View>
          <View style={{ marginTop: SPACING.md, alignItems: 'center' }}>
            <LineChart
              data={data.weeklyTrend.map(w => ({ value: w.saved, label: w.week }))}
              data2={data.weeklyTrend.map(w => ({ value: w.wasted }))}
              color1={A.success}
              color2={A.danger}
              dataPointsColor1={A.success}
              dataPointsColor2={A.danger}
              spacing={60}
              initialSpacing={20}
              yAxisTextStyle={{ color: A.textMuted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: A.textLight, fontSize: 10, width: 80, marginLeft: -15 }}
              hideRules
              yAxisColor={A.border}
              xAxisColor={A.border}
              thickness1={3}
              thickness2={3}
              curved
              isAnimated
              height={140}
            />
          </View>
        </View>

        {/* Category Breakdown */}
        <SectionTitle title="Category Breakdown (Items Saved)" />
        <View style={[styles.card, { alignItems: 'center', paddingVertical: SPACING.xl }]}>
          {data.categoryBreakdown.length > 0 ? (
            <PieChart
              data={data.categoryBreakdown.map((cat, idx) => {
                const colors = [A.primaryLight, A.info, A.warning, A.danger, '#9b59b6', '#34495e'];
                return { value: cat.saved || 1, color: colors[idx % colors.length], text: cat.category };
              })}
              donut
              showText
              textColor="#fff"
              radius={100}
              innerRadius={55}
              textSize={12}
              centerLabelComponent={() => {
                return (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: A.textDark }}>{data.totalFoodSaved}</Text>
                    <Text style={{ fontSize: 10, color: A.textLight }}>Saved</Text>
                  </View>
                );
              }}
            />
          ) : (
            <Text style={{ color: A.textMuted }}>No category data yet.</Text>
          )}
          <View style={styles.pieLegendWrap}>
            {data.categoryBreakdown.map((cat, idx) => {
              const colors = [A.primaryLight, A.info, A.warning, A.danger, '#9b59b6', '#34495e'];
              return (
                <View key={cat.category} style={styles.pieLegendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors[idx % colors.length] }]} />
                  <Text style={styles.legendText}>{cat.category}</Text>
                </View>
              );
            })}
          </View>
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
            { label: 'Avg Waste Per User', value: `${data.avgWastePerUser} kg`, icon: 'person-outline', color: A.warning },
            { label: 'Top Wasted Category', value: data.topWastedCategory, icon: 'warning-outline', color: A.danger },
            { label: 'Most Donated Item', value: data.topDonatedItem, icon: 'trophy-outline', color: A.success },
            { label: 'Active Users', value: `${data.activeUsers} of ${data.totalUsers}`, icon: 'people-outline', color: A.info },
          ].map((insight, idx) => (
            <View key={insight.label} style={[styles.insightRow, idx < 3 && styles.insightRowBorder]}>
              <Ionicons name={insight.icon} size={28} color={insight.color} style={{ marginRight: SPACING.sm }} />
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
  bigStatValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  bigStatLabel: { fontSize: 11, color: A.textMuted, fontWeight: '500', textAlign: 'center' },
  bigStatSub: { fontSize: 11, color: A.textLight, marginTop: 2 },
  card: { backgroundColor: A.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.soft },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  rateItem: { alignItems: 'center', width: 56 },
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
  pieLegendWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: SPACING.lg, gap: SPACING.md },
  pieLegendItem: { flexDirection: 'row', alignItems: 'center' },
  locRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.sm },
  locRowBorder: { borderBottomWidth: 1, borderBottomColor: A.divider },
  locName: { fontSize: 12, color: A.textDark, fontWeight: '500', width: 110 },
  locBarWrap: { flex: 1, height: 10, backgroundColor: A.border, borderRadius: RADIUS.pill, overflow: 'hidden' },
  locBar: { height: 10, backgroundColor: A.info, borderRadius: RADIUS.pill },
  locCount: { fontSize: 13, fontWeight: '700', color: A.primary, width: 30, textAlign: 'right' },
  insightsCard: { backgroundColor: A.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.soft },
  insightRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  insightRowBorder: { borderBottomWidth: 1, borderBottomColor: A.divider },
  insightLabel: { fontSize: 12, color: A.textLight, marginBottom: 2 },
  insightValue: { fontSize: 15, fontWeight: '700' },
});
