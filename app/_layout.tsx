import { Text } from 'react-native';
import { Stack, Slot } from 'expo-router';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';

import AppWrapper from './(redux)/AppWrapper';
import { persistor, store } from './(redux)/store';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
          screenOptions={{
              headerShown: false
          }}
          >
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
