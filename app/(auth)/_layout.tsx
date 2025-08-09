import React, { useEffect } from 'react';
import { useRouter, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../(redux)/store';


export default function AuthLayout() {
  const { token, userName } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!!token && !!userName) {
      router.navigate('/(app)/(business)');
    }
  }, [token, userName]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen options={{ animation: 'slide_from_right' }} name="login" />
      <Stack.Screen options={{ animation: 'slide_from_left' }} name="register" />
      <Stack.Screen options={{ animation: 'slide_from_right' }} name="verifyCode" />
      <Stack.Screen options={{ animation: 'slide_from_right' }} name="usernameAndPassword" />
    </Stack>
  );
}
