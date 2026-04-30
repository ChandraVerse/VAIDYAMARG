import { Platform } from 'react-native';

export const FontFamily = {
  regular:  Platform.OS === 'ios' ? 'GeneralSans-Regular'  : 'GeneralSans-Regular',
  medium:   Platform.OS === 'ios' ? 'GeneralSans-Medium'   : 'GeneralSans-Medium',
  semibold: Platform.OS === 'ios' ? 'GeneralSans-Semibold' : 'GeneralSans-Semibold',
  bold:     Platform.OS === 'ios' ? 'GeneralSans-Bold'     : 'GeneralSans-Bold',
};

export const FontSize = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const LineHeight = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.75,
} as const;
