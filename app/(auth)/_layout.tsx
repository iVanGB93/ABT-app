import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../(redux)/store';


export default function AuthLayout() {
  const { token, userName } = useSelector((state: RootState) => state.auth);
  const isAuthed = !!token && !!userName;

  if (isAuthed) {
    return <Redirect href="/(onboarding)" />;
  }

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
