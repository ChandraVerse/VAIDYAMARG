import Constants from 'expo-constants';

export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:3000/api/v1';

export const COLORS = {
  primary:         '#01696f',
  primaryDark:     '#004f55',
  primaryLight:    '#4f98a3',
  primaryHighlight:'#cedcd8',
  gold:            '#d4920a',
  goldLight:       '#f5c842',
  bg:              '#f7f6f2',
  surface:         '#f9f8f5',
  border:          '#d4d1ca',
  text:            '#28251d',
  textMuted:       '#7a7974',
  textFaint:       '#bab9b4',
  error:           '#a12c7b',
  success:         '#437a22',
  warning:         '#964219',
  white:           '#ffffff',
} as const;

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT_SIZE = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
  xl:   22,
  xxl:  28,
  hero: 36,
} as const;

export const RADIUS = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  full: 9999,
} as const;
