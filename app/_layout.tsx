import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { onAuthChange } from '@/firebase/auth';

export default function RootLayout() {
  const { isDark } = useTheme();
  const setUser = useAuthStore(s => s.setUser);
  const signIn = useAuthStore(s => s.signIn);
  const loadProfile = useProfileStore(s => s.loadProfile);

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (user) {
        setUser(user);
        await loadProfile(user.uid);
      } else {
        // No user — sign in anonymously
        await signIn();
      }
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
        <Stack.Screen name="history/index" />
        <Stack.Screen name="stats/index" />
        <Stack.Screen name="profile/index" />
      </Stack>
    </>
  );
}
