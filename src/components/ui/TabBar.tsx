import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Icon from './Icon';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { TAB_BAR_HEIGHT } from '@/constants/theme';

type TabItem =
  | { id: string; href: string; icon: 'home' | 'chart' | 'clock' | 'user'; labelKey: 'home' | 'stats' | 'history' | 'profile'; big?: false }
  | { id: string; href: string; icon: 'plus'; labelKey: 'log'; big: true };

const TABS: TabItem[] = [
  { id: 'home',    href: '/',          icon: 'home',  labelKey: 'home' },
  { id: 'stats',   href: '/stats',     icon: 'chart', labelKey: 'stats' },
  { id: 'log',     href: '/log/picker', icon: 'plus',  labelKey: 'log', big: true },
  { id: 'history', href: '/history',   icon: 'clock', labelKey: 'history' },
  { id: 'profile', href: '/profile',   icon: 'user',  labelKey: 'profile' },
];

export default function TabBar() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <View style={[styles.container, {
      borderTopColor: colors.line,
      backgroundColor: colors.bg,
      paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    }]}>
      {TABS.map(tab => {
        const active = isActive(tab.href);
        const color = active ? colors.accent : colors.ink2;

        if (tab.big) {
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabCenter}
              onPress={() => router.push(tab.href as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.plusBtn, { backgroundColor: colors.accent }]}>
                <Icon name="plus" size={24} stroke={isDark ? colors.bg : '#fff'} sw={2.5} />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => router.push(tab.href as any)}
            activeOpacity={0.7}
          >
            <Icon name={tab.icon} size={22} stroke={color} sw={active ? 2.2 : 1.8} />
            <Text style={[styles.label, { color, fontWeight: active ? '700' : '500' }]}>{t[tab.labelKey]}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    shadowColor: '#0F7A3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
