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
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { commonStyles } from '@/constants/commonStyles';
import { useLocalSearchParams } from 'expo-router';
import ExtrasForm from '@/components/business/ExtrasForm';
import { commonStylesForm } from '@/constants/commonStylesForm';


export default function BusinessExpenseUpdate() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { extraExpenses } = useSelector((state: RootState) => state.business);
  const [isEnabled, setIsEnabled] = useState<any>(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const params = useLocalSearchParams();
  const expenseId = params.id;

  useEffect(() => {
    if (expenseId) {
      const expense = extraExpenses.find((expense: any) => Number(expense.id) === Number(expenseId));
      if (expense) {
        setDescription(expense.description);
        setAmount(expense.amount);
        setImage(expense.image);
      }
    }
  }, [expenseId, extraExpenses]);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={[commonStyles.container, { backgroundColor: darkTheme ? darkMainColor : lightMainColor }]}
    >
      {isLoading ? (
        <ActivityIndicator style={commonStyles.loading} size="large" />
      ) : (
        <ThemedSecondaryView style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}>
          <ScrollView>
            <ExtrasForm 
              description={description}
              setDescription={setDescription}
              amount={amount}
              setAmount={setAmount}
              image={image}
              setImage={setImage}
              type="expense"
              action="update"
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              id={expenseId}
            />
          </ScrollView>
        </ThemedSecondaryView>
      )}
    </KeyboardAvoidingView>
  );
};