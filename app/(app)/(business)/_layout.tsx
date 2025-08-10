import React from 'react';
import { Stack } from 'expo-router';


export default function BusinessLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="businessDetails" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessMonthDetails" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessUpdate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessExpenseCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessIncomeCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessIncomeUpdate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="businessExpenseUpdate" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
