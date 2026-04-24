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
import { Unit } from '@/types';
import Icon from '@/components/ui/Icon';
import TabBar from '@/components/ui/TabBar';
import WeekGrid from '@/components/charts/WeekGrid';
import SetRow from '@/components/exercise/SetRow';
import { TAB_BAR_HEIGHT } from '@/constants/theme';
import { getWeekDates, getDateString, getLogs } from '@/firebase/logs';

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
  return t.km;
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
  const [expanded, setExpanded] = React.useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!profile) { router.replace('/welcome'); return; }
    loadTodayLogs(user.uid);
    loadWeekData();
  }, [user, profile]);

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
  }, [todayLogs]);

  async function loadWeekData() {
    if (!user) return;
    const weekDates = getWeekDates(new Date());
    const start = weekDates[0].getTime();
    const end = weekDates[6];
    end.setHours(23, 59, 59, 999);
    const logs = await getLogs(user.uid, start, end.getTime());
    const byExDate: Record<string, number[]> = {};
    exercises.forEach(ex => { byExDate[ex.id] = Array(7).fill(0); });
    logs.forEach(log => {
      const logDate = getDateString(new Date(log.loggedAt));
      const dayIdx = weekDates.findIndex(d => getDateString(d) === logDate);
      if (dayIdx >= 0 && byExDate[log.exerciseId]) byExDate[log.exerciseId][dayIdx] += log.value;
    });
    setWeekData(byExDate);
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
  const weekGridRows = exercises
    .filter(ex => weekData[ex.id])
    .map(ex => ({ icon: ex.icon, name: ex.name, week: weekData[ex.id] ?? Array(7).fill(0) }));

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
                  <View key={ex.id} style={[styles.exCard, { backgroundColor: `${ex.color}15` }]}>
                    {/* Card header — tap to collapse or go to log */}
                    <TouchableOpacity
                      style={styles.exCardHeader}
                      onPress={() => setExpanded(null)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.exIconBadge, { backgroundColor: `${ex.color}28` }]}>
                        <Text style={styles.exIconText}>{ex.icon}</Text>
                      </View>
                      <View style={styles.exInfo}>
                        <Text style={[styles.exName, { color: colors.ink, fontWeight: '600' }]}>{ex.name}</Text>
                        <Text style={[styles.exSets, { color: ex.color }]}>{stats!.sets} {t.sets}</Text>
                      </View>
                      <View style={styles.exValueWrap}>
                        <Text style={[styles.exTotal, { color: colors.ink }]}>{total}</Text>
                        <Text style={[styles.exUnit, { color: ex.color }]}>{unitStr}</Text>
                      </View>
                      <View style={[styles.chevWrap, { transform: [{ rotate: '90deg' }] }]}>
                        <Icon name="chev" size={13} stroke={ex.color} sw={2} />
                      </View>
                    </TouchableOpacity>

                    {/* Divider + set rows */}
                    <View style={[styles.cardDivider, { backgroundColor: `${ex.color}30` }]} />
                    <View style={styles.exCardDetail}>
                      {stats!.logs.map((log, j) => {
                        const logTime = new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <SetRow
                            key={log.id}
                            index={j}
                            time={logTime}
                            value={log.value}
                            note={log.note}
                            unit={ex.unit as Unit}
                            isLast={j === stats!.logs.length - 1}
                            accentColors={{ bg: `${ex.color}20`, text: ex.color, border: `${ex.color}30` }}
                          />
                        );
                      })}
                    </View>

                    {/* Add more button */}
                    <TouchableOpacity
                      style={[styles.addMoreBtn, { borderTopColor: `${ex.color}30` }]}
                      onPress={() => router.push(`/log/${ex.id}`)}
                      activeOpacity={0.7}
                    >
                      <Icon name="plus" size={14} stroke={ex.color} sw={2.5} />
                      <Text style={[styles.addMoreText, { color: ex.color }]}>Thêm set</Text>
                    </TouchableOpacity>
                  </View>
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
            <WeekGrid rows={weekGridRows} todayIndex={weekDayIndex} />
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

  // Expanded card
  exCard: { borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  exCardHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  cardDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  exCardDetail: { paddingHorizontal: 12, paddingBottom: 4 },
  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addMoreText: { fontSize: 13, fontWeight: '600' },

  // Collapsed row
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth },

  // Shared
  exIconBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  exIconText: { fontSize: 16, lineHeight: 20 },
  exInfo: { flex: 1 },
  exName: { flex: 1, fontSize: 15, fontWeight: '500' },
  exSets: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginTop: 3 },
  exValueWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  exTotal: { fontSize: 32, fontWeight: '300', letterSpacing: -1, lineHeight: 36 },
  exUnit: { fontSize: 12, marginBottom: 2 },
  chevWrap: { marginLeft: 10 },
});
