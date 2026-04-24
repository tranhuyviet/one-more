import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Icon from '@/components/ui/Icon';

type IconName = React.ComponentProps<typeof Icon>['name'];

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, isDark } = useTheme();

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...(variant === 'primary' && {
      backgroundColor: colors.accent,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    }),
    ...(variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.line,
    }),
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
    }),
    ...(variant === 'danger' && {
      backgroundColor: colors.danger,
      shadowColor: colors.danger,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    }),
    ...(disabled && { opacity: 0.5 }),
  };

  const labelStyle: TextStyle = {
    ...styles.label,
    ...(variant === 'primary' && { color: isDark ? colors.bg : '#fff' }),
    ...(variant === 'outline' && { color: colors.ink }),
    ...(variant === 'ghost' && { color: colors.ink2 }),
    ...(variant === 'danger' && { color: '#fff' }),
  };

  const iconColor =
    variant === 'primary' ? (isDark ? colors.bg : '#fff') :
    variant === 'danger' ? '#fff' :
    variant === 'outline' ? colors.ink :
    colors.ink2;

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : colors.accent} />
      ) : (
        <View style={styles.content}>
          {icon && <Icon name={icon} size={18} stroke={iconColor} sw={2.2} />}
          <Text style={[labelStyle, textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
