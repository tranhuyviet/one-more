import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { useProfileStore } from '@/store/useProfileStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const profile = useProfileStore(s => s.profile);

  const mode = profile?.darkMode ?? 'auto';
  const isDark = mode === 'auto' ? systemScheme === 'dark' : mode === 'dark';

  return {
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
  };
}
