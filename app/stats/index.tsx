import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useLogStore } from '@/store/useLogStore';
import TabBar from '@/components/ui/TabBar';
import ExerciseFilterBar from '@/components/ui/ExerciseFilterBar';
import TimeRangeTabs, { TimeRange } from '@/components/ui/TimeRangeTabs';
import PeriodNav from '@/components/ui/PeriodNav';
import LineChart from '@/components/charts/LineChart';
import { TAB_BAR_HEIGHT } from '@/constants/theme';
import { getWeekDates, getDateString } from '@/firebase/logs';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, lang } = useTranslation();
  const user = useAuthStore(s => s.user);
  const exercises = useExerciseStore(s => s.exercises);
  const { rangedLogs, loadLogs, loading } = useLogStore();

  const [range, setRange] = useState<TimeRange>('week');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [offset, setOffset] = useState(0);

  const monthLabels = lang === 'vi'
    ? ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  useEffect(() => { setOffset(0); }, [range]);

  useEffect(() => {
    if (!user) return;
    const { startMs, endMs } = getLoadRange();
    loadLogs(user.uid, startMs, endMs);
  }, [user, range, offset]);

  const now = new Date();

  // Load current + previous period for comparison
  function getLoadRange(): { startMs: number; endMs: number } {
    if (range === 'week') {
      const base = new Date(getWeekDates(now)[0]);
      base.setDate(base.getDate() + offset * 7);
      const weekDs = getWeekDates(base);
      const start = new Date(weekDs[0]);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(weekDs[6]); end.setHours(23, 59, 59, 999);
      return { startMs: start.getTime(), endMs: end.getTime() };
    }
    if (range === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth() + offset - 1, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { startMs: start.getTime(), endMs: end.getTime() };
    }
    const y = now.getFullYear() + offset;
    const start = new Date(y - 1, 0, 1); start.setHours(0, 0, 0, 0);
    const end = new Date(y, 11, 31); end.setHours(23, 59, 59, 999);
    return { startMs: start.getTime(), endMs: end.getTime() };
  }

  function getCurrentPeriodBounds(): { startMs: number; endMs: number } {
    if (range === 'week') {
      const base = new Date(getWeekDates(now)[0]);
      base.setDate(base.getDate() + offset * 7);
      const weekDs = getWeekDates(base);
      const start = new Date(weekDs[0]); start.setHours(0, 0, 0, 0);
      const end = new Date(weekDs[6]); end.setHours(23, 59, 59, 999);
      return { startMs: start.getTime(), endMs: end.getTime() };
    }
    if (range === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { startMs: start.getTime(), endMs: end.getTime() };
    }
    const y = now.getFullYear() + offset;
    const start = new Date(y, 0, 1); start.setHours(0, 0, 0, 0);
    const end = new Date(y, 11, 31); end.setHours(23, 59, 59, 999);
    return { startMs: start.getTime(), endMs: end.getTime() };
  }

  // Period label
  function getPeriodInfo(): { label: string; sub: string } {
    if (range === 'week') {
      const base = new Date(getWeekDates(now)[0]);
      base.setDate(base.getDate() + offset * 7);
      const weekDs = getWeekDates(base);
      const wStart = weekDs[0], wEnd = weekDs[6];
      const label = `${wStart.getDate().toString().padStart(2,'0')} – ${wEnd.getDate().toString().padStart(2,'0')} · ${(wEnd.getMonth()+1).toString().padStart(2,'0')} · ${wEnd.getFullYear()}`;
      return { label, sub: offset === 0 ? t.thisWeek : `${Math.abs(offset)} ${t.weeksAgo}` };
    }
    if (range === 'month') {
      const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const label = lang === 'vi'
        ? `Tháng ${ref.getMonth() + 1} · ${ref.getFullYear()}`
        : `${monthLabels[ref.getMonth()]} ${ref.getFullYear()}`;
      return { label, sub: offset === 0 ? t.thisMonth : `${Math.abs(offset)} ${t.monthsAgo}` };
    }
    const y = now.getFullYear() + offset;
    return { label: `${y}`, sub: offset === 0 ? t.thisYear : `${Math.abs(offset)} ${t.yearsAgo}` };
  }

  const { label: periodLabel, sub: periodSub } = getPeriodInfo();
  const { startMs: currStart, endMs: currEnd } = getCurrentPeriodBounds();

  const baseLogs = selectedFilter === 'all'
    ? rangedLogs
    : rangedLogs.filter(l => l.exerciseId === selectedFilter);

  const currentLogs = baseLogs.filter(l => l.createdAt >= currStart && l.createdAt <= currEnd);
  const prevLogs = baseLogs.filter(l => l.createdAt < currStart);

  const currentTotal = currentLogs.reduce((s, l) => s + l.value, 0);
  const prevTotal = prevLogs.reduce((s, l) => s + l.value, 0);
  const diff = currentTotal - prevTotal;
  const diffPct = prevTotal > 0 ? Math.round((diff / prevTotal) * 100) : 0;

  // Unit label for filtered exercise
  const filteredExercise = selectedFilter !== 'all' ? exercises.find(e => e.id === selectedFilter) : null;
  const unitLabel = filteredExercise
    ? (filteredExercise.unit === 'reps' ? t.reps
      : filteredExercise.unit === 'duration' ? t.seconds
      : filteredExercise.unit === 'minutes' ? t.minutes
      : filteredExercise.unit === 'km' ? t.km
      : t.meters)
    : '';

  // Period count for avg
  const periodCount = range === 'week' ? 7
    : range === 'month' ? new Date(now.getFullYear(), now.getMonth() + offset + 1, 0).getDate()
    : ((now.getFullYear() + offset) % 4 === 0 ? 366 : 365);
  const avg = currentTotal > 0 ? Math.round(currentTotal / periodCount) : 0;

  // Best entry in current period
  function getBest(): number {
    if (range === 'week') {
      const base = new Date(getWeekDates(now)[0]);
      base.setDate(base.getDate() + offset * 7);
      const weekDs = getWeekDates(base);
      const dailyTotals = weekDs.map(d => {
        const ds = getDateString(d);
        return currentLogs.filter(l => getDateString(new Date(l.createdAt)) === ds).reduce((s, l) => s + l.value, 0);
      });
      return Math.max(0, ...dailyTotals);
    }
    if (range === 'month') {
      const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const days = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
      let best = 0;
      for (let i = 1; i <= days; i++) {
        const ds = getDateString(new Date(ref.getFullYear(), ref.getMonth(), i));
        const dayTotal = currentLogs.filter(l => getDateString(new Date(l.createdAt)) === ds).reduce((s, l) => s + l.value, 0);
        if (dayTotal > best) best = dayTotal;
      }
      return best;
    }
    // year: best month
    const y = now.getFullYear() + offset;
    let best = 0;
    for (let m = 0; m < 12; m++) {
      const monthTotal = currentLogs.filter(l => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === y && d.getMonth() === m;
      }).reduce((s, l) => s + l.value, 0);
      if (monthTotal > best) best = monthTotal;
    }
    return best;
  }
  const best = getBest();

  // Chart data
  function getChartData(): { data: number[]; labels: string[] } {
    if (!filteredExercise) return { data: [], labels: [] };

    if (range === 'week') {
      const base = new Date(getWeekDates(now)[0]);
      base.setDate(base.getDate() + offset * 7);
      const weekDs = getWeekDates(base);
      const dayNames = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];
      const data = weekDs.map(d => {
        const ds = getDateString(d);
        return currentLogs.filter(l => getDateString(new Date(l.createdAt)) === ds).reduce((s, l) => s + l.value, 0);
      });
      return { data, labels: dayNames };
    }

    if (range === 'month') {
      const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const weeks: { start: Date; end: Date; label: string }[] = [];
      let cursor = new Date(ref);
      let w = 1;
      while (cursor.getMonth() === ref.getMonth()) {
        const wStart = new Date(cursor);
        const wEnd = new Date(cursor);
        wEnd.setDate(wEnd.getDate() + 6);
        if (wEnd.getMonth() !== ref.getMonth()) wEnd.setDate(new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate());
        weeks.push({ start: wStart, end: wEnd, label: `W${w}` });
        cursor.setDate(cursor.getDate() + 7);
        w++;
      }
      const data = weeks.map(wk =>
        currentLogs.filter(l => l.createdAt >= wk.start.getTime() && l.createdAt <= new Date(wk.end).setHours(23,59,59,999)).reduce((s, l) => s + l.value, 0)
      );
      return { data, labels: weeks.map(wk => wk.label) };
    }

    // year
    const y = now.getFullYear() + offset;
    const data = Array.from({ length: 12 }, (_, i) =>
      currentLogs.filter(l => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === y && d.getMonth() === i;
      }).reduce((s, l) => s + l.value, 0)
    );
    return { data, labels: monthLabels };
  }

  const { data: chartData, labels: chartLabels } = getChartData();
  const hasChartData = chartData.some(v => v > 0);

  // Overview for "Tất cả" mode
  const activeDays = new Set(currentLogs.map(l => getDateString(new Date(l.createdAt)))).size;
  const totalSets = currentLogs.length;

  // Exercise breakdown for "Tất cả"
  const exerciseBreakdown = exercises.map(ex => {
    const exLogs = currentLogs.filter(l => l.exerciseId === ex.id);
    const total = exLogs.reduce((s, l) => s + l.value, 0);
    const unit = ex.unit === 'reps' ? t.reps
      : ex.unit === 'duration' ? t.seconds
      : ex.unit === 'minutes' ? t.minutes
      : ex.unit === 'km' ? t.km
      : t.meters;
    return { ex, total, unit };
  }).filter(e => e.total > 0).sort((a, b) => b.total - a.total);
  const maxBreakdown = Math.max(...exerciseBreakdown.map(e => e.total), 1);

  // Comparison label
  const prevPeriodLabel = range === 'week' ? t.weeksAgo
    : range === 'month' ? t.monthsAgo
    : t.yearsAgo;

  const filterItems = [
    { id: 'all', icon: '★', name: t.allExercises },
    ...exercises.map(ex => ({ id: ex.id, icon: ex.icon, name: ex.name })),
  ];

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <View style={[styles.statusBarCover, { height: insets.top, backgroundColor: colors.bg }]} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_HEIGHT + 24 },
        ]}
      >
        <Text style={[styles.title, { color: colors.ink }]}>{t.statsTitle}</Text>
        <Text style={[styles.subtitle, { color: colors.ink2 }]}>{t.statsSubtitle}</Text>

        <ExerciseFilterBar items={filterItems} selectedId={selectedFilter} onSelect={setSelectedFilter} />
        <TimeRangeTabs range={range} onChange={setRange} />
        <PeriodNav
          label={periodLabel}
          sub={periodSub}
          isPresent={offset === 0}
          onPrev={() => setOffset(o => o - 1)}
          onNext={() => setOffset(o => Math.min(0, o + 1))}
        />

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} />
        ) : selectedFilter === 'all' ? (
          /* ── TẤT CẢ: Overview dashboard ── */
          <>
            {/* Overview stats */}
            <View style={styles.overviewRow}>
              <View style={styles.overviewCell}>
                <Text style={[styles.overviewValue, { color: colors.ink }]}>{activeDays}</Text>
                <Text style={[styles.overviewLabel, { color: colors.ink2 }]}>{t.activeDays}</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: colors.line }]} />
              <View style={styles.overviewCell}>
                <Text style={[styles.overviewValue, { color: colors.ink }]}>{totalSets}</Text>
                <Text style={[styles.overviewLabel, { color: colors.ink2 }]}>{t.totalSets}</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: colors.line }]} />
              <View style={styles.overviewCell}>
                <Text style={[styles.overviewValue, { color: currentTotal > prevTotal ? colors.accent : colors.ink }]}>
                  {diff >= 0 ? '+' : ''}{diffPct}%
                </Text>
                <Text style={[styles.overviewLabel, { color: colors.ink2 }]}>{t.vsPrev}</Text>
              </View>
            </View>

            {/* Exercise breakdown */}
            {exerciseBreakdown.length > 0 ? (
              <View style={[styles.section, { borderTopColor: colors.line }]}>
                <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>{t.exerciseBreakdown.toUpperCase()}</Text>
                {exerciseBreakdown.map(({ ex, total, unit }) => (
                  <View key={ex.id} style={styles.breakdownRow}>
                    <Text style={styles.breakdownIcon}>{ex.icon}</Text>
                    <View style={styles.breakdownInfo}>
                      <View style={styles.breakdownTop}>
                        <Text style={[styles.breakdownName, { color: colors.ink }]}>{ex.name}</Text>
                        <Text style={[styles.breakdownVal, { color: ex.color }]}>
                          {total} {unit}
                        </Text>
                      </View>
                      <View style={[styles.barBg, { backgroundColor: colors.line }]}>
                        <View style={[styles.barFg, {
                          width: `${Math.round((total / maxBreakdown) * 100)}%`,
                          backgroundColor: ex.color,
                        }]} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyBox, { borderColor: colors.line }]}>
                <Text style={[styles.emptyText, { color: colors.ink2 }]}>{t.noData}</Text>
              </View>
            )}
          </>
        ) : (
          /* ── CỤ THỂ 1 MÔN: Deep dive ── */
          <>
            {/* Summary stats */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryLabel, { color: colors.ink2 }]}>{t.total.toUpperCase()}</Text>
                <View style={styles.summaryValueRow}>
                  <Text style={[styles.summaryValue, { color: colors.ink }]}>{currentTotal || '—'}</Text>
                  {currentTotal > 0 && <Text style={[styles.summaryUnit, { color: colors.ink2 }]}>{unitLabel}</Text>}
                </View>
              </View>
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryLabel, { color: colors.ink2 }]}>{t.avgPerDay.toUpperCase()}</Text>
                <View style={styles.summaryValueRow}>
                  <Text style={[styles.summaryValue, { color: colors.ink }]}>{avg || '—'}</Text>
                  {avg > 0 && <Text style={[styles.summaryUnit, { color: colors.ink2 }]}>{unitLabel}</Text>}
                </View>
              </View>
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryLabel, { color: colors.ink2 }]}>{t.best.toUpperCase()}</Text>
                <View style={styles.summaryValueRow}>
                  <Text style={[styles.summaryValue, { color: colors.accent }]}>{best || '—'}</Text>
                  {best > 0 && <Text style={[styles.summaryUnit, { color: colors.accent }]}>{unitLabel}</Text>}
                </View>
              </View>
            </View>

            {/* Trend chart */}
            <View style={[styles.section, { borderTopColor: colors.line }]}>
              <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>{t.trendChart.toUpperCase()}</Text>
              {hasChartData ? (
                <LineChart data={chartData} labels={chartLabels} />
              ) : (
                <View style={[styles.emptyBox, { borderColor: colors.line }]}>
                  <Text style={[styles.emptyText, { color: colors.ink2 }]}>{t.noData}</Text>
                </View>
              )}
            </View>

            {/* Period comparison */}
            <View style={[styles.section, { borderTopColor: colors.line }]}>
              <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>{t.compareTitle.toUpperCase()}</Text>
              <View style={styles.compareRow}>
                <View style={styles.compareCell}>
                  <Text style={[styles.compareLabel, { color: colors.ink2 }]}>1 {prevPeriodLabel}</Text>
                  <View style={styles.summaryValueRow}>
                    <Text style={[styles.compareValue, { color: colors.ink }]}>{prevTotal || '—'}</Text>
                    {prevTotal > 0 && <Text style={[styles.summaryUnit, { color: colors.ink2 }]}>{unitLabel}</Text>}
                  </View>
                </View>
                <View style={styles.compareCell}>
                  <Text style={[styles.compareLabel, { color: colors.ink2 }]}>{periodSub}</Text>
                  <View style={styles.summaryValueRow}>
                    <Text style={[styles.compareValue, { color: colors.ink }]}>{currentTotal || '—'}</Text>
                    {currentTotal > 0 && <Text style={[styles.summaryUnit, { color: colors.ink2 }]}>{unitLabel}</Text>}
                  </View>
                </View>
              </View>
              {currentTotal > 0 && prevTotal > 0 && (
                <View style={[styles.diffCard, { backgroundColor: colors.accentSoft }]}>
                  <Text style={[styles.diffText, { color: colors.accentInk }]}>
                    {diff >= 0 ? '↑' : '↓'} {diff >= 0 ? '+' : ''}{diff} {unitLabel} ({diffPct >= 0 ? '+' : ''}{diffPct}%) {t.vsLastWeek}
                  </Text>
                </View>
              )}
            </View>

            {/* Records */}
            <View style={[styles.section, { borderTopColor: colors.line }]}>
              <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>{t.recordsTitle.toUpperCase()}</Text>
              {[
                {
                  label: range === 'year' ? t.bestMonth : t.recordDay,
                  val: best > 0 ? `${best} ${unitLabel}` : '—',
                },
                {
                  label: t.total,
                  val: currentTotal > 0 ? `${currentTotal} ${unitLabel}` : '—',
                },
              ].map((r, i, arr) => (
                <View key={i} style={[styles.recordRow, {
                  borderBottomColor: colors.line,
                  borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                }]}>
                  <Text style={[styles.recordLabel, { color: colors.ink }]}>{r.label}</Text>
                  <Text style={[styles.recordVal, { color: colors.ink }]}>{r.val}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  statusBarCover: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  content: { paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: '400', letterSpacing: -0.8 },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 24 },

  // Overview
  overviewRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 20, marginBottom: 8,
  },
  overviewCell: { flex: 1, alignItems: 'center' },
  overviewDivider: { width: StyleSheet.hairlineWidth, height: 40 },
  overviewValue: { fontSize: 32, fontWeight: '300', letterSpacing: -1 },
  overviewLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, marginTop: 4 },

  // Breakdown
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  breakdownIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  breakdownInfo: { flex: 1 },
  breakdownTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakdownName: { fontSize: 14, fontWeight: '500' },
  breakdownVal: { fontSize: 14, fontWeight: '600' },
  barBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  barFg: { height: '100%', borderRadius: 2 },

  // Summary stats
  summaryRow: { flexDirection: 'row', marginBottom: 8 },
  summaryCell: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  summaryLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textAlign: 'center' },
  summaryValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 4, justifyContent: 'center' },
  summaryValue: { fontSize: 28, fontWeight: '300', letterSpacing: -0.8 },
  summaryUnit: { fontSize: 13, fontWeight: '400', marginBottom: 3 },

  // Section
  section: { paddingTop: 24, borderTopWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 16 },

  // Compare
  compareRow: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  compareCell: { flex: 1 },
  compareLabel: { fontSize: 11, marginBottom: 4 },
  compareValue: { fontSize: 28, fontWeight: '300', letterSpacing: -0.8 },
  diffCard: { padding: 12, borderRadius: 10 },
  diffText: { fontSize: 13, fontWeight: '500' },

  // Records
  recordRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingVertical: 14,
  },
  recordLabel: { fontSize: 14 },
  recordVal: { fontSize: 17, fontWeight: '500' },

  // Empty
  emptyBox: { height: 100, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14 },
});
