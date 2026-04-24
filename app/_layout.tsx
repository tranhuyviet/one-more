import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { onAuthChange } from '@/firebase/auth';
import AppLogo from '@/components/ui/AppLogo';

function SplashOverlay() {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.splash, { backgroundColor: colors.bg }]}>
      <View style={styles.splashCenter}>
        <AppLogo size={96} color={isDark ? colors.bg : '#fff'} />
        <Text style={[styles.splashTitle, { color: colors.ink }]}>ONE MORE</Text>
      </View>
      <Text style={[styles.splashHint, { color: colors.ink2 }]}>ONE MORE REP</Text>
    </View>
  );
}

export default function RootLayout() {
  const { isDark } = useTheme();
  const setUser = useAuthStore(s => s.setUser);
  const signIn = useAuthStore(s => s.signIn);
  const loadProfile = useProfileStore(s => s.loadProfile);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (user) {
        setUser(user);
        await loadProfile(user.uid);
      } else {
        await signIn();
      }
      setIsReady(true);
    });
    return unsub;
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="exercises/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="exercises/add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="log/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="log/picker" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="history/index" />
        <Stack.Screen name="stats/index" />
        <Stack.Screen name="profile/index" />
      </Stack>
      {!isReady && <SplashOverlay />}
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  splashCenter: {
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 28,
  },
  splashHint: {
    position: 'absolute',
    bottom: 48,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
