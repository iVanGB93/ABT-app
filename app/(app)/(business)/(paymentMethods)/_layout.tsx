import React from 'react';
import { Stack } from 'expo-router';


export default function PaymentMethodsLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="paymentMethodCreate" options={{ headerShown: false }} />
      <Stack.Screen name="paymentMethodUpdate" options={{ headerShown: false }} />
    </Stack>
  );
}
