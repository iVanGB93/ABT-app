/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';

import { SecondaryColors } from '@/constants/SecondaryColors';

export function useSecondaryThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof SecondaryColors.light & keyof typeof SecondaryColors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return SecondaryColors[theme][colorName];
  }
}
