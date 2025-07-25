import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';

import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import BusinessForm from '@/components/business/BusinessForm';
import { commonStylesForm } from '@/constants/commonStylesForm';
import Toast from 'react-native-toast-message';
import { setError, setMessage } from '../(redux)/settingSlice';

export default function BusinessCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const { darkTheme, error, message } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
  if (error) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error,
    });
    setError(null);
  }
  if (message) {
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: message,
    });
    setMessage(null);
  }
}, [error, message]);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={100}
      style={[
        commonStyles.container,
        {
          backgroundColor: darkTheme ? darkMainColor : lightMainColor,
          marginTop: 50,
        },
      ]}
    >
      <ThemedText type="title">Create New Business</ThemedText>
      {isLoading ? (
        <ActivityIndicator style={commonStyles.containerCentered} size="large" />
      ) : (
        <ThemedSecondaryView
          style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
        >
          <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ flexGrow: 1 }}>
            <BusinessForm action="create" isLoading={isLoading} setIsLoading={setIsLoading} />
          </ScrollView>
        </ThemedSecondaryView>
      )}
    </KeyboardAvoidingView>
  );
}
