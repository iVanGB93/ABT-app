import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import { RootState } from '@/app/(redux)/store';
import { darkMainColor, lightMainColor } from '@/settings';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import JobForm from '@/components/jobs/JobForm';
import { commonStyles } from '@/constants/commonStyles';
import { commonStylesForm } from '@/constants/commonStylesForm';

export default function JobUpdate() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [isLoading, setIsLoading] = useState(false);
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
      {isLoading ? (
        <ActivityIndicator style={commonStyles.loading} size="large" />
      ) : (
        <ThemedSecondaryView
          style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
        >
          <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ flexGrow: 1 }}>
            <JobForm action="update" isLoading={isLoading} setIsLoading={setIsLoading} />
          </ScrollView>
        </ThemedSecondaryView>
      )}
    </KeyboardAvoidingView>
  );
}
