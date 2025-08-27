import React from 'react';
import { Stack } from 'expo-router';


export default function BusinessLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, animation: 'simple_push' }} />
      <Stack.Screen name="businessDetails" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessMonthDetails" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessUpdate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessExpenseCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessIncomeCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessIncomeUpdate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessExpenseUpdate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="settings" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessSettings" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="profileEdit" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="styleSettings" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="biometricSettings" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="(paymentMethods)" options={{ headerShown: false }} />
    </Stack>
  );
}
