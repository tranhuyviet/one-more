import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import SetRow from './SetRow';
import Icon from '@/components/ui/Icon';
import { Exercise, ExerciseLog, Unit } from '@/types';

export interface ExerciseGroup {
  exercise: Exercise;
  total: number;
  sets: number;
  logs: ExerciseLog[];
}

interface Props {
  exercises: ExerciseGroup[];
  onAddMore?: (exerciseId: string) => void;
  onHeaderPress?: (exerciseId: string) => void;
}

export default function DayDetail({ exercises, onAddMore, onHeaderPress }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      {exercises.map(ex => {
        const color = ex.exercise.color;
        const unit = ex.exercise.unit as Unit;
        const unitLabel = unit === 'reps' ? t.reps
          : unit === 'duration' ? t.seconds
          : unit === 'minutes' ? t.minutes
          : unit === 'km' ? t.km
          : t.meters;

        const header = (
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: `${color}28` }]}>
              <Text style={styles.iconText}>{ex.exercise.icon}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.ink }]}>{ex.exercise.name}</Text>
              <Text style={[styles.setsLabel, { color }]}>{ex.sets} {t.sets}</Text>
            </View>
            <View style={styles.valueWrap}>
              <Text style={[styles.total, { color: colors.ink }]}>{ex.total}</Text>
              <Text style={[styles.unitLabel, { color }]}>{unitLabel}</Text>
            </View>
            {onHeaderPress && (
              <View style={[styles.chevWrap, { transform: [{ rotate: '90deg' }] }]}>
                <Icon name="chev" size={13} stroke={color} sw={2} />
              </View>
            )}
          </View>
        );

        return (
          <View key={ex.exercise.id} style={[styles.card, { backgroundColor: `${color}15` }]}>
            {onHeaderPress ? (
              <TouchableOpacity onPress={() => onHeaderPress(ex.exercise.id)} activeOpacity={0.7}>
                {header}
              </TouchableOpacity>
            ) : header}

            <View style={[styles.divider, { backgroundColor: `${color}30` }]} />

            <View style={styles.rows}>
              {ex.logs.map((log, j) => {
                const logTime = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <SetRow
                    key={log.id}
                    index={j}
                    time={logTime}
                    value={log.value}
                    note={log.note}
                    unit={unit}
                    isLast={j === ex.logs.length - 1}
                    accentColors={{ bg: `${color}20`, text: color, border: `${color}30` }}
                  />
                );
              })}
            </View>

            {onAddMore && (
              <TouchableOpacity
                style={[styles.addMore, { borderTopColor: `${color}30` }]}
                onPress={() => onAddMore(ex.exercise.id)}
                activeOpacity={0.7}
              >
                <Icon name="plus" size={14} stroke={color} sw={2.5} />
                <Text style={[styles.addMoreText, { color }]}>{t.addSet}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  rows: { paddingHorizontal: 12, paddingBottom: 4 },
  addMore: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addMoreText: { fontSize: 13, fontWeight: '600' },
  iconBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconText: { fontSize: 16, lineHeight: 20 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  setsLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginTop: 3 },
  valueWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  total: { fontSize: 32, fontWeight: '300', letterSpacing: -1, lineHeight: 36 },
  unitLabel: { fontSize: 12, marginBottom: 2 },
  chevWrap: { marginLeft: 10 },
});
