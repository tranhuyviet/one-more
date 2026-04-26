import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useLogStore } from '@/store/useLogStore';
import Icon from '@/components/ui/Icon';
import TabBar from '@/components/ui/TabBar';
import WeekGrid from '@/components/charts/WeekGrid';
import DayDetail from '@/components/exercise/DayDetail';
import { TAB_BAR_HEIGHT } from '@/constants/theme';
import { getWeekDates, getDateString, getLogs } from '@/firebase/logs';
import { Unit, ExerciseLog } from '@/types';

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatDateLabel(date: Date, lang: string): string {
  const days_vi = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const days_en = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const name = lang === 'en' ? days_en[date.getDay()] : days_vi[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${name}, ${dd}.${mm}.${date.getFullYear()}`;
}

function getWeekLabel(date: Date, lang: string): string {
  const w = getISOWeek(date);
  return lang === 'en' ? `Week ${w} · ${date.getFullYear()}` : `Tuần ${w} · ${date.getFullYear()}`;
}

function getUnitLabel(unit: Unit, t: ReturnType<typeof useTranslation>['t']): string {
  if (unit === 'reps') return t.reps;
  if (unit === 'duration') return t.seconds;
  if (unit === 'minutes') return t.minutes;
  if (unit === 'km') return t.km;
  return t.meters;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const authLoading = useAuthStore(s => s.loading);
  const profile = useProfileStore(s => s.profile);
  const profileLoading = useProfileStore(s => s.loading);
  const exercises = useExerciseStore(s => s.exercises);
  const { todayLogs, loadTodayLogs } = useLogStore();
  const [weekData, setWeekData] = React.useState<Record<string, number[]>>({});
  const [weekLogs, setWeekLogs] = React.useState<Record<string, ExerciseLog[][]>>({});
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [selectedWeekCell, setSelectedWeekCell] = React.useState<{ exId: string; dayIdx: number } | null>(null);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) return;
    if (!profile) { router.replace('/welcome'); return; }
    loadTodayLogs(user.uid);
    loadWeekData();
  }, [user, profile, authLoading, profileLoading, exercises]);

  useEffect(() => {
    if (Object.keys(weekData).length === 0) return;
    const todayIdx = ((new Date().getDay() + 6) % 7);
    const todayTotals: Record<string, number> = {};
    todayLogs.forEach(log => {
      todayTotals[log.exerciseId] = (todayTotals[log.exerciseId] ?? 0) + log.value;
    });
    setWeekData(prev => {
      const next: Record<string, number[]> = {};
      Object.keys(prev).forEach(exId => {
        const updated = [...prev[exId]];
        updated[todayIdx] = todayTotals[exId] ?? 0;
        next[exId] = updated;
      });
      return next;
    });
    setWeekLogs(prev => {
      const next: Record<string, ExerciseLog[][]> = {};
      Object.keys(prev).forEach(exId => {
        const updated = [...prev[exId]];
        updated[todayIdx] = todayLogs.filter(l => l.exerciseId === exId);
        next[exId] = updated;
      });
      return next;
    });
  }, [todayLogs]);

  async function loadWeekData() {
    if (!user || exercises.length === 0) return;
    const weekDates = getWeekDates(new Date());
    const start = weekDates[0].getTime();
    const end = weekDates[6];
    end.setHours(23, 59, 59, 999);
    const logs = await getLogs(user.uid, start, end.getTime());
    const byExDate: Record<string, number[]> = {};
    const byExDateLogs: Record<string, ExerciseLog[][]> = {};
    exercises.forEach(ex => {
      byExDate[ex.id] = Array(7).fill(0);
      byExDateLogs[ex.id] = Array(7).fill(null).map(() => []);
    });
    logs.forEach(log => {
      const logDate = getDateString(new Date(log.createdAt));
      const dayIdx = weekDates.findIndex(d => getDateString(d) === logDate);
      if (dayIdx >= 0 && byExDate[log.exerciseId]) {
        byExDate[log.exerciseId][dayIdx] += log.value;
        byExDateLogs[log.exerciseId][dayIdx].push(log);
      }
    });
    setWeekData(byExDate);
    setWeekLogs(byExDateLogs);
  }

  if (authLoading || profileLoading) {
    return <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator color={colors.accent} /></View>;
  }

  const todayByEx = todayLogs.reduce<Record<string, { total: number; sets: number; logs: typeof todayLogs }>>((acc, log) => {
    if (!acc[log.exerciseId]) acc[log.exerciseId] = { total: 0, sets: 0, logs: [] };
    acc[log.exerciseId].total += log.value;
    acc[log.exerciseId].sets += 1;
    acc[log.exerciseId].logs.push(log);
    return acc;
  }, {});

  const weekDayIndex = ((new Date().getDay() + 6) % 7);
  const today = new Date();
  const lang = profile?.language ?? 'vi';
  const weekGridExercises = exercises.filter(ex => weekData[ex.id]);
  const weekGridRows = weekGridExercises.map(ex => ({
    icon: ex.icon, name: ex.name, color: ex.color, week: weekData[ex.id] ?? Array(7).fill(0),
  }));

  function handleWeekCellPress(rowIdx: number, dayIdx: number) {
    const ex = weekGridExercises[rowIdx];
    if (!ex) return;
    setSelectedWeekCell(prev =>
      prev?.exId === ex.id && prev?.dayIdx === dayIdx ? null : { exId: ex.id, dayIdx }
    );
  }

  const selectedWeekRow = selectedWeekCell
    ? weekGridExercises.findIndex(ex => ex.id === selectedWeekCell.exId)
    : -1;

  function handleExPress(exId: string) {
    const stats = todayByEx[exId];
    if (stats && stats.logs.length > 0) {
      // Has data → toggle expand
      setExpanded(prev => prev === exId ? null : exId);
    } else {
      // No data → go to log
      router.push(`/log/${exId}`);
    }
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <View style={[styles.statusBarCover, { height: insets.top, backgroundColor: colors.bg }]} />

      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: TAB_BAR_HEIGHT + 24 }]}>
        <Text style={[styles.greeting, { color: colors.ink }]}>
          {t.greeting}, {profile?.name ?? ''} 👋
        </Text>

        {/* Today */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>{t.today.toUpperCase()}</Text>
          <Text style={[styles.sectionDate, { color: colors.ink2 }]}>{formatDateLabel(today, lang)}</Text>
        </View>

        {exercises.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: colors.line, marginBottom: 36 }]}>
            <Text style={[styles.emptyText, { color: colors.ink2 }]}>{t.noData}</Text>
            <Text style={[styles.emptyLink, { color: colors.accent }]}>{t.startNow}</Text>
          </View>
        ) : (
          <View style={styles.exList}>
            {exercises.map((ex, i) => {
              const stats = todayByEx[ex.id];
              const isExp = expanded === ex.id;
              const total = stats?.total ?? 0;
              const unitStr = getUnitLabel(ex.unit as Unit, t);
              const isLast = i === exercises.length - 1;
              const hasData = stats && stats.logs.length > 0;

              if (isExp && hasData) {
                return (
                  <DayDetail
                    key={ex.id}
                    exercises={[{ exercise: ex, total: stats!.total, sets: stats!.sets, logs: stats!.logs }]}
                    onHeaderPress={() => setExpanded(null)}
                    onAddMore={id => router.push(`/log/${id}`)}
                  />
                );
              }

              return (
                <TouchableOpacity
                  key={ex.id}
                  style={[
                    styles.exRow,
                    { borderTopColor: colors.line },
                    isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
                  ]}
                  onPress={() => handleExPress(ex.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.exIconBadge, { backgroundColor: `${ex.color}18` }]}>
                    <Text style={styles.exIconText}>{ex.icon}</Text>
                  </View>
                  <Text style={[styles.exName, { color: colors.ink }]}>{ex.name}</Text>
                  <View style={styles.exValueWrap}>
                    <Text style={[styles.exTotal, { color: colors.ink }]}>{total}</Text>
                    <Text style={[styles.exUnit, { color: colors.ink2 }]}>{unitStr}</Text>
                  </View>
                  <View style={styles.chevWrap}>
                    <Icon name="chev" size={13} stroke={hasData ? colors.ink2 : colors.line} sw={2} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Weekly */}
        {weekGridRows.length > 0 && (
          <>
            <View style={[styles.sectionRow, { marginTop: 4 }]}>
              <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>{t.thisWeek.toUpperCase()}</Text>
              <Text style={[styles.sectionDate, { color: colors.ink2 }]}>{getWeekLabel(today, lang)}</Text>
            </View>
            <WeekGrid
              rows={weekGridRows}
              todayIndex={weekDayIndex}
              onCellPress={handleWeekCellPress}
              selectedCell={selectedWeekCell && selectedWeekRow >= 0
                ? { row: selectedWeekRow, day: selectedWeekCell.dayIdx }
                : undefined}
            />
            {selectedWeekCell && selectedWeekRow >= 0 && (() => {
              const ex = weekGridExercises[selectedWeekRow];
              const dayLogs = weekLogs[selectedWeekCell.exId]?.[selectedWeekCell.dayIdx] ?? [];
              if (dayLogs.length === 0) return null;
              const group = {
                exercise: ex,
                total: dayLogs.reduce((s, l) => s + l.value, 0),
                sets: dayLogs.length,
                logs: [...dayLogs].sort((a, b) => a.createdAt - b.createdAt),
              };
              return (
                <View style={styles.weekDetailWrap}>
                  <DayDetail exercises={[group]} />
                </View>
              );
            })()}
          </>
        )}
      </ScrollView>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusBarCover: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  content: { paddingHorizontal: 24 },
  greeting: { fontSize: 28, fontWeight: '500', letterSpacing: -0.4, marginBottom: 32 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  sectionDate: { fontSize: 13 },
  emptyCard: { padding: 24, borderWidth: 1, borderRadius: 12, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 15 },
  emptyLink: { fontSize: 14, fontWeight: '600' },
  exList: { marginBottom: 36 },

  // Collapsed row
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth },

  exIconBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  exIconText: { fontSize: 16, lineHeight: 20 },
  exName: { flex: 1, fontSize: 15, fontWeight: '500' },
  exValueWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  exTotal: { fontSize: 32, fontWeight: '300', letterSpacing: -1, lineHeight: 36 },
  exUnit: { fontSize: 12, marginBottom: 2 },
  chevWrap: { marginLeft: 10 },
  weekDetailWrap: { marginTop: 16 },
});
