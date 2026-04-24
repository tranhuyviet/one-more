import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

interface WeekGridRow {
  icon: string;
  name: string;
  week: number[]; // 7 values Mon-Sun
}

interface WeekGridProps {
  rows: WeekGridRow[];
  todayIndex?: number; // 0=Mon ... 6=Sun
}

export default function WeekGrid({ rows, todayIndex = 6 }: WeekGridProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const weekDays = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];

  return (
    <View>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.labelCol} />
        {weekDays.map((d, i) => (
          <Text
            key={i}
            style={[
              styles.dayLabel,
              { color: i === todayIndex ? colors.ink : colors.ink2 },
              i === todayIndex && styles.dayLabelToday,
            ]}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Data rows */}
      {rows.map((row, ri) => {
        const max = Math.max(...row.week, 1);
        return (
          <View
            key={ri}
            style={[styles.dataRow, { borderTopColor: colors.line }]}
          >
            {/* Exercise label */}
            <View style={styles.labelCol}>
              <Text style={styles.labelIcon}>{row.icon}</Text>
              <Text style={[styles.labelName, { color: colors.ink2 }]} numberOfLines={1}>
                {row.name}
              </Text>
            </View>

            {/* Bars */}
            {row.week.map((v, i) => {
              const isToday = i === todayIndex;
              const barH = v === 0 ? 0 : 6 + (v / max) * 30;
              return (
                <View key={i} style={styles.barCell}>
                  <Text style={[
                    styles.barValue,
                    { color: isToday ? colors.ink : colors.ink2 },
                    isToday && { fontWeight: '600' },
                  ]}>
                    {v > 0 ? v : '—'}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barH, v > 0 ? 2 : 0),
                        backgroundColor: v === 0
                          ? colors.line
                          : isToday ? colors.accent : colors.ink,
                        borderRadius: 2,
                      },
                    ]}
                  />
                </View>
              );
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
    width: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 4,
  },
  labelIcon: {
    fontSize: 14,
  },
  labelName: {
    fontSize: 10,
    fontWeight: '500',
    flexShrink: 1,
  },
  dayLabel: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  dayLabelToday: {
    fontWeight: '700',
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
