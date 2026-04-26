import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface FilterItem {
  id: string;
  icon: string;
  name: string;
}

interface Props {
  items: FilterItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ExerciseFilterBar({ items, selectedId, onSelect }: Props) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {items.map(item => {
        const active = item.id === selectedId;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.chip, {
              borderColor: active ? colors.accent : colors.line,
              borderWidth: active ? 1.5 : 1,
              backgroundColor: active ? colors.accentSoft : 'transparent',
            }]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={[styles.icon, { color: active ? colors.accentInk : colors.ink }]}>
              {item.icon}
            </Text>
            <Text style={[styles.name, {
              color: active ? colors.accentInk : colors.ink,
              fontWeight: active ? '600' : '500',
            }]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 14 },
  content: { gap: 8, paddingBottom: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 22,
  },
  icon: { fontSize: 15 },
  name: { fontSize: 14 },
});
