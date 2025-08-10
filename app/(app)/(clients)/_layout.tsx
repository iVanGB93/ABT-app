import React from 'react';
import { Stack } from 'expo-router';


export default function ClientLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="clientDetails" options={{ headerShown: false }} />
      <Stack.Screen name="clientCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="clientUpdate" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
