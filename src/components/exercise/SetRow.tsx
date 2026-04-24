import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Unit } from '@/types';

interface SetRowProps {
  index: number;
  time: string;
  value: number;
  note?: string;
  unit: Unit;
  isLast?: boolean;
  accentColors?: { bg: string; text: string; border: string };
}

function formatValue(value: number, unit: Unit, repsLabel: string, secLabel: string): string {
  if (unit === 'duration') {
    const m = Math.floor(value / 60);
    const s = value % 60;
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s} ${secLabel}`;
  }
  if (unit === 'distance') {
    return value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${value} m`;
  }
  return `${value}`;
}

export default function SetRow({
  index,
  time,
  value,
  note,
  unit,
  isLast = false,
  accentColors,
}: SetRowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const borderColor = accentColors?.border ?? colors.line;
  const textColor = accentColors?.text ?? colors.ink;
  const bgColor = accentColors?.bg ?? colors.accentSoft;
  const ink2 = accentColors?.text ?? colors.ink2;

  return (
    <View style={[styles.row, { borderBottomColor: borderColor, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }]}>
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{index + 1}</Text>
      </View>
      <View style={styles.timeRow}>
        <Icon name="clock" size={13} stroke={textColor} sw={1.6} />
        <Text style={[styles.time, { color: textColor }]}>{time}</Text>
      </View>
      {note ? (
        <Text style={[styles.note, { color: ink2 }]} numberOfLines={1}>{note}</Text>
      ) : (
        <View style={styles.notePlaceholder} />
      )}
      <Text style={[styles.value, { color: textColor }]}>
        {formatValue(value, unit, t.reps, t.seconds)}
        <Text style={[styles.unitText, { color: ink2 }]}>
          {' '}{unit === 'reps' ? t.reps : unit === 'duration' ? '' : ''}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 8,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 60,
  },
  time: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  note: {
    flex: 1,
    fontSize: 12,
    fontStyle: 'italic',
    paddingRight: 8,
    opacity: 0.85,
  },
  notePlaceholder: {
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  unitText: {
    fontSize: 11,
    fontWeight: '400',
  },
});
