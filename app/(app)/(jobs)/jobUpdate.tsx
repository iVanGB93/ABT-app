import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { RootState } from '@/app/(redux)/store';
import { darkMainColor, lightMainColor } from '@/settings';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import JobForm from '@/components/jobs/JobForm';
import { commonStyles } from '@/constants/commonStyles';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';


export default function JobUpdate() {
  const { darkTheme } = useSelector((state: RootState) => state.settings);
  const { job } = useSelector((state: RootState) => state.job);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <>
      <StatusBar style={darkTheme ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={100}
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
          <ThemedText type="subtitle">Update Job for {job.client}</ThemedText>
          <ThemedText type="subtitle"></ThemedText>
        </ThemedView>
        {isLoading ? (
          <ActivityIndicator style={commonStyles.loading} size="large" />
        ) : (
          <ThemedSecondaryView
            style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
          >
            <ScrollView
              keyboardShouldPersistTaps={'handled'}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <JobForm action="update" isLoading={isLoading} setIsLoading={setIsLoading} />
            </ScrollView>
          </ThemedSecondaryView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
