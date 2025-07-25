import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  darkMainColor,
  lightMainColor,
} from '@/settings';
import { RootState } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { commonStyles } from '@/constants/commonStyles';
import ExtrasForm from '@/components/business/ExtrasForm';
import { commonStylesForm } from '@/constants/commonStylesForm';

export default function BusinessExpenseCreate() {
  const { darkTheme } = useSelector((state: RootState) => state.settings);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState<any>(null);
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
        <ActivityIndicator style={commonStyles.loading} size="large" />
      ) : (
        <ThemedSecondaryView
          style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
        >
          <ScrollView>
            <ExtrasForm
              description={description}
              setDescription={setDescription}
              amount={amount}
              setAmount={setAmount}
              image={image}
              setImage={setImage}
              type='expense'
              action='new'
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </ScrollView>
        </ThemedSecondaryView>
      )}
    </KeyboardAvoidingView>
  );
}
