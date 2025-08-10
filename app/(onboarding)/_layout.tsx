import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../(redux)/store';


export default function OnboardingLayout() {
  const { token, userName } = useSelector((state: RootState) => state.auth);
  const { business } = useSelector((state: RootState) => state.settings);
  const isAuthed = !!token && !!userName;
  const hasBusiness = !!business && Object.keys(business).length > 0;

  if (!isAuthed) {
    return <Redirect href="/(auth)/login" />;
  }

  if (hasBusiness) {
    return <Redirect href="/(app)/(business)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen options={{ animation: 'fade' }} name="index" />
      <Stack.Screen options={{ animation: 'fade' }} name="businessList" />
      <Stack.Screen options={{ animation: 'fade' }} name="businessCreate" />
    </Stack>
  );
}
