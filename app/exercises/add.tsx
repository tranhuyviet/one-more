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
  QUICK_PICK_VALUES,
} from '@/constants/defaultExercises';
import { Unit } from '@/types';


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
  const [quickPicks, setQuickPicks] = useState<string[]>(
    (existing?.quickPicks ?? QUICK_PICK_VALUES[existing?.unit ?? 'reps'] ?? QUICK_PICK_VALUES.reps).map(String)
  );
  const [saving, setSaving] = useState(false);

  function handleUnitChange(newUnit: Unit) {
    setUnit(newUnit);
    setQuickPicks((QUICK_PICK_VALUES[newUnit] ?? QUICK_PICK_VALUES.reps).map(String));
  }

  function handleQuickPickChange(index: number, text: string) {
    const next = [...quickPicks];
    next[index] = text.replace(/[^0-9]/g, '');
    setQuickPicks(next);
  }

  async function handleSave() {
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const parsedPicks = quickPicks.map(v => parseInt(v, 10)).filter(n => n > 0 && !isNaN(n));
      const data = {
        name: name.trim(), icon, unit, color,
        quickPicks: parsedPicks.length > 0 ? parsedPicks : QUICK_PICK_VALUES[unit] ?? QUICK_PICK_VALUES.reps,
      };
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

  const inDurationGroup = unit === 'duration' || unit === 'minutes';
  const inDistanceGroup = unit === 'distance' || unit === 'km';

  const unitShortLabel =
    unit === 'reps' ? t.unitReps
    : unit === 'duration' ? t.unitSeconds
    : unit === 'minutes' ? t.unitMinutes
    : unit === 'distance' ? t.unitMeters
    : t.unitKm;

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
              {unitShortLabel}
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

          {/* Reps */}
          <TouchableOpacity
            style={[
              styles.unitRow,
              {
                borderColor: unit === 'reps' ? colors.accent : colors.line,
                borderWidth: unit === 'reps' ? 1.5 : 1,
                backgroundColor: unit === 'reps' ? colors.accentSoft : 'transparent',
              },
            ]}
            onPress={() => handleUnitChange('reps')}
          >
            <View style={styles.unitInfo}>
              <Text style={[styles.unitLabel, { color: unit === 'reps' ? colors.accentInk : colors.ink }]}>
                {t.unitReps}
              </Text>
              <Text style={[styles.unitDesc, { color: unit === 'reps' ? colors.accentInk : colors.ink2 }]}>
                {t.unitRepsDesc}
              </Text>
            </View>
            <View style={[styles.radio, {
              borderColor: unit === 'reps' ? colors.accent : colors.line,
              backgroundColor: unit === 'reps' ? colors.accent : 'transparent',
            }]}>
              {unit === 'reps' && <Icon name="check" size={12} stroke="#fff" sw={2.5} />}
            </View>
          </TouchableOpacity>

          {/* Duration group */}
          <TouchableOpacity
            style={[
              styles.unitRow,
              {
                borderColor: inDurationGroup ? colors.accent : colors.line,
                borderWidth: inDurationGroup ? 1.5 : 1,
                backgroundColor: inDurationGroup ? colors.accentSoft : 'transparent',
              },
            ]}
            onPress={() => { if (!inDurationGroup) handleUnitChange('duration'); }}
          >
            <View style={styles.unitInfo}>
              <Text style={[styles.unitLabel, { color: inDurationGroup ? colors.accentInk : colors.ink }]}>
                {t.unitDuration}
              </Text>
              <Text style={[styles.unitDesc, { color: inDurationGroup ? colors.accentInk : colors.ink2 }]}>
                {t.unitDurationDesc}
              </Text>
            </View>
            <View style={[styles.radio, {
              borderColor: inDurationGroup ? colors.accent : colors.line,
              backgroundColor: inDurationGroup ? colors.accent : 'transparent',
            }]}>
              {inDurationGroup && <Icon name="check" size={12} stroke="#fff" sw={2.5} />}
            </View>
          </TouchableOpacity>

          {inDurationGroup && (
            <View style={styles.subRow}>
              <TouchableOpacity
                style={[styles.subBtn, {
                  borderColor: unit === 'duration' ? colors.accent : colors.line,
                  borderWidth: unit === 'duration' ? 1.5 : 1,
                  backgroundColor: unit === 'duration' ? colors.accentSoft : colors.card,
                }]}
                onPress={() => handleUnitChange('duration')}
              >
                <Text style={[styles.subBtnLabel, { color: unit === 'duration' ? colors.accentInk : colors.ink }]}>
                  {t.unitSeconds}
                </Text>
                <Text style={[styles.subBtnDesc, { color: unit === 'duration' ? colors.accentInk : colors.ink2 }]}>
                  {t.unitSecondsDesc}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subBtn, {
                  borderColor: unit === 'minutes' ? colors.accent : colors.line,
                  borderWidth: unit === 'minutes' ? 1.5 : 1,
                  backgroundColor: unit === 'minutes' ? colors.accentSoft : colors.card,
                }]}
                onPress={() => handleUnitChange('minutes')}
              >
                <Text style={[styles.subBtnLabel, { color: unit === 'minutes' ? colors.accentInk : colors.ink }]}>
                  {t.unitMinutes}
                </Text>
                <Text style={[styles.subBtnDesc, { color: unit === 'minutes' ? colors.accentInk : colors.ink2 }]}>
                  {t.unitMinutesDesc}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Distance group */}
          <TouchableOpacity
            style={[
              styles.unitRow,
              {
                borderColor: inDistanceGroup ? colors.accent : colors.line,
                borderWidth: inDistanceGroup ? 1.5 : 1,
                backgroundColor: inDistanceGroup ? colors.accentSoft : 'transparent',
              },
            ]}
            onPress={() => { if (!inDistanceGroup) handleUnitChange('distance'); }}
          >
            <View style={styles.unitInfo}>
              <Text style={[styles.unitLabel, { color: inDistanceGroup ? colors.accentInk : colors.ink }]}>
                {t.unitDistance}
              </Text>
              <Text style={[styles.unitDesc, { color: inDistanceGroup ? colors.accentInk : colors.ink2 }]}>
                {t.unitDistanceDesc}
              </Text>
            </View>
            <View style={[styles.radio, {
              borderColor: inDistanceGroup ? colors.accent : colors.line,
              backgroundColor: inDistanceGroup ? colors.accent : 'transparent',
            }]}>
              {inDistanceGroup && <Icon name="check" size={12} stroke="#fff" sw={2.5} />}
            </View>
          </TouchableOpacity>

          {inDistanceGroup && (
            <View style={styles.subRow}>
              <TouchableOpacity
                style={[styles.subBtn, {
                  borderColor: unit === 'distance' ? colors.accent : colors.line,
                  borderWidth: unit === 'distance' ? 1.5 : 1,
                  backgroundColor: unit === 'distance' ? colors.accentSoft : colors.card,
                }]}
                onPress={() => handleUnitChange('distance')}
              >
                <Text style={[styles.subBtnLabel, { color: unit === 'distance' ? colors.accentInk : colors.ink }]}>
                  {t.unitMeters}
                </Text>
                <Text style={[styles.subBtnDesc, { color: unit === 'distance' ? colors.accentInk : colors.ink2 }]}>
                  {t.unitMetersDesc}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subBtn, {
                  borderColor: unit === 'km' ? colors.accent : colors.line,
                  borderWidth: unit === 'km' ? 1.5 : 1,
                  backgroundColor: unit === 'km' ? colors.accentSoft : colors.card,
                }]}
                onPress={() => handleUnitChange('km')}
              >
                <Text style={[styles.subBtnLabel, { color: unit === 'km' ? colors.accentInk : colors.ink }]}>
                  {t.unitKm}
                </Text>
                <Text style={[styles.subBtnDesc, { color: unit === 'km' ? colors.accentInk : colors.ink2 }]}>
                  {t.unitKmDesc}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick picks */}
        <SectionLabel label={`${t.quickPickSetup} (${unitShortLabel.toLowerCase()})`} />
        <View style={styles.quickPickGrid}>
          {quickPicks.map((v, i) => (
            <TextInput
              key={i}
              style={[styles.quickPickInput, {
                backgroundColor: colors.card,
                borderColor: v && parseInt(v) > 0 ? colors.accent : colors.line,
                borderWidth: v && parseInt(v) > 0 ? 1.5 : 1,
                color: colors.ink,
              }]}
              value={v}
              onChangeText={text => handleQuickPickChange(i, text)}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.ink2}
              textAlign="center"
            />
          ))}
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

        <Button
          label={isEdit ? t.saveChanges : t.createExercise}
          icon={isEdit ? 'check' : 'plus'}
          onPress={handleSave}
          loading={saving}
          disabled={!name.trim()}
          style={{ marginTop: 32 }}
        />
        {isEdit && exercises.length > 1 && (
          <Button
            label={t.deleteExercise}
            icon="trash"
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
  subRow: { flexDirection: 'row', gap: 8, paddingLeft: 8 },
  subBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1 },
  subBtnLabel: { fontSize: 14, fontWeight: '600' },
  subBtnDesc: { fontSize: 11, marginTop: 3, opacity: 0.8 },
  quickPickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 28 },
  quickPickInput: {
    width: '30%', flexGrow: 1,
    paddingVertical: 14, borderRadius: 12,
    fontSize: 16, fontWeight: '500',
    borderWidth: 1,
  },
  colorRow: { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 28 },
  colorDot: { width: 40, height: 40, borderRadius: 20 },
});
