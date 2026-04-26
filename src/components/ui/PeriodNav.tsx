import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Icon from '@/components/ui/Icon';

interface Props {
  label: string;
  sub: string;
  isPresent: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function PeriodNav({ label, sub, isPresent, onPrev, onNext }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { borderBottomColor: colors.line }]}>
      <TouchableOpacity
        style={[styles.btn, { borderColor: colors.line }]}
        onPress={onPrev}
      >
        <Icon name="chevLeft" size={12} stroke={colors.ink2} sw={2} />
      </TouchableOpacity>
      <View style={styles.center}>
        <Text style={[styles.label, { color: colors.ink }]}>{label}</Text>
        <Text style={[styles.sub, {
          color: isPresent ? colors.accent : colors.ink2,
          fontWeight: isPresent ? '600' : '400',
        }]}>
          {sub}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.btn, { borderColor: colors.line, opacity: isPresent ? 0.35 : 1 }]}
        onPress={onNext}
        disabled={isPresent}
      >
        <Icon name="chev" size={12} stroke={colors.ink2} sw={2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 20,
  },
  btn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  center: { alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  sub: { fontSize: 11, marginTop: 2, letterSpacing: 0.3 },
});
