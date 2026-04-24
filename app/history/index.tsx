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
import SetRow from '@/components/exercise/SetRow';
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

  // Build day entries
  const dayEntries: DayEntry[] = weekDates.map((d, i) => {
    const dateStr = getDateString(d);
    const dayLogs = rangedLogs.filter(l => getDateString(new Date(l.loggedAt)) === dateStr);
    const today = getDateString(new Date()) === dateStr;

    const exGroups = exercises
      .map(ex => {
        const exLogs = dayLogs.filter(l => l.exerciseId === ex.id);
        if (exLogs.length === 0) return null;
        return {
          exercise: ex,
          total: exLogs.reduce((s, l) => s + l.value, 0),
          sets: exLogs.length,
          logs: exLogs.sort((a, b) => a.loggedAt - b.loggedAt),
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

  const totalReps = rangedLogs.reduce((s, l) => s + l.value, 0);
  const activeDays = new Set(rangedLogs.map(l => getDateString(new Date(l.loggedAt)))).size;
  const avgPerDay = activeDays > 0 ? Math.round(totalReps / 7) : 0;
  const best = rangedLogs.length > 0
    ? Math.max(...dayEntries.map(d => d.exercises.reduce((s, e) => s + e.total, 0)))
    : 0;

  const exerciseFilters = [
    { id: 'all', icon: '✦', name: t.allExercises },
    ...exercises.map(ex => ({ id: ex.id, icon: ex.icon, name: ex.name })),
  ];

  const selectedDayData = selectedDay ? dayEntries.find(d => d.date === selectedDay) : null;

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
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
              <TouchableOpacity
                key={entry.date}
                style={[
                  styles.dayRow,
                  {
                    backgroundColor: isSelected ? colors.accentSoft : 'transparent',
                    marginHorizontal: -12,
                    paddingHorizontal: 12,
                    borderRadius: 12,
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
                  {isSelected && (
                    <Icon name="chev" size={14} stroke={colors.accent} sw={2} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Selected day detail */}
        {selectedDayData && selectedDayData.exercises.length > 0 && (
          <View style={{ marginTop: 32 }}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailTitle, { color: colors.ink }]}>
                {selectedDayData.isToday ? t.today : selectedDayData.dayLabel}
              </Text>
              <Text style={[styles.detailDate, { color: colors.ink2 }]}>
                {selectedDayData.dateLabel}.{new Date().getFullYear()}
              </Text>
            </View>

            {selectedDayData.exercises.map(ex => (
              <View key={ex.exercise.id} style={{ marginBottom: 24 }}>
                <View style={[styles.exDetailHeader, { backgroundColor: colors.accentSoft }]}>
                  <View style={styles.exDetailLeft}>
                    <Text style={styles.exDetailIcon}>{ex.exercise.icon}</Text>
                    <View>
                      <Text style={[styles.exDetailName, { color: colors.accentInk }]}>{ex.exercise.name}</Text>
                      <Text style={[styles.exDetailSets, { color: colors.accent }]}>
                        {ex.sets} {t.sets}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.exDetailTotal}>
                    <Text style={[styles.exDetailValue, { color: colors.accentInk }]}>{ex.total}</Text>
                    <Text style={[styles.exDetailUnit, { color: colors.accent }]}>
                      {ex.exercise.unit === 'reps' ? t.reps : t.seconds}
                    </Text>
                  </View>
                </View>
                {ex.logs.map((log, i) => {
                  const time = new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <SetRow
                      key={log.id}
                      index={i}
                      time={time}
                      value={log.value}
                      note={log.note}
                      unit={ex.exercise.unit}
                      isLast={i === ex.logs.length - 1}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16,
  },
  detailTitle: { fontSize: 22, fontWeight: '500', letterSpacing: -0.4 },
  detailDate: { fontSize: 13, fontVariant: ['tabular-nums'] },
  exDetailHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 14, marginBottom: 10,
  },
  exDetailLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exDetailIcon: { fontSize: 22 },
  exDetailName: { fontSize: 15, fontWeight: '600' },
  exDetailSets: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginTop: 2 },
  exDetailTotal: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  exDetailValue: { fontSize: 30, fontWeight: '300', letterSpacing: -1, lineHeight: 34 },
  exDetailUnit: { fontSize: 12, marginBottom: 2 },
});
