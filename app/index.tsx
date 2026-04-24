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
import SetRow from '@/components/exercise/SetRow';
import { TAB_BAR_HEIGHT } from '@/constants/theme';
import { getWeekDates, getDateString, getLogs } from '@/firebase/logs';

function getGreeting(t: ReturnType<typeof useTranslation>['t']): string {
  const h = new Date().getHours();
  if (h < 12) return t.greeting;
  if (h < 18) return t.greetingAfternoon;
  return t.greetingEvening;
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
    if (!profile) {
      router.replace('/welcome');
      return;
    }
    loadTodayLogs(user.uid);
    loadWeekData();
  }, [user, profile]);

  async function loadWeekData() {
    if (!user) return;
    const weekDates = getWeekDates(new Date());
    const start = weekDates[0].getTime();
    const end = weekDates[6];
    end.setHours(23, 59, 59, 999);
    const logs = await getLogs(user.uid, start, end.getTime());

    const byExDate: Record<string, number[]> = {};
    exercises.forEach(ex => {
      byExDate[ex.id] = Array(7).fill(0);
    });
    logs.forEach(log => {
      const logDate = getDateString(new Date(log.loggedAt));
      const dayIdx = weekDates.findIndex(d => getDateString(d) === logDate);
      if (dayIdx >= 0 && byExDate[log.exerciseId]) {
        byExDate[log.exerciseId][dayIdx] += log.value;
      }
    });
    setWeekData(byExDate);
  }

  if (authLoading || profileLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // Aggregate today's stats per exercise
  const todayByEx = todayLogs.reduce<Record<string, { total: number; sets: number; logs: typeof todayLogs }>>((acc, log) => {
    if (!acc[log.exerciseId]) acc[log.exerciseId] = { total: 0, sets: 0, logs: [] };
    acc[log.exerciseId].total += log.value;
    acc[log.exerciseId].sets += 1;
    acc[log.exerciseId].logs.push(log);
    return acc;
  }, {});

  const weekDayIndex = ((new Date().getDay() + 6) % 7); // 0=Mon, 6=Sun

  const today = new Date();
  const dateLabel = today.toLocaleDateString(profile?.language === 'en' ? 'en-GB' : 'vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit',
  });

  const weekGridRows = exercises
    .filter(ex => weekData[ex.id])
    .map(ex => ({
      icon: ex.icon,
      name: ex.name,
      week: weekData[ex.id] ?? Array(7).fill(0),
    }));

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_HEIGHT + 24 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateText, { color: colors.ink2 }]}>{dateLabel}</Text>
            <Text style={[styles.greeting, { color: colors.ink }]}>
              {getGreeting(t)}, {profile?.name ?? ''}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsBtn, { borderColor: colors.line }]}
            onPress={() => router.push('/profile')}
          >
            <Icon name="settings" size={16} stroke={colors.ink2} sw={1.6} />
          </TouchableOpacity>
        </View>

        {/* Today section */}
        <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>
          {t.today.toUpperCase()}
        </Text>

        {exercises.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: colors.line }]}>
            <Text style={[styles.emptyText, { color: colors.ink2 }]}>{t.noData}</Text>
            <Text style={[styles.emptyLink, { color: colors.accent }]}>
              {t.startNow}
            </Text>
          </View>
        ) : (
          <View style={{ marginBottom: 36 }}>
            {exercises.map((ex, i) => {
              const stats = todayByEx[ex.id];
              const isExpanded = expanded === ex.id;
              const isLast = i === exercises.length - 1;
              const total = stats?.total ?? 0;

              return (
                <React.Fragment key={ex.id}>
                  <TouchableOpacity
                    style={[
                      styles.exRow,
                      {
                        borderTopColor: colors.line,
                        borderBottomColor: (!isExpanded && isLast) ? colors.line : 'transparent',
                        borderBottomWidth: (!isExpanded && isLast) ? StyleSheet.hairlineWidth : 0,
                        backgroundColor: isExpanded ? colors.accentSoft : 'transparent',
                        marginHorizontal: isExpanded ? -16 : 0,
                        paddingHorizontal: isExpanded ? 16 : 0,
                        borderRadius: isExpanded ? 12 : 0,
                      },
                    ]}
                    onPress={() => setExpanded(isExpanded ? null : ex.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.exIcon}>{ex.icon}</Text>
                    <View style={styles.exInfo}>
                      <Text style={[styles.exName, {
                        color: isExpanded ? colors.accentInk : colors.ink,
                      }]}>
                        {ex.name}
                      </Text>
                      {isExpanded && stats && (
                        <Text style={[styles.exSets, { color: colors.accent }]}>
                          {stats.sets} {t.sets}
                        </Text>
                      )}
                    </View>
                    <View style={styles.exValue}>
                      <Text style={[styles.exTotal, {
                        color: isExpanded ? colors.accentInk : colors.ink,
                      }]}>
                        {total}
                      </Text>
                      <Text style={[styles.exUnit, {
                        color: isExpanded ? colors.accent : colors.ink2,
                      }]}>
                        {ex.unit === 'reps' ? t.reps : ex.unit === 'duration' ? t.seconds : t.km}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 10, transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}>
                      <Icon name="chev" size={13} stroke={isExpanded ? colors.accent : colors.ink2} sw={2} />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && stats && (
                    <View style={[styles.detailContainer, { backgroundColor: colors.accentSoft, marginHorizontal: -16 }]}>
                      {stats.logs.map((log, j) => {
                        const logTime = new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <SetRow
                            key={log.id}
                            index={j}
                            time={logTime}
                            value={log.value}
                            note={log.note}
                            unit={ex.unit}
                            isLast={j === stats.logs.length - 1}
                            accentColors={{
                              bg: colors.accentLine,
                              text: colors.accentInk,
                              border: colors.accentLine,
                            }}
                          />
                        );
                      })}
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </View>
        )}

        {/* Weekly breakdown */}
        {weekGridRows.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.ink2, marginBottom: 14 }]}>
              {t.thisWeek.toUpperCase()}
            </Text>
            <WeekGrid rows={weekGridRows} todayIndex={weekDayIndex} />
          </>
        )}

        {/* Streak + Best */}
        <View style={[styles.statGrid, { marginTop: 32 }]}>
          <View style={[styles.statCell, { borderTopColor: colors.line }]}>
            <Text style={[styles.statLabel, { color: colors.ink2 }]}>
              {t.streak.toUpperCase()}
            </Text>
            <Text style={[styles.statValue, { color: colors.ink }]}>
              0<Text style={[styles.statUnit, { color: colors.ink2 }]}> ngày</Text>
            </Text>
          </View>
          <View style={[styles.statCell, { borderTopColor: colors.line }]}>
            <Text style={[styles.statLabel, { color: colors.ink2 }]}>
              {t.personalBest.toUpperCase()}
            </Text>
            <Text style={[styles.statValue, { color: colors.ink }]}>
              —
            </Text>
          </View>
        </View>
      </ScrollView>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  dateText: { fontSize: 13, letterSpacing: 0.3 },
  greeting: { fontSize: 22, fontWeight: '500', marginTop: 4, letterSpacing: -0.4 },
  settingsBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 14,
  },
  emptyCard: {
    padding: 24, borderWidth: 1, borderRadius: 12,
    alignItems: 'center', gap: 8, marginBottom: 36,
  },
  emptyText: { fontSize: 15 },
  emptyLink: { fontSize: 14, fontWeight: '600' },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  exIcon: { fontSize: 20, marginRight: 12, lineHeight: 24 },
  exInfo: { flex: 1 },
  exName: { fontSize: 15, fontWeight: '500' },
  exSets: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginTop: 3 },
  exValue: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  exTotal: { fontSize: 32, fontWeight: '300', letterSpacing: -1, lineHeight: 36 },
  exUnit: { fontSize: 12, marginBottom: 2 },
  detailContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 2,
    borderRadius: 12,
    marginBottom: 0,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCell: {
    flex: 1,
    borderTopWidth: 1,
    paddingTop: 14,
  },
  statLabel: { fontSize: 11, letterSpacing: 0.5 },
  statValue: { fontSize: 32, fontWeight: '400', marginTop: 4, letterSpacing: -0.5 },
  statUnit: { fontSize: 14, fontWeight: '400' },
});
