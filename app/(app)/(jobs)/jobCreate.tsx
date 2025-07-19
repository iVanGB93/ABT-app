import React, { useState } from 'react';
import { KeyboardAvoidingView, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';

import { RootState } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { darkMainColor, lightMainColor } from '@/settings';
import JobForm from '@/components/jobs/JobForm';
import { commonStyles } from '@/constants/commonStyles';
import { commonStylesForm } from '@/constants/commonStylesForm';

export default function JobCreate() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={100}
      style={[
        commonStyles.container,
        { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
      ) : (
        <ThemedSecondaryView
          style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
        >
          <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ flexGrow: 1 }}>
            <JobForm action="new" isLoading={isLoading} setIsLoading={setIsLoading} />
          </ScrollView>
        </ThemedSecondaryView>
      )}
    </KeyboardAvoidingView>
  );
}
