import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RootState } from '@/app/(redux)/store';
import { useSelector } from 'react-redux';
import {
  darkMainColor,
  lightMainColor,
} from '@/settings';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import BusinessForm from '@/components/business/BusinessForm';
import { commonStyles } from '@/constants/commonStyles';
import { commonStylesForm } from '@/constants/commonStylesForm';


export default function BusinessSettings() {
  const { darkTheme } = useSelector((state: RootState) => state.settings);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={100}
      style={[commonStyles.container, { backgroundColor: darkTheme ? darkMainColor : lightMainColor }]}
    >
      {isLoading ? (
        <ActivityIndicator style={commonStyles.containerCentered} size="large" />
      ) : (
        <ThemedSecondaryView style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}>
          <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ flexGrow: 1 }}>
            <BusinessForm action="update" isLoading={isLoading} setIsLoading={setIsLoading} />
          </ScrollView>
        </ThemedSecondaryView>
      )}
    </KeyboardAvoidingView>
  );
}