import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useLogStore } from '@/store/useLogStore';
import Icon from '@/components/ui/Icon';
import { SUGGESTED_EXERCISES } from '@/constants/defaultExercises';

export default function ExercisePickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const exercises = useExerciseStore(s => s.exercises);
  const todayStats = useLogStore(s => s.getTodayStats)();

  const statsByEx = Object.fromEntries(todayStats.map(s => [s.exerciseId, s]));

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>Bài tập</Text>
          <Text style={[styles.subtitle, { color: colors.ink2 }]}>{t.chooseExercise}</Text>
        </View>
        <TouchableOpacity
          style={[styles.closeBtn, { borderColor: colors.line }]}
          onPress={() => router.back()}
        >
          <Icon name="close" size={16} stroke={colors.ink2} sw={1.6} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* My exercises */}
        <Text style={[styles.sectionLabel, { color: colors.ink2 }]}>
          {t.myExercises.toUpperCase()} · {exercises.length}
        </Text>

        {exercises.map(ex => {
          const stats = statsByEx[ex.id];
          return (
            <TouchableOpacity
              key={ex.id}
              style={[styles.exCard, { borderColor: colors.line, backgroundColor: colors.card }]}
              onPress={() => router.push(`/log/${ex.id}`)}
              activeOpacity={0.7}
            >
              <View style={[styles.exIconBg, { backgroundColor: `${ex.color}18` }]}>
                <Text style={styles.exIconText}>{ex.icon}</Text>
              </View>
              <View style={styles.exInfo}>
                <Text style={[styles.exName, { color: colors.ink }]}>{ex.name}</Text>
                <Text style={[styles.exMeta, { color: colors.ink2 }]}>
                  {t.unitLabel}: {ex.unit === 'reps' ? t.reps : ex.unit === 'duration' ? t.seconds : t.km}
                  {stats && (
                    <>
                      {' · '}Hôm nay{' '}
                      <Text style={{ color: colors.ink, fontWeight: '600' }}>
                        {stats.total} {ex.unit === 'reps' ? t.reps : t.seconds}
                      </Text>
                      {' · '}{stats.sets} {t.sets}
                    </>
                  )}
                </Text>
              </View>
              <View style={[styles.chevBtn, { backgroundColor: colors.accentSoft }]}>
                <Icon name="chev" size={12} stroke={colors.accent} sw={2} />
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Add new exercise */}
        <TouchableOpacity
          style={[styles.addCard, { borderColor: colors.line }]}
          onPress={() => router.push('/exercises/add')}
          activeOpacity={0.7}
        >
          <View style={[styles.addIconBg, { backgroundColor: colors.accentSoft }]}>
            <Icon name="plus" size={20} stroke={colors.accent} sw={2} />
          </View>
          <View style={styles.addInfo}>
            <Text style={[styles.exName, { color: colors.ink }]}>{t.addExercise}</Text>
            <Text style={[styles.exMeta, { color: colors.ink2 }]}>{t.addExerciseDesc}</Text>
          </View>
          <Icon name="chev" size={14} stroke={colors.ink2} sw={2} />
        </TouchableOpacity>

        {/* Suggested */}
        <Text style={[styles.sectionLabel, { color: colors.ink2, marginTop: 32 }]}>
          {t.suggested.toUpperCase()}
        </Text>
        <View style={styles.suggestedGrid}>
          {SUGGESTED_EXERCISES.map(s => (
            <TouchableOpacity
              key={s.name}
              style={[styles.suggestPill, { borderColor: colors.line }]}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestIcon}>{s.icon}</Text>
              <Text style={[styles.suggestName, { color: colors.ink }]}>{s.name}</Text>
              <Icon name="plus" size={11} stroke={colors.ink2} sw={2} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '400', letterSpacing: -0.6 },
  subtitle: { fontSize: 13, marginTop: 4 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: 24, paddingTop: 12 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10,
  },
  exCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  exIconBg: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  exIconText: { fontSize: 22 },
  exInfo: { flex: 1 },
  exName: { fontSize: 16, fontWeight: '600' },
  exMeta: { fontSize: 12, marginTop: 3 },
  chevBtn: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 14,
  },
  addIconBg: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  addInfo: { flex: 1 },
  suggestedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestIcon: { fontSize: 14 },
  suggestName: { fontSize: 13, fontWeight: '500' },
});
