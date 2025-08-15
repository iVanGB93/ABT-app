import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RootState } from '@/app/(redux)/store';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import { darkMainColor, lightMainColor } from '@/settings';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { commonStyles } from '@/constants/commonStyles';
import ClientForm from '@/components/clients/ClientForm';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function ClientUpdate() {
  const { darkTheme, color } = useSelector((state: RootState) => state.settings);
  const { clientLoading } = useSelector((state: RootState) => state.client);
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={[
        commonStyles.container,
        { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
      ]}
    >
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Update Client</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
      {clientLoading ? (
        <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
      ) : (
        <ThemedSecondaryView
          style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
        >
          <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ flexGrow: 1 }}>
            <ClientForm action="update" />
          </ScrollView>
        </ThemedSecondaryView>
      )}
    </KeyboardAvoidingView>
  );
}
