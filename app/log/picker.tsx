import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useExerciseStore } from '@/store/useExerciseStore';
import Icon from '@/components/ui/Icon';

export default function ExercisePickerSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const exercises = useExerciseStore(s => s.exercises);

  function pick(id: string) {
    router.dismiss();
    router.push(`/log/${id}`);
  }

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} onPress={() => router.dismiss()} activeOpacity={1} />

      {/* Sheet */}
      <View style={[styles.sheet, { backgroundColor: colors.bg, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.handle, { backgroundColor: colors.line }]} />
        <Text style={[styles.title, { color: colors.ink2 }]}>
          {t.chooseExercise.toUpperCase()}
        </Text>

        {exercises.map((ex, i) => (
          <TouchableOpacity
            key={ex.id}
            style={[
              styles.row,
              { borderTopColor: colors.line },
              i === exercises.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
            ]}
            onPress={() => pick(ex.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{ex.icon}</Text>
            <Text style={[styles.name, { color: colors.ink }]}>{ex.name}</Text>
            <Icon name="chev" size={14} stroke={colors.ink2} sw={1.8} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 20,
  },
  title: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 18, borderTopWidth: StyleSheet.hairlineWidth,
  },
  icon: { fontSize: 22, marginRight: 16 },
  name: { flex: 1, fontSize: 17, fontWeight: '500' },
});
