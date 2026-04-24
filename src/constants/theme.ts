export const Colors = {
  light: {
    bg: '#FAFAF7',
    card: '#FFFFFF',
    ink: '#0F1713',
    ink2: '#5C6660',
    line: '#EAEBE6',
    accent: '#0F7A3A',
    accentSoft: '#E8F2EC',
    accentInk: '#0A5529',
    accentLine: '#D5E5DB',
    danger: '#C5443A',
    dangerSoft: '#FDECEC',
    warning: '#FFF6E5',
    warningBorder: '#F0D89B',
    warningText: '#6B4A0E',
  },
  dark: {
    bg: '#0B0F0D',
    card: '#141A17',
    ink: '#F2F3EE',
    ink2: '#8A938C',
    line: '#232B27',
    accent: '#5FD693',
    accentSoft: '#1A2A22',
    accentInk: '#5FD693',
    accentLine: '#23332B',
    danger: '#FF6B6B',
    dangerSoft: '#2A1215',
    warning: '#2A1E0A',
    warningBorder: '#5C4010',
    warningText: '#D4A85A',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  hero: 32,
  giant: 44,
  mega: 88,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 22,
  full: 9999,
} as const;

export const TAB_BAR_HEIGHT = 84;
export const FONT_FAMILY = '-apple-system, "SF Pro Display", "Inter", system-ui, sans-serif';
