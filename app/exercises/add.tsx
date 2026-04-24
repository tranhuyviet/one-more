import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import SectionLabel from '@/components/ui/SectionLabel';
import {
  EXERCISE_ICON_OPTIONS,
  EXERCISE_COLOR_OPTIONS,
} from '@/constants/defaultExercises';
import { Unit } from '@/types';

const MUSCLE_GROUPS = ['Ngực / Vai', 'Lưng', 'Chân', 'Bụng', 'Cardio', 'Toàn thân'];

export default function AddExerciseScreen() {
  const { id: editId, name: prefillName, icon: prefillIcon } = useLocalSearchParams<{
    id?: string; name?: string; icon?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const { addExercise, updateExercise, deleteExercise, exercises } = useExerciseStore();

  const existing = editId ? exercises.find(e => e.id === editId) : undefined;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? prefillName ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? prefillIcon ?? '💪');
  const [unit, setUnit] = useState<Unit>(existing?.unit ?? 'reps');
  const [color, setColor] = useState(existing?.color ?? EXERCISE_COLOR_OPTIONS[0]);
  const [muscleGroup, setMuscleGroup] = useState(existing?.muscleGroup ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const data = { name: name.trim(), icon, unit, color, muscleGroup };
      if (isEdit) {
        await updateExercise(user.uid, existing!.id, data);
      } else {
        await addExercise(user.uid, { ...data, sortOrder: exercises.length, createdAt: Date.now() });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!user || !existing) return;
    Alert.alert(
      t.deleteExercise,
      t.deleteExerciseConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.deleteExercise,
          style: 'destructive',
          onPress: async () => {
            await deleteExercise(user!.uid, existing!.id);
            router.back();
          },
        },
      ],
    );
  }

  const units: { id: Unit; label: string; desc: string }[] = [
    { id: 'reps', label: t.unitReps, desc: t.unitRepsDesc },
    { id: 'duration', label: t.unitDuration, desc: t.unitDurationDesc },
    { id: 'distance', label: t.unitDistance, desc: t.unitDistanceDesc },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: 16 }]}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.line }]}
          onPress={() => router.back()}
        >
          <Icon name="chevLeft" size={14} stroke={colors.ink2} sw={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>
          {isEdit ? t.editExercise : t.addExerciseTitle}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: colors.accentSoft }]}>
          <View style={[styles.previewIcon, { backgroundColor: `${color}18` }]}>
            <Text style={styles.previewIconText}>{icon}</Text>
          </View>
          <View style={styles.previewInfo}>
            <Text style={[styles.previewTag, { color: colors.accent }]}>
              {t.preview.toUpperCase()}
            </Text>
            <Text style={[styles.previewName, { color: colors.accentInk }]}>
              {name || t.exerciseName}
            </Text>
            <Text style={[styles.previewMeta, { color: colors.accentInk }]}>
              {unit === 'reps' ? t.unitReps : unit === 'duration' ? t.unitDuration : t.unitDistance}
              {muscleGroup ? ` · ${muscleGroup}` : ''}
            </Text>
          </View>
        </View>

        {/* Name */}
        <SectionLabel label={t.exerciseName} />
        <TextInput
          style={[styles.nameInput, {
            borderColor: name ? colors.accent : colors.line,
            borderWidth: name ? 1.5 : 1,
            backgroundColor: colors.card,
            color: colors.ink,
          }]}
          value={name}
          onChangeText={setName}
          placeholder={t.exerciseName}
          placeholderTextColor={colors.ink2}
          autoFocus={!isEdit}
        />

        {/* Icon */}
        <SectionLabel label={t.chooseIcon} />
        <View style={styles.iconGrid}>
          {EXERCISE_ICON_OPTIONS.map(ic => {
            const active = ic === icon;
            return (
              <TouchableOpacity
                key={ic}
                style={[
                  styles.iconCell,
                  {
                    borderColor: active ? colors.accent : colors.line,
                    borderWidth: active ? 1.5 : 1,
                    backgroundColor: active ? colors.accentSoft : 'transparent',
                    borderRadius: 12,
                  },
                ]}
                onPress={() => setIcon(ic)}
              >
                <Text style={styles.iconText}>{ic}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Unit */}
        <SectionLabel label={t.unitLabel} />
        <View style={styles.unitList}>
          {units.map(u => {
            const active = u.id === unit;
            return (
              <TouchableOpacity
                key={u.id}
                style={[
                  styles.unitRow,
                  {
                    borderColor: active ? colors.accent : colors.line,
                    borderWidth: active ? 1.5 : 1,
                    backgroundColor: active ? colors.accentSoft : 'transparent',
                  },
                ]}
                onPress={() => setUnit(u.id)}
              >
                <View style={styles.unitInfo}>
                  <Text style={[styles.unitLabel, { color: active ? colors.accentInk : colors.ink }]}>
                    {u.label}
                  </Text>
                  <Text style={[styles.unitDesc, { color: active ? colors.accentInk : colors.ink2 }]}>
                    {u.desc}
                  </Text>
                </View>
                <View style={[styles.radio, {
                  borderColor: active ? colors.accent : colors.line,
                  backgroundColor: active ? colors.accent : 'transparent',
                }]}>
                  {active && <Icon name="check" size={12} stroke="#fff" sw={2.5} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Color */}
        <SectionLabel label={t.colorLabel} />
        <View style={styles.colorRow}>
          {EXERCISE_COLOR_OPTIONS.map(c => {
            const active = c === color;
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  active && {
                    borderWidth: 3, borderColor: colors.bg,
                    shadowColor: c, shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1, shadowRadius: 4, elevation: 4,
                  },
                ]}
                onPress={() => setColor(c)}
              />
            );
          })}
        </View>

        {/* Muscle group */}
        <SectionLabel label={`${t.muscleGroup} · ${t.muscleGroupOpt}`} />
        <View style={styles.muscleGrid}>
          {MUSCLE_GROUPS.map(g => {
            const active = g === muscleGroup;
            return (
              <TouchableOpacity
                key={g}
                style={[
                  styles.musclePill,
                  {
                    borderColor: active ? colors.accent : colors.line,
                    borderWidth: active ? 1.5 : 1,
                    backgroundColor: active ? colors.accentSoft : 'transparent',
                  },
                ]}
                onPress={() => setMuscleGroup(active ? '' : g)}
              >
                <Text style={[styles.musclePillText, {
                  color: active ? colors.accentInk : colors.ink,
                  fontWeight: active ? '600' : '500',
                }]}>
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          label={isEdit ? t.saveChanges : t.createExercise}
          onPress={handleSave}
          loading={saving}
          disabled={!name.trim()}
          style={{ marginTop: 32 }}
        />
        {isEdit && (
          <Button
            label={t.deleteExercise}
            variant="danger"
            onPress={handleDelete}
            style={{ marginTop: 24 }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '600' },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, marginTop: 8, marginBottom: 28 },
  previewIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  previewIconText: { fontSize: 28 },
  previewInfo: { flex: 1 },
  previewTag: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  previewName: { fontSize: 18, fontWeight: '600', marginTop: 2 },
  previewMeta: { fontSize: 12, marginTop: 2, opacity: 0.85 },
  nameInput: { borderRadius: 12, padding: 14, fontSize: 17, fontWeight: '500', marginTop: 10, marginBottom: 28 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 28 },
  iconCell: { width: '14%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 22 },
  unitList: { gap: 8, marginTop: 10, marginBottom: 28 },
  unitRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12 },
  unitInfo: { flex: 1 },
  unitLabel: { fontSize: 15, fontWeight: '600' },
  unitDesc: { fontSize: 12, marginTop: 2, opacity: 0.8 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  colorRow: { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 28 },
  colorDot: { width: 40, height: 40, borderRadius: 20 },
  muscleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 28 },
  musclePill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18 },
  musclePillText: { fontSize: 13 },
  goalRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 10 },
  goalValue: { fontSize: 17, fontWeight: '500' },
  goalUnit: { fontSize: 14, marginLeft: 6 },
  goalBtns: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
  goalBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  goalBtnText: { fontSize: 16, lineHeight: 20 },
});
