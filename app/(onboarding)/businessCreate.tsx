import React, { useState } from 'react';
import { KeyboardAvoidingView, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';

import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { darkMainColor, lightMainColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import BusinessForm from '@/components/business/BusinessForm';
import { commonStylesForm } from '@/constants/commonStylesForm';

export default function BusinessCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const { darkTheme } = useSelector((state: RootState) => state.settings);

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
      <ThemedText style={{textAlign: 'center'}} type="title">Create New Business</ThemedText>
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
