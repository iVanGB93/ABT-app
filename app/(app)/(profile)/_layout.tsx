import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, Stack } from 'expo-router';
import { RootState } from '../../(redux)/store';


export default function ProfileLayout() {
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
      <Stack.Screen name="businessSettings" options={{ headerShown: false }} />
      <Stack.Screen name="profileSettings" options={{ headerShown: false }} />
      <Stack.Screen name="styleSettings" options={{ headerShown: false }} />
      <Stack.Screen options={{ animation: 'slide_from_bottom' }} name="accountDetails" />
    </Stack>
  );
}
