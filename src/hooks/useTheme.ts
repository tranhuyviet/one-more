import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { useProfileStore } from '@/store/useProfileStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const profile = useProfileStore(s => s.profile);

  // Profile preference overrides system setting if set
  const isDark = profile != null
    ? profile.darkMode
    : systemScheme === 'dark';

  return {
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
  };
}
