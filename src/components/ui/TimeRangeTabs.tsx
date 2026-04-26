import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

export type TimeRange = 'week' | 'month' | 'year';

interface Props {
  range: TimeRange;
  onChange: (r: TimeRange) => void;
}

export default function TimeRangeTabs({ range, onChange }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const options: { id: TimeRange; label: string }[] = [
    { id: 'week', label: t.week },
    { id: 'month', label: t.month },
    { id: 'year', label: t.year },
  ];
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {options.map(o => {
        const active = o.id === range;
        return (
          <TouchableOpacity
            key={o.id}
            style={[styles.btn, active && { backgroundColor: colors.bg }]}
            onPress={() => onChange(o.id)}
          >
            <Text style={[styles.text, {
              color: active ? colors.accent : colors.ink2,
              fontWeight: active ? '700' : '400',
            }]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 2, padding: 3, borderRadius: 12, marginBottom: 18 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  text: { fontSize: 13 },
});
