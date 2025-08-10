import React from 'react';
import { Stack } from 'expo-router';


export default function JobLayout() {

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
