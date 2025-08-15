import React from 'react';
import { Stack } from 'expo-router';


export default function ProfileLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="businessSettings" options={{ headerShown: false }} />
      <Stack.Screen name="profileSettings" options={{ headerShown: false }} />
      <Stack.Screen name="styleSettings" options={{ headerShown: false }} />
      <Stack.Screen name="biometricSettings" options={{ headerShown: false }} />
    </Stack>
  );
}
