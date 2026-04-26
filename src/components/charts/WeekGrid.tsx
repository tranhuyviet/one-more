import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

interface WeekGridRow {
  icon: string;
  name: string;
  color: string;
  week: number[]; // 7 values Mon-Sun
}

interface WeekGridProps {
  rows: WeekGridRow[];
  todayIndex?: number; // 0=Mon ... 6=Sun
  onCellPress?: (rowIndex: number, dayIndex: number) => void;
  selectedCell?: { row: number; day: number };
}

export default function WeekGrid({ rows, todayIndex = 6, onCellPress, selectedCell }: WeekGridProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const weekDays = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];

  return (
    <View>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.labelCol} />
        {weekDays.map((d, i) => {
          const isToday = i === todayIndex;
          return (
            <View key={i} style={styles.dayCell}>
              {isToday ? (
                <View style={[styles.todayBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.todayBadgeText}>{d}</Text>
                </View>
              ) : (
                <Text style={[styles.dayLabel, { color: colors.ink2 }]}>{d}</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Data rows */}
      {rows.map((row, ri) => {
        const max = Math.max(...row.week, 1);
        return (
          <View key={ri} style={[styles.dataRow, { borderTopColor: colors.line }]}>
            {/* Exercise label */}
            <View style={styles.labelCol}>
              <View style={[styles.iconBadge, { backgroundColor: `${row.color}20` }]}>
                <Text style={styles.labelIcon}>{row.icon}</Text>
              </View>
            </View>

            {/* Bars */}
            {row.week.map((v, i) => {
              const isToday = i === todayIndex;
              const isSel = selectedCell?.row === ri && selectedCell?.day === i;
              const barH = v === 0 ? 0 : 6 + (v / max) * 30;
              const barColor = isSel
                ? row.color
                : v === 0 ? colors.line : isToday ? colors.accent : colors.ink;
              const textColor = isSel ? row.color : isToday ? colors.ink : colors.ink2;

              const cellStyle = [
                styles.barCell,
                isSel ? { backgroundColor: `${row.color}12`, borderRadius: 6 } : null,
              ];

              const inner = (
                <>
                  <Text style={[
                    styles.barValue,
                    { color: textColor },
                    (isToday || isSel) && { fontWeight: '600' },
                  ]}>
                    {v > 0 ? v : '—'}
                  </Text>
                  <View style={[styles.bar, {
                    height: Math.max(barH, v > 0 ? 2 : 0),
                    backgroundColor: barColor,
                    borderRadius: 2,
                  }]} />
                </>
              );

              if (v > 0 && onCellPress) {
                return (
                  <TouchableOpacity
                    key={i}
                    style={cellStyle}
                    onPress={() => onCellPress(ri, i)}
                    activeOpacity={0.7}
                  >
                    {inner}
                  </TouchableOpacity>
                );
              }

              return <View key={i} style={cellStyle}>{inner}</View>;
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelCol: {
    width: 36,
    alignItems: 'center',
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelIcon: {
    fontSize: 15,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  todayBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barCell: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
  },
  barValue: {
    fontSize: 10,
    fontVariant: ['tabular-nums'],
    fontWeight: '400',
    minHeight: 12,
  },
  bar: {
    width: '70%',
  },
});
