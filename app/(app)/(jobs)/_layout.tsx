import React, { useEffect } from 'react';
import { useRouter, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';


export default function JobLayout() {
  const { business } = useSelector((state: RootState) => state.settings);
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
    }
  }, [token]);

  useEffect(() => {
    if (token && (!business || Object.keys(business).length === 0)) {
      router.replace('/(app)/(business)');
    }
  }, [token, business]);

  if (!token || !business || Object.keys(business).length === 0) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="jobDetails" options={{ headerShown: false }} />
      <Stack.Screen name="jobCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="jobUpdate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="invoice" options={{ headerShown: false }} />
      <Stack.Screen name="invoiceCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="invoiceUpdate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="spentCreate" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
