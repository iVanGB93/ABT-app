import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '@/app/(redux)/store';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import InvoiceForm from '@/components/jobs/invoiceForm';

interface Errors {
  description?: string;
  paid?: any;
  amount?: any;
}

export default function InvoiceUpdate() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { job } = useSelector((state: RootState) => state.job);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={commonStyles.container}
    >
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Update Invoice</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
      {loading ? (
        <ActivityIndicator style={commonStyles.loading} color={color} size={36} />
      ) : (
        <InvoiceForm action="update" loading={loading} setLoading={setLoading} />
      )}
    </KeyboardAvoidingView>
  );
}
