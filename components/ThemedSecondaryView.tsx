import { View, type ViewProps } from 'react-native';

import { useSecondaryThemeColor } from '@/hooks/useSecondaryThemeColor';

export type ThemedSecondaryView = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedSecondaryView({ style, lightColor, darkColor, ...otherProps }: ThemedSecondaryView) {
  const backgroundColor = useSecondaryThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
