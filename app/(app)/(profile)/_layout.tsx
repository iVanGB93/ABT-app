import { useSelector } from 'react-redux';
import { Stack, Redirect } from 'expo-router';
import { RootState } from '../../(redux)/store';
import { StatusBar } from 'expo-status-bar';

import { darkSecondColor, lightSecondColor } from '@/settings';

export default function ProfileLayout() {
  const { darkTheme, business } = useSelector((state: RootState) => state.settings);
  const token = useSelector((state: RootState) => state.auth.token);

  if (!token) {
    return <Redirect href="/" />;
  }
  if (!business || Object.keys(business).length === 0) {
    return <Redirect href="/(businessSelect)" />;
  }

  return (
    <>
    <StatusBar style={darkTheme ? 'light' : 'dark'} />
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: 'Profile' }} />
      <Stack.Screen name="businessSettings" options={{ headerTitle: 'Update Business' }} />
      <Stack.Screen name="styleSettings" options={{ headerTitle: 'Update Style' }} />
    </Stack>
    </>
  );
}
