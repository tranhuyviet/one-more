import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useLogStore } from '@/store/useLogStore';
import Icon from '@/components/ui/Icon';
import TabBar from '@/components/ui/TabBar';
import LineChart from '@/components/charts/LineChart';
import { TAB_BAR_HEIGHT } from '@/constants/theme';
import { getDateString } from '@/firebase/logs';

type TimeFilter = '3m' | '6m' | '1y' | 'all';

function getTimeRangeMs(filter: TimeFilter): { startMs: number; endMs: number } {
  const endMs = Date.now();
  const months = filter === '3m' ? 3 : filter === '6m' ? 6 : filter === '1y' ? 12 : 36;
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  start.setHours(0, 0, 0, 0);
  return { startMs: start.getTime(), endMs };
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const exercises = useExerciseStore(s => s.exercises);
  const { rangedLogs, loadLogs } = useLogStore();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('3m');
  const [selectedEx, setSelectedEx] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    const { startMs, endMs } = getTimeRangeMs(timeFilter);
    loadLogs(user.uid, startMs, endMs);
  }, [user, timeFilter]);

  const filteredLogs = selectedEx === 'all'
    ? rangedLogs
    : rangedLogs.filter(l => l.exerciseId === selectedEx);

  // Build weekly totals for chart
  const weeklyTotals: number[] = [];
  const weeklyLabels: string[] = [];
  if (filteredLogs.length > 0) {
    const byWeek: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const d = new Date(log.loggedAt);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const key = getDateString(monday);
      byWeek[key] = (byWeek[key] ?? 0) + log.value;
    });
    const sorted = Object.entries(byWeek).sort(([a], [b]) => a.localeCompare(b));
    const last12 = sorted.slice(-12);
    last12.forEach(([key, val]) => {
      weeklyTotals.push(val);
      weeklyLabels.push(key.slice(5));
    });
  }

  const thisWeekTotal = weeklyTotals.at(-1) ?? 0;
  const lastWeekTotal = weeklyTotals.at(-2) ?? 0;
  const weekDiff = lastWeekTotal > 0
    ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
    : 0;

  // Compare months
  const now = new Date();
  const thisMonthLogs = filteredLogs.filter(l => {
    const d = new Date(l.loggedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonthLogs = filteredLogs.filter(l => {
    const d = new Date(l.loggedAt);
    const last = new Date(now); last.setMonth(now.getMonth() - 1);
    return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
  });
  const thisMonthTotal = thisMonthLogs.reduce((s, l) => s + l.value, 0);
  const lastMonthTotal = lastMonthLogs.reduce((s, l) => s + l.value, 0);
  const monthDiff = thisMonthTotal - lastMonthTotal;
  const monthPct = lastMonthTotal > 0 ? Math.round((monthDiff / lastMonthTotal) * 100) : 0;

  // All-time total
  const allTimeTotal = rangedLogs.reduce((s, l) => s + l.value, 0);

  // Records
  const byDay: Record<string, number> = {};
  const bySet: number[] = [];
  rangedLogs.forEach(log => {
    const key = getDateString(new Date(log.loggedAt));
    byDay[key] = (byDay[key] ?? 0) + log.value;
    bySet.push(log.value);
  });
  const bestDay = Math.max(0, ...Object.values(byDay));
  const bestSet = Math.max(0, ...bySet);
  const bestWeek = Math.max(0, ...weeklyTotals);

  const exerciseFilters = [
    { id: 'all', label: t.allExercises },
    ...exercises.map(ex => ({ id: ex.id, label: ex.name })),
  ];

  const timeFilters: { id: TimeFilter; label: string }[] = [
    { id: '3m', label: t.timeRange3m },
    { id: '6m', label: t.timeRange6m },
    { id: '1y', label: t.timeRange1y },
    { id: 'all', label: t.all },
  ];

  const milestones = [1000, 5000, 10000, 25000, 50000];

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <View style={[styles.statusBarCover, { height: insets.top, backgroundColor: colors.bg }]} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_HEIGHT + 24 },
        ]}
      >
        {/* Header */}
        <Text style={[styles.title, { color: colors.ink }]}>{t.statsTitle}</Text>
        <Text style={[styles.subtitle, { color: colors.ink2 }]}>{t.statsSubtitle}</Text>

        {/* Exercise filter */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.exFilterScroll}
          contentContainerStyle={styles.exFilterContent}
        >
          {exerciseFilters.map(ex => {
            const active = ex.id === selectedEx;
            return (
              <TouchableOpacity
                key={ex.id}
                style={[
                  styles.exChip,
                  {
                    backgroundColor: active ? colors.accent : 'transparent',
                    borderColor: active ? colors.accent : colors.line,
                    borderWidth: active ? 0 : 1,
                  },
                ]}
                onPress={() => setSelectedEx(ex.id)}
              >
                <Text style={[styles.exChipText, {
                  color: active ? '#fff' : colors.ink2,
                }]}>
                  {ex.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time range */}
        <View style={[styles.timeGrid, { backgroundColor: colors.line }]}>
          {timeFilters.map(f => {
            const active = f.id === timeFilter;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.timeBtn, active && { backgroundColor: colors.card }]}
                onPress={() => setTimeFilter(f.id)}
              >
                <Text style={[styles.timeBtnText, {
                  color: active ? colors.ink : colors.ink2,
                  fontWeight: active ? '600' : '500',
                }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Chart */}
        <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>
          {t.trendChart.toUpperCase()}
        </Text>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartValue, { color: colors.ink }]}>{thisWeekTotal}</Text>
          <Text style={[styles.chartSub, { color: colors.ink2 }]}>{t.weekThis}</Text>
          {weekDiff !== 0 && (
            <View style={styles.diffBadge}>
              <Icon
                name={weekDiff > 0 ? 'arrowUp' : 'arrowDn'}
                size={12}
                stroke={colors.accent}
                sw={2.2}
              />
              <Text style={[styles.diffText, { color: colors.accent }]}>
                {weekDiff > 0 ? '+' : ''}{weekDiff}%
              </Text>
            </View>
          )}
        </View>

        {weeklyTotals.length >= 2 ? (
          <LineChart
            data={weeklyTotals}
            labels={[
              weeklyTotals.length > 0 ? `${weeklyTotals.length} ${t.weeksAgo}` : '',
              '',
              '',
              t.weekNow,
            ]}
          />
        ) : (
          <View style={[styles.emptyChart, { borderColor: colors.line }]}>
            <Text style={[styles.emptyText, { color: colors.ink2 }]}>{t.noData}</Text>
          </View>
        )}

        {/* Compare months */}
        <View style={[styles.section, { borderTopColor: colors.line }]}>
          <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>
            {t.compareTitle.toUpperCase()}
          </Text>
          <View style={styles.compareRow}>
            <View style={styles.compareCell}>
              <Text style={[styles.compareLabel, { color: colors.ink2 }]}>{t.lastMonth}</Text>
              <Text style={[styles.compareValue, { color: colors.ink }]}>
                {lastMonthTotal.toLocaleString()}
              </Text>
            </View>
            <View style={styles.compareCell}>
              <Text style={[styles.compareLabel, { color: colors.ink2 }]}>{t.thisMonthLabel}</Text>
              <Text style={[styles.compareValue, { color: colors.ink }]}>
                {thisMonthTotal.toLocaleString()}
              </Text>
            </View>
          </View>
          {monthDiff !== 0 && (
            <View style={[styles.diffCard, { backgroundColor: colors.accentSoft }]}>
              <Icon
                name={monthDiff > 0 ? 'arrowUp' : 'arrowDn'}
                size={14}
                stroke={colors.accentInk}
                sw={2.2}
              />
              <Text style={[styles.diffCardText, { color: colors.accentInk }]}>
                {monthDiff > 0 ? '+' : ''}{monthDiff} reps ({monthPct > 0 ? '+' : ''}{monthPct}%) {t.vsLastWeek}
              </Text>
            </View>
          )}
        </View>

        {/* Milestones */}
        <View style={[styles.section, { borderTopColor: colors.line }]}>
          <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>
            {t.milestonesTitle.toUpperCase()}
          </Text>
          <Text style={[styles.milestoneLabel, { color: colors.ink2 }]}>Tổng tích luỹ</Text>
          <View style={styles.totalRow}>
            <Text style={[styles.totalValue, { color: colors.ink }]}>
              {allTimeTotal.toLocaleString()}
            </Text>
            <Text style={[styles.totalUnit, { color: colors.ink2 }]}> {t.reps}</Text>
          </View>

          {/* Progress bar to next milestone */}
          {(() => {
            const next = milestones.find(m => m > allTimeTotal) ?? milestones.at(-1)!;
            const pct = Math.min((allTimeTotal / next) * 100, 100);
            return (
              <>
                <View style={styles.nextRow}>
                  <Text style={[styles.nextLabel, { color: colors.ink2 }]}>
                    {t.nextMilestone} · {next.toLocaleString()}
                  </Text>
                  <Text style={[styles.nextPct, { color: colors.ink }]}>
                    {Math.round(pct)}%
                  </Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: colors.line }]}>
                  <View style={[styles.progressFg, { width: `${pct}%`, backgroundColor: colors.accent }]} />
                </View>
              </>
            );
          })()}

          <View style={styles.milestonePills}>
            {milestones.slice(0, 4).map(m => {
              const done = allTimeTotal >= m;
              return (
                <View
                  key={m}
                  style={[
                    styles.milestonePill,
                    {
                      backgroundColor: done ? colors.accentSoft : 'transparent',
                      borderColor: done ? 'transparent' : colors.line,
                      borderWidth: done ? 0 : 1,
                    },
                  ]}
                >
                  {done && <Icon name="check" size={10} stroke={colors.accent} sw={2.5} />}
                  <Text style={[styles.milestonePillText, {
                    color: done ? colors.accent : colors.ink2,
                  }]}>
                    {(m / 1000).toFixed(0)}k
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Records */}
        <View style={[styles.section, { borderTopColor: colors.line }]}>
          <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>
            {t.recordsTitle.toUpperCase()}
          </Text>
          {[
            { label: t.recordSet, val: bestSet > 0 ? `${bestSet} ${t.reps}` : '—' },
            { label: t.recordDay, val: bestDay > 0 ? `${bestDay} ${t.reps}` : '—' },
            { label: t.recordWeek, val: bestWeek > 0 ? `${bestWeek} ${t.reps}` : '—' },
          ].map((r, i, arr) => (
            <View
              key={i}
              style={[styles.recordRow, {
                borderBottomColor: colors.line,
                borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
              }]}
            >
              <Text style={[styles.recordLabel, { color: colors.ink }]}>{r.label}</Text>
              <Text style={[styles.recordVal, { color: colors.ink }]}>{r.val}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  statusBarCover: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  content: { paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: '400', letterSpacing: -0.8, marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 24 },
  exFilterScroll: { marginBottom: 14 },
  exFilterContent: { gap: 8, paddingBottom: 4 },
  exChip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18,
  },
  exChipText: { fontSize: 13, fontWeight: '500' },
  timeGrid: {
    flexDirection: 'row', gap: 2, padding: 3,
    borderRadius: 10, marginBottom: 28,
  },
  timeBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
  },
  timeBtnText: { fontSize: 12 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8,
  },
  chartHeader: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14,
  },
  chartValue: { fontSize: 32, fontWeight: '300', letterSpacing: -1, lineHeight: 36 },
  chartSub: { fontSize: 13 },
  diffBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto',
  },
  diffText: { fontSize: 13, fontWeight: '500' },
  emptyChart: {
    height: 120, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 14 },
  section: {
    paddingTop: 24, borderTopWidth: StyleSheet.hairlineWidth, marginBottom: 32,
  },
  compareRow: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  compareCell: { flex: 1 },
  compareLabel: { fontSize: 11, marginBottom: 4 },
  compareValue: { fontSize: 22, fontWeight: '400', letterSpacing: -0.3 },
  diffCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 10,
  },
  diffCardText: { fontSize: 13, fontWeight: '500', flex: 1 },
  milestoneLabel: { fontSize: 13, marginBottom: 6 },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', gap: 0, marginBottom: 18 },
  totalValue: { fontSize: 44, fontWeight: '300', letterSpacing: -1.5, lineHeight: 48 },
  totalUnit: { fontSize: 13 },
  nextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  nextLabel: { fontSize: 12 },
  nextPct: { fontSize: 12, fontWeight: '500' },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 14 },
  progressFg: { height: '100%', borderRadius: 3 },
  milestonePills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  milestonePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12,
  },
  milestonePillText: { fontSize: 11, fontWeight: '500' },
  recordRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingVertical: 14,
  },
  recordLabel: { fontSize: 14 },
  recordVal: { fontSize: 17, fontWeight: '500' },
});
