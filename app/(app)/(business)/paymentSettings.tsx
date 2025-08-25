import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';
import { ThemedView } from '@/components/ThemedView';
import { PaymentSettings } from '@/components/payments/PaymentSettings';

export default function PaymentSettingsScreen() {
  const { business } = useSelector((state: RootState) => state.settings);

  if (!business?.id) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View>
          {/* Aquí podrías mostrar un mensaje de error o redireccionar */}
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <PaymentSettings businessId={business.id} />
    </ThemedView>
  );
}
