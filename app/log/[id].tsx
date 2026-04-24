import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useLogStore } from '@/store/useLogStore';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import SetRow from '@/components/exercise/SetRow';
import SectionLabel from '@/components/ui/SectionLabel';
import { QUICK_PICK_VALUES } from '@/constants/defaultExercises';

export default function LogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const exercises = useExerciseStore(s => s.exercises);
  const { todayLogs, addLog } = useLogStore();

  const [activeId, setActiveId] = useState(id);
  const [value, setValue] = useState(10);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);

  const exercise = exercises.find(e => e.id === activeId);

  if (!exercise) return null;

  const todayExLogs = todayLogs
    .filter(l => l.exerciseId === activeId)
    .sort((a, b) => a.loggedAt - b.loggedAt);
  const todayTotal = todayExLogs.reduce((s, l) => s + l.value, 0);
  const quickValues = QUICK_PICK_VALUES[exercise.unit];

  function switchExercise(newId: string) {
    setActiveId(newId);
    setValue(10);
    setNote('');
    setShowSwitch(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await addLog(user.uid, {
        exerciseId: exercise!.id,
        value,
        note: note.trim(),
        loggedAt: Date.now(),
      });
      setNote('');
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: 16 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="close" size={22} stroke={colors.ink2} sw={1.6} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>{t.quickAdd}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exercise selector */}
        <SectionLabel label="Bài tập" />
        <TouchableOpacity
          style={[styles.exRow, { borderBottomColor: colors.line }]}
          onPress={() => setShowSwitch(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.exIcon}>{exercise.icon}</Text>
          <Text style={[styles.exName, { color: colors.ink }]}>{exercise.name}</Text>
          <Icon name="chev" size={16} stroke={colors.ink2} sw={1.6} />
        </TouchableOpacity>

        {/* Reps counter */}
        <View style={{ marginTop: 28 }}>
          <SectionLabel label={exercise.unit === 'reps' ? t.repsLabel : exercise.unit === 'duration' ? t.durationLabel : t.distanceLabel} />
        </View>
        <View style={[styles.counter, { borderBottomColor: colors.line }]}>
          <TouchableOpacity
            style={[styles.counterBtn, { borderColor: colors.line, backgroundColor: colors.card }]}
            onPress={() => setValue(v => Math.max(0, v - 1))}
            activeOpacity={0.7}
          >
            <Text style={[styles.counterBtnText, { color: colors.ink }]}>−</Text>
          </TouchableOpacity>
          <View style={styles.counterValue}>
            <Text style={[styles.bigNumber, { color: colors.ink }]}>{value}</Text>
            <Text style={[styles.unitLabel, { color: colors.ink2 }]}>
              {exercise.unit === 'reps' ? t.reps : exercise.unit === 'duration' ? t.seconds : t.km}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.counterBtn, { backgroundColor: colors.accent }]}
            onPress={() => setValue(v => v + 1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.counterBtnText, { color: '#fff' }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Quick pick */}
        <View style={{ marginTop: 28 }}>
          <SectionLabel label={t.quickPick} />
        </View>
        <View style={styles.quickGrid}>
          {quickValues.map(v => {
            const active = v === value;
            return (
              <TouchableOpacity
                key={v}
                style={[
                  styles.quickPill,
                  {
                    borderColor: active ? colors.accent : colors.line,
                    borderWidth: active ? 1.5 : 1,
                    backgroundColor: active ? colors.accentSoft : 'transparent',
                  },
                ]}
                onPress={() => setValue(v)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.quickText,
                  { color: active ? colors.accentInk : colors.ink },
                  active && { fontWeight: '600' },
                ]}>
                  {v}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notes */}
        <View style={{ marginTop: 28 }}>
          <SectionLabel label={t.notes} />
        </View>
        <TextInput
          style={[styles.noteInput, { borderColor: colors.line, color: colors.ink }]}
          value={note}
          onChangeText={setNote}
          placeholder={t.notesPh}
          placeholderTextColor={colors.ink2}
          multiline
        />

        <Button label={t.save} onPress={handleSave} loading={saving} style={{ marginTop: 20 }} />

        {/* Today's sets */}
        {todayExLogs.length > 0 && (
          <View style={[styles.todayCard, { backgroundColor: colors.accentSoft }]}>
            <View style={styles.todayHeader}>
              <Text style={[styles.todayTitle, { color: colors.accent }]}>
                {t.today} · {exercise.name}
              </Text>
              <Text style={[styles.todaySets, { color: colors.accentInk }]}>
                {todayExLogs.length} {t.sets}
              </Text>
            </View>
            <Text style={[styles.todayTotal, { color: colors.accentInk }]}>
              {t.total}:{' '}
              <Text style={{ fontWeight: '700', fontSize: 17 }}>{todayTotal}</Text>
              {' '}{exercise.unit === 'reps' ? t.reps : t.seconds}
            </Text>
            {todayExLogs.map((log, i) => {
              const time = new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <SetRow
                  key={log.id}
                  index={i}
                  time={time}
                  value={log.value}
                  note={log.note}
                  unit={exercise.unit}
                  isLast={i === todayExLogs.length - 1}
                  accentColors={{ bg: colors.accentLine, text: colors.accentInk, border: colors.accentLine }}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Exercise switcher overlay */}
      {showSwitch && (
        <View style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity
            style={styles.switchBackdrop}
            onPress={() => setShowSwitch(false)}
            activeOpacity={1}
          />
          <View style={[styles.switchSheet, { backgroundColor: colors.bg, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.switchHandle, { backgroundColor: colors.line }]} />
            <Text style={[styles.switchTitle, { color: colors.ink2 }]}>
              {t.chooseExercise.toUpperCase()}
            </Text>
            {exercises.map((ex, i) => {
              const isActive = ex.id === activeId;
              return (
                <TouchableOpacity
                  key={ex.id}
                  style={[
                    styles.switchRow,
                    { borderTopColor: colors.line },
                    i === exercises.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
                  ]}
                  onPress={() => switchExercise(ex.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.switchIcon}>{ex.icon}</Text>
                  <Text style={[styles.switchName, { color: isActive ? colors.accent : colors.ink }]}>
                    {ex.name}
                  </Text>
                  {isActive && <Icon name="check" size={16} stroke={colors.accent} sw={2.5} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 16,
  },
  headerTitle: { fontSize: 15, fontWeight: '500' },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  exRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 0,
  },
  exIcon: { fontSize: 22, marginRight: 12 },
  exName: { flex: 1, fontSize: 17, fontWeight: '500' },
  counter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 10, marginBottom: 0, gap: 12,
  },
  counterBtn: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  counterBtnText: { fontSize: 32, fontWeight: '300', lineHeight: 36 },
  counterValue: { flex: 1, alignItems: 'center' },
  bigNumber: { fontSize: 88, fontWeight: '300', letterSpacing: -4, lineHeight: 88 },
  unitLabel: { fontSize: 13, marginTop: 4, letterSpacing: 0.4 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 0 },
  quickPill: { width: '30%', flexGrow: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  quickText: { fontSize: 16, fontWeight: '500' },
  noteInput: {
    borderWidth: 1, borderRadius: 12, padding: 14,
    fontSize: 15, fontStyle: 'italic', minHeight: 56, marginTop: 10,
  },
  todayCard: { marginTop: 24, padding: 16, borderRadius: 14 },
  todayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayTitle: { fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '700' },
  todaySets: { fontSize: 13, opacity: 0.75 },
  todayTotal: { fontSize: 15, marginTop: 6, marginBottom: 10 },

  // Switcher
  switchBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  switchSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12, paddingHorizontal: 24,
  },
  switchHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  switchTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth,
  },
  switchIcon: { fontSize: 22, marginRight: 14 },
  switchName: { flex: 1, fontSize: 17, fontWeight: '500' },
});
