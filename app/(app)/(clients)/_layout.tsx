import React, { useEffect } from 'react';
import { useRouter, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';


export default function ClientLayout() {
  const token = useSelector((state: RootState) => state.auth.token);
  const { business } = useSelector((state: RootState) => state.settings);
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
      <Stack.Screen name="clientDetails" options={{ headerShown: false }} />
      <Stack.Screen name="clientCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="clientUpdate" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
