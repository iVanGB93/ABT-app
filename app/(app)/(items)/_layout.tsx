import React from 'react';
import { Stack } from 'expo-router';


export default function ItemLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="itemDetails" options={{ headerShown: false }} />
      <Stack.Screen name="itemCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="itemUpdate" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
