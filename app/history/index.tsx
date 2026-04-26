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
import { getWeekDates, getDateString, aggregateDailyStats } from '@/firebase/logs';

type TimeRange = 'day' | 'week' | 'month' | 'year';

interface DayEntry {
  date: string;
  dayLabel: string;
  dateLabel: string;
  exercises: {
    exercise: Exercise;
    total: number;
    sets: number;
    logs: ExerciseLog[];
  }[];
  isToday: boolean;
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
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];

  useEffect(() => {
    if (!user) return;
    const { startMs, endMs } = getRangeMs();
    loadLogs(user.uid, startMs, endMs);
  }, [user, range, weekOffset]);

  function getRangeMs() {
    const now = new Date();
    if (range === 'week') {
      const weekDates = getWeekDates(now);
      const refDate = new Date(weekDates[0]);
      refDate.setDate(refDate.getDate() + weekOffset * 7);
      const weekDs = getWeekDates(refDate);
      const start = weekDs[0]; start.setHours(0, 0, 0, 0);
      const end = weekDs[6]; end.setHours(23, 59, 59, 999);
      return { startMs: start.getTime(), endMs: end.getTime(), weekDates: weekDs };
    }
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(now); end.setHours(23, 59, 59, 999);
    return { startMs: start.getTime(), endMs: end.getTime(), weekDates: getWeekDates(now) };
  }

  const { weekDates } = getRangeMs();

  const filteredLogs = selectedFilter === 'all'
    ? rangedLogs
    : rangedLogs.filter(l => l.exerciseId === selectedFilter);

  // Build day entries
  const dayEntries: DayEntry[] = weekDates.map((d, i) => {
    const dateStr = getDateString(d);
    const dayLogs = filteredLogs.filter(l => getDateString(new Date(l.createdAt)) === dateStr);
    const today = getDateString(new Date()) === dateStr;

    const exGroups = exercises
      .map(ex => {
        const exLogs = dayLogs.filter(l => l.exerciseId === ex.id);
        if (exLogs.length === 0) return null;
        return {
          exercise: ex,
          total: exLogs.reduce((s, l) => s + l.value, 0),
          sets: exLogs.length,
          logs: exLogs.sort((a, b) => a.createdAt - b.createdAt),
        };
      })
      .filter(Boolean) as DayEntry['exercises'];

    return {
      date: dateStr,
      dayLabel: weekDays[i],
      dateLabel: `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`,
      exercises: exGroups,
      isToday: today,
    };
  }).reverse(); // most recent first

  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const periodLabel = `${weekStart.getDate().toString().padStart(2,'0')} – ${weekEnd.getDate().toString().padStart(2,'0')} · ${(weekEnd.getMonth()+1).toString().padStart(2,'0')} · ${weekEnd.getFullYear()}`;

  const totalReps = filteredLogs.reduce((s, l) => s + l.value, 0);
  const activeDays = new Set(filteredLogs.map(l => getDateString(new Date(l.createdAt)))).size;
  const avgPerDay = activeDays > 0 ? Math.round(totalReps / 7) : 0;
  const best = filteredLogs.length > 0
    ? Math.max(...dayEntries.map(d => d.exercises.reduce((s, e) => s + e.total, 0)))
    : 0;

  const exerciseFilters = [
    { id: 'all', icon: '✦', name: t.allExercises },
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
                <Text style={styles.filterIcon}>{ex.icon}</Text>
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
          {(['day', 'week', 'month', 'year'] as TimeRange[]).map(r => {
            const labels = { day: t.day, week: t.week, month: t.month, year: t.year };
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
            onPress={() => setWeekOffset(w => w - 1)}
          >
            <Icon name="chevLeft" size={12} stroke={colors.ink2} sw={2} />
          </TouchableOpacity>
          <View style={styles.periodCenter}>
            <Text style={[styles.periodLabel, { color: colors.ink }]}>{periodLabel}</Text>
            <Text style={[styles.periodSub, { color: colors.ink2 }]}>
              {weekOffset === 0 ? (
                <Text style={{ color: colors.accent, fontWeight: '600' }}>{t.thisWeek}</Text>
              ) : `${Math.abs(weekOffset)} ${t.weeksAgo}`}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.navBtn, { borderColor: colors.line, opacity: weekOffset >= 0 ? 0.35 : 1 }]}
            onPress={() => setWeekOffset(w => Math.min(0, w + 1))}
            disabled={weekOffset >= 0}
          >
            <Icon name="chev" size={12} stroke={colors.ink2} sw={2} />
          </TouchableOpacity>
        </View>

        {/* Period summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCell}>
            <Text style={[styles.summaryLabel, { color: colors.ink2 }]}>{t.total.toUpperCase()}</Text>
            <Text style={[styles.summaryValue, { color: colors.ink }]}>{totalReps}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={[styles.summaryLabel, { color: colors.ink2 }]}>{t.avgPerDay.toUpperCase()}</Text>
            <Text style={[styles.summaryValue, { color: colors.ink }]}>{avgPerDay}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={[styles.summaryLabel, { color: colors.ink2 }]}>{t.best.toUpperCase()}</Text>
            <Text style={[styles.summaryValue, { color: colors.accent }]}>{best || '—'}</Text>
          </View>
        </View>

        {/* Day list */}
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
        ) : (
          dayEntries.map((entry, i) => {
            const totalAll = entry.exercises.reduce((s, e) => s + e.total, 0);
            const isEmpty = entry.exercises.length === 0;
            const isSelected = selectedDay === entry.date;

            return (
              <View key={entry.date}>
                <TouchableOpacity
                  style={[
                    styles.dayRow,
                    {
                      backgroundColor: isSelected ? colors.accentSoft : 'transparent',
                      marginHorizontal: -12,
                      paddingHorizontal: 12,
                      borderRadius: isSelected ? 12 : 0,
                      borderBottomColor: !isSelected && i < dayEntries.length - 1 ? colors.line : 'transparent',
                      borderBottomWidth: !isSelected && i < dayEntries.length - 1 ? StyleSheet.hairlineWidth : 0,
                      opacity: isEmpty ? 0.4 : 1,
                    },
                  ]}
                  onPress={() => setSelectedDay(isSelected ? null : entry.date)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dayMeta}>
                    <Text style={[styles.dayName, {
                      color: isSelected ? colors.accent : colors.ink2,
                      fontWeight: isSelected ? '700' : '400',
                    }]}>
                      {entry.dayLabel}
                    </Text>
                    <Text style={[styles.dayDate, {
                      color: isSelected ? colors.accentInk : colors.ink,
                      fontWeight: isSelected ? '600' : '400',
                    }]}>
                      {entry.dateLabel}
                    </Text>
                  </View>

                  <View style={styles.dayContent}>
                    <View style={styles.exBadges}>
                      {entry.exercises.slice(0, 4).map((e, j) => (
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
                        width: `${Math.min((totalAll / 250) * 100, 100)}%`,
                        backgroundColor: entry.isToday || isSelected ? colors.accent : colors.ink,
                      }]} />
                    </View>
                  </View>

                  <View style={styles.dayRight}>
                    <Text style={[styles.dayTotal, {
                      color: isSelected ? colors.accentInk : colors.ink,
                    }]}>
                      {totalAll || '—'}
                    </Text>
                    <View style={{ transform: [{ rotate: isSelected ? '90deg' : '0deg' }] }}>
                      <Icon name="chev" size={14} stroke={isSelected ? colors.accent : (isEmpty ? colors.line : colors.ink2)} sw={2} />
                    </View>
                  </View>
                </TouchableOpacity>

                {isSelected && entry.exercises.length > 0 && (
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
  summaryRow: {
    flexDirection: 'row', gap: 16, marginBottom: 24,
  },
  summaryCell: { flex: 1 },
  summaryLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.6 },
  summaryValue: { fontSize: 28, fontWeight: '300', letterSpacing: -0.8, marginTop: 4 },
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
  dayRight: { width: 64, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 4 },
  dayTotal: { fontSize: 22, fontWeight: '300', letterSpacing: -0.5 },
  inlineDetail: { paddingBottom: 12 },
});
