import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';

import { PersistGate } from 'redux-persist/integration/react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { persistor, store } from './(redux)/store';
import { StatusBar } from 'expo-status-bar';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack
          screenOptions={{
              headerShown: false
          }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <Toast />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
