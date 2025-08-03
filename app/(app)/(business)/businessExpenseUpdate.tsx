import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { darkMainColor, lightMainColor } from '@/settings';
import { RootState } from '@/app/(redux)/store';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { commonStyles } from '@/constants/commonStyles';
import { useLocalSearchParams } from 'expo-router';
import ExtrasForm from '@/components/business/ExtrasForm';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function BusinessExpenseUpdate() {
  const { darkTheme } = useSelector((state: RootState) => state.settings);
  const { extraExpenses } = useSelector((state: RootState) => state.business);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState<any>(null);
  const [category, setCategory] = useState<string>('other');
  const [isDeductible, setIsDeductible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const params = useLocalSearchParams();
  const expenseId = params.id;
  const router = useRouter();

  useEffect(() => {
    if (expenseId) {
      const expense = extraExpenses.find(
        (expense: any) => Number(expense.id) === Number(expenseId),
      );
      if (expense) {
        setDescription(expense.description);
        setAmount(expense.amount);
        setImage(expense.image);
        setCategory(expense.category);
        setIsDeductible(expense.tax_deductible);
        console.log(isDeductible, expense.tax_deductible);

      }
    }
  }, [expenseId, extraExpenses]);

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
          <ThemedText type="subtitle">Update Expense</ThemedText>
          <ThemedText type="subtitle"></ThemedText>
        </ThemedView>
        {isLoading ? (
          <ActivityIndicator style={commonStyles.containerCentered} size="large" />
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
                category={category}
                setCategory={setCategory}
                type="expense"
                action="update"
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                isDeductible={isDeductible}
                setIsDeductible={setIsDeductible}
                id={expenseId}
              />
            </ScrollView>
          </ThemedSecondaryView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
