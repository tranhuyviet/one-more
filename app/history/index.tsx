import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useLogStore } from '@/store/useLogStore';
import Icon from '@/components/ui/Icon';
import TabBar from '@/components/ui/TabBar';
import DayDetail from '@/components/exercise/DayDetail';
import { TAB_BAR_HEIGHT } from '@/constants/theme';
import { ExerciseLog, Exercise } from '@/types';
import { getWeekDates, getDateString } from '@/firebase/logs';

type TimeRange = 'week' | 'month' | 'year';

interface PeriodEntry {
  key: string;
  label: string;
  subLabel: string;
  exercises: {
    exercise: Exercise;
    total: number;
    sets: number;
    logs: ExerciseLog[];
  }[];
  isCurrentPeriod: boolean;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, lang } = useTranslation();
  const user = useAuthStore(s => s.user);
  const exercises = useExerciseStore(s => s.exercises);
  const { rangedLogs, loadLogs, loading } = useLogStore();

  const [range, setRange] = useState<TimeRange>('week');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const weekDayLabels = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];
  const dowLabels = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat];
  const monthLabels = lang === 'vi'
    ? ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  useEffect(() => {
    setOffset(0);
    setSelectedKey(null);
  }, [range]);

  useEffect(() => {
    if (!user) return;
    const { startMs, endMs } = getRangeMs();
    loadLogs(user.uid, startMs, endMs);
  }, [user, range, offset]);

  function getRangeMs(): { startMs: number; endMs: number } {
    const now = new Date();
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

  const filteredLogs = selectedFilter === 'all'
    ? rangedLogs
    : rangedLogs.filter(l => l.exerciseId === selectedFilter);

  function buildExGroups(logs: ExerciseLog[], withLogs: boolean): PeriodEntry['exercises'] {
    return exercises.map(ex => {
      const exLogs = logs.filter(l => l.exerciseId === ex.id);
      if (exLogs.length === 0) return null;
      return {
        exercise: ex,
        total: exLogs.reduce((s, l) => s + l.value, 0),
        sets: exLogs.length,
        logs: withLogs ? exLogs.sort((a, b) => a.createdAt - b.createdAt) : [],
      };
    }).filter(Boolean) as PeriodEntry['exercises'];
  }

  const now = new Date();
  const nowDateStr = getDateString(now);
  let entries: PeriodEntry[] = [];
  let periodLabel = '';
  let periodSub = '';
  let periodCount = 7;

  if (range === 'week') {
    const base = new Date(getWeekDates(now)[0]);
    base.setDate(base.getDate() + offset * 7);
    const weekDs = getWeekDates(base);
    entries = weekDs.map((d, i) => {
      const dateStr = getDateString(d);
      const dayLogs = filteredLogs.filter(l => getDateString(new Date(l.createdAt)) === dateStr);
      return {
        key: dateStr,
        label: weekDayLabels[i],
        subLabel: `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}`,
        exercises: buildExGroups(dayLogs, true),
        isCurrentPeriod: nowDateStr === dateStr,
      };
    }).reverse();

    const wStart = weekDs[0], wEnd = weekDs[6];
    periodLabel = `${wStart.getDate().toString().padStart(2,'0')} – ${wEnd.getDate().toString().padStart(2,'0')} · ${(wEnd.getMonth()+1).toString().padStart(2,'0')} · ${wEnd.getFullYear()}`;
    periodSub = offset === 0 ? t.thisWeek : `${Math.abs(offset)} ${t.weeksAgo}`;
    periodCount = 7;

  } else if (range === 'month') {
    const refMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const daysInMonth = new Date(refMonth.getFullYear(), refMonth.getMonth() + 1, 0).getDate();
    entries = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(refMonth.getFullYear(), refMonth.getMonth(), i + 1);
      const dateStr = getDateString(d);
      const dayLogs = filteredLogs.filter(l => getDateString(new Date(l.createdAt)) === dateStr);
      return {
        key: dateStr,
        label: dowLabels[d.getDay()],
        subLabel: `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}`,
        exercises: buildExGroups(dayLogs, true),
        isCurrentPeriod: nowDateStr === dateStr,
      };
    }).reverse();

    periodLabel = lang === 'vi'
      ? `Tháng ${refMonth.getMonth() + 1} · ${refMonth.getFullYear()}`
      : `${monthLabels[refMonth.getMonth()]} ${refMonth.getFullYear()}`;
    periodSub = offset === 0 ? t.thisMonth : `${Math.abs(offset)} ${t.monthsAgo}`;
    periodCount = daysInMonth;

  } else {
    const refYear = now.getFullYear() + offset;
    entries = Array.from({ length: 12 }, (_, i) => {
      const monthLogs = filteredLogs.filter(l => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === refYear && d.getMonth() === i;
      });
      return {
        key: `${refYear}-${(i+1).toString().padStart(2,'0')}`,
        label: monthLabels[i],
        subLabel: (i+1).toString().padStart(2,'0'),
        exercises: buildExGroups(monthLogs, false),
        isCurrentPeriod: now.getFullYear() === refYear && now.getMonth() === i,
      };
    }).reverse();

    periodLabel = `${refYear}`;
    periodSub = offset === 0 ? t.thisYear : `${Math.abs(offset)} ${t.yearsAgo}`;
    periodCount = 12;
  }

  const totalReps = filteredLogs.reduce((s, l) => s + l.value, 0);
  const entryTotals = entries.map(e => e.exercises.reduce((s, ex) => s + ex.total, 0));
  const best = filteredLogs.length > 0 ? Math.max(...entryTotals) : 0;
  const maxInPeriod = Math.max(...entryTotals, 1);
  const avg = totalReps > 0 ? Math.round(totalReps / periodCount) : 0;
  const avgLabel = range === 'year' ? t.avgPerMonth : t.avgPerDay;

  const isFilteredByExercise = selectedFilter !== 'all';
  const filteredExercise = isFilteredByExercise ? exercises.find(e => e.id === selectedFilter) : null;
  const unitShortLabel = filteredExercise
    ? (filteredExercise.unit === 'reps' ? t.reps
      : filteredExercise.unit === 'duration' ? t.seconds
      : filteredExercise.unit === 'minutes' ? t.minutes
      : filteredExercise.unit === 'km' ? t.km
      : t.meters)
    : '';

  const exerciseFilters = [
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
        {/* Header */}
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.ink }]}>{t.historyTitle}</Text>
            <Text style={[styles.subtitle, { color: colors.ink2 }]}>{t.historySubtitle}</Text>
          </View>
        </View>

        {/* Exercise filter chips */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {exerciseFilters.map(ex => {
            const active = ex.id === selectedFilter;
            return (
              <TouchableOpacity
                key={ex.id}
                style={[
                  styles.filterChip,
                  {
                    borderColor: active ? colors.accent : colors.line,
                    borderWidth: active ? 1.5 : 1,
                    backgroundColor: active ? colors.accentSoft : 'transparent',
                  },
                ]}
                onPress={() => setSelectedFilter(ex.id)}
              >
                <Text style={[styles.filterIcon, { color: active ? colors.accentInk : colors.ink }]}>{ex.icon}</Text>
                <Text style={[styles.filterName, {
                  color: active ? colors.accentInk : colors.ink,
                  fontWeight: active ? '600' : '500',
                }]}>
                  {ex.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time range */}
        <View style={[styles.rangeControl, { backgroundColor: colors.card }]}>
          {(['week', 'month', 'year'] as TimeRange[]).map(r => {
            const labels: Record<TimeRange, string> = { week: t.week, month: t.month, year: t.year };
            const active = r === range;
            return (
              <TouchableOpacity
                key={r}
                style={[styles.rangeBtn, active && { backgroundColor: colors.bg }]}
                onPress={() => setRange(r)}
              >
                <Text style={[styles.rangeBtnText, {
                  color: active ? colors.ink : colors.ink2,
                  fontWeight: active ? '600' : '500',
                }]}>
                  {labels[r]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Period navigator */}
        <View style={[styles.periodNav, { borderBottomColor: colors.line }]}>
          <TouchableOpacity
            style={[styles.navBtn, { borderColor: colors.line }]}
            onPress={() => setOffset(o => o - 1)}
          >
            <Icon name="chevLeft" size={12} stroke={colors.ink2} sw={2} />
          </TouchableOpacity>
          <View style={styles.periodCenter}>
            <Text style={[styles.periodLabel, { color: colors.ink }]}>{periodLabel}</Text>
            <Text style={[styles.periodSub, {
              color: offset === 0 ? colors.accent : colors.ink2,
              fontWeight: offset === 0 ? '600' : '400',
            }]}>
              {periodSub}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.navBtn, { borderColor: colors.line, opacity: offset >= 0 ? 0.35 : 1 }]}
            onPress={() => setOffset(o => Math.min(0, o + 1))}
            disabled={offset >= 0}
          >
            <Icon name="chev" size={12} stroke={colors.ink2} sw={2} />
          </TouchableOpacity>
        </View>

        {/* Period summary — only when filtered by a specific exercise */}
        {isFilteredByExercise && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryLabel, { color: colors.ink2 }]}>{t.total.toUpperCase()}</Text>
              <Text style={[styles.summaryValue, { color: colors.ink }]}>{totalReps || '—'}</Text>
              {totalReps > 0 && <Text style={[styles.summaryUnit, { color: colors.ink2 }]}>{unitShortLabel}</Text>}
            </View>
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryLabel, { color: colors.ink2 }]}>{avgLabel.toUpperCase()}</Text>
              <Text style={[styles.summaryValue, { color: colors.ink }]}>{avg || '—'}</Text>
              {avg > 0 && <Text style={[styles.summaryUnit, { color: colors.ink2 }]}>{unitShortLabel}</Text>}
            </View>
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryLabel, { color: colors.ink2 }]}>{t.best.toUpperCase()}</Text>
              <Text style={[styles.summaryValue, { color: colors.accent }]}>{best || '—'}</Text>
              {best > 0 && <Text style={[styles.summaryUnit, { color: colors.accent }]}>{unitShortLabel}</Text>}
            </View>
          </View>
        )}

        {/* Entry list */}
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
        ) : (
          entries.map((entry, i) => {
            const totalAll = entry.exercises.reduce((s, e) => s + e.total, 0);
            const isEmpty = entry.exercises.length === 0;
            const isSelected = selectedKey === entry.key;
            const canExpand = range !== 'year' && !isEmpty;

            return (
              <View key={entry.key}>
                <TouchableOpacity
                  style={[
                    styles.dayRow,
                    {
                      backgroundColor: isSelected ? colors.accentSoft : 'transparent',
                      marginHorizontal: -12,
                      paddingHorizontal: 12,
                      borderRadius: isSelected ? 12 : 0,
                      borderBottomColor: !isSelected && i < entries.length - 1 ? colors.line : 'transparent',
                      borderBottomWidth: !isSelected && i < entries.length - 1 ? StyleSheet.hairlineWidth : 0,
                      opacity: isEmpty ? 0.4 : 1,
                    },
                  ]}
                  onPress={() => canExpand && setSelectedKey(isSelected ? null : entry.key)}
                  activeOpacity={canExpand ? 0.7 : 1}
                >
                  <View style={styles.dayMeta}>
                    <Text style={[styles.dayName, {
                      color: isSelected ? colors.accent : colors.ink2,
                      fontWeight: isSelected ? '700' : '400',
                    }]}>
                      {entry.label}
                    </Text>
                    <Text style={[styles.dayDate, {
                      color: isSelected ? colors.accentInk : colors.ink,
                      fontWeight: isSelected ? '600' : '400',
                    }]}>
                      {entry.subLabel}
                    </Text>
                  </View>

                  <View style={styles.dayContent}>
                    <View style={styles.exBadges}>
                      {entry.exercises.map((e, j) => (
                        <View
                          key={j}
                          style={[styles.exBadge, {
                            backgroundColor: isSelected ? colors.accentLine : colors.card,
                          }]}
                        >
                          <Text style={styles.exBadgeIcon}>{e.exercise.icon}</Text>
                          <Text style={[styles.exBadgeVal, {
                            color: isSelected ? colors.accentInk : colors.ink2,
                          }]}>
                            {e.total}
                          </Text>
                        </View>
                      ))}
                      {isEmpty && (
                        <Text style={[styles.emptyLabel, { color: colors.ink2 }]}>
                          {t.noWorkout}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: isSelected ? colors.accentLine : colors.line }]}>
                      <View style={[styles.progressFill, {
                        width: `${Math.min((totalAll / maxInPeriod) * 100, 100)}%`,
                        backgroundColor: entry.isCurrentPeriod || isSelected ? colors.accent : colors.ink,
                      }]} />
                    </View>
                  </View>

                  <View style={styles.dayRight}>
                    {isFilteredByExercise && (
                      <View style={styles.dayTotalWrap}>
                        <Text style={[styles.dayTotal, {
                          color: isSelected ? colors.accentInk : colors.ink,
                        }]}>
                          {totalAll || '—'}
                        </Text>
                        {totalAll > 0 && (
                          <Text style={[styles.dayTotalUnit, { color: isSelected ? colors.accentInk : colors.ink2 }]}>
                            {unitShortLabel}
                          </Text>
                        )}
                      </View>
                    )}
                    {canExpand && (
                      <View style={{ transform: [{ rotate: isSelected ? '90deg' : '0deg' }] }}>
                        <Icon name="chev" size={14} stroke={isSelected ? colors.accent : colors.ink2} sw={2} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {isSelected && canExpand && (
                  <View style={styles.inlineDetail}>
                    <DayDetail exercises={entry.exercises} />
                  </View>
                )}
              </View>
            );
          })
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
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 },
  title: { fontSize: 32, fontWeight: '400', letterSpacing: -0.8 },
  subtitle: { fontSize: 13, marginTop: 4 },
  filterScroll: { marginBottom: 14 },
  filterContent: { gap: 8, paddingBottom: 4 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 22,
  },
  filterIcon: { fontSize: 15 },
  filterName: { fontSize: 14 },
  rangeControl: {
    flexDirection: 'row', gap: 2, padding: 3,
    borderRadius: 12, marginBottom: 18,
  },
  rangeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center',
  },
  rangeBtnText: { fontSize: 13 },
  periodNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 20,
  },
  navBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  periodCenter: { alignItems: 'center' },
  periodLabel: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  periodSub: { fontSize: 11, marginTop: 2, letterSpacing: 0.3 },
  summaryRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  summaryCell: { flex: 1 },
  summaryLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.6 },
  summaryValue: { fontSize: 28, fontWeight: '300', letterSpacing: -0.8, marginTop: 4 },
  summaryUnit: { fontSize: 11, marginTop: 2 },
  dayRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 18, marginBottom: 2,
  },
  dayMeta: { width: 56 },
  dayName: { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  dayDate: { fontSize: 15, marginTop: 2 },
  dayContent: { flex: 1 },
  exBadges: { flexDirection: 'row', gap: 4, marginBottom: 6, flexWrap: 'wrap' },
  exBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingVertical: 2, paddingHorizontal: 7, borderRadius: 8,
  },
  exBadgeIcon: { fontSize: 11 },
  exBadgeVal: { fontSize: 11, fontWeight: '500', fontVariant: ['tabular-nums'] },
  emptyLabel: { fontSize: 12, fontStyle: 'italic' },
  progressBar: { height: 2, borderRadius: 1, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 1 },
  dayRight: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 4, paddingLeft: 8 },
  dayTotalWrap: { alignItems: 'flex-end' },
  dayTotal: { fontSize: 22, fontWeight: '300', letterSpacing: -0.5 },
  dayTotalUnit: { fontSize: 11, marginTop: 1 },
  inlineDetail: { paddingBottom: 12 },
});
