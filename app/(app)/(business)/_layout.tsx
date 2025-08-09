import React, { useEffect } from 'react';
import { Stack, Redirect, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';

export default function BusinessLayout() {
  const {token, userName} = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
    }
  }, [token]);

  if (!token) {
    return null;
  };

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="businessDetails" options={{ headerShown: false }} />
      <Stack.Screen name="businessUpdate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessExpenseCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessIncomeCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessIncomeUpdate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessExpenseUpdate" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
