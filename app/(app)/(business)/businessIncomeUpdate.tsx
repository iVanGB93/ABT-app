import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import {
  darkMainColor,
  lightMainColor,
} from '@/settings';
import { RootState } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { commonStyles } from '@/constants/commonStyles';
import { useLocalSearchParams } from 'expo-router';
import ExtrasForm from '@/components/business/ExtrasForm';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function BusinessIncomeUpdate() {
  const { darkTheme } = useSelector((state: RootState) => state.settings);
  const { extraIncome } = useSelector((state: RootState) => state.business);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState<any>(null);
  const [category, setCategory] = useState<string>('other');
  const [isLoading, setIsLoading] = useState(false);
  const params = useLocalSearchParams();
  const incomeId = params.id;
  const router = useRouter();

  useEffect(() => {
    if (incomeId) {
      const income = extraIncome.find((income: any) => Number(income.id) === Number(incomeId));
      if (income) {
        setDescription(income.description);
        setAmount(income.amount);
        setImage(income.image);
      }
    }
  }, [incomeId, extraIncome]);

  return (
    <>
          <StatusBar style={darkTheme ? 'light' : 'dark'} />
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={100}
      style={[commonStyles.container, { backgroundColor: darkTheme ? darkMainColor : lightMainColor }]}
    >
      <ThemedView style={commonStyles.tabHeader}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
          </TouchableOpacity>
          <ThemedText type="subtitle">Add Income</ThemedText>
          <ThemedText type="subtitle"></ThemedText>
        </ThemedView>
      {isLoading ? (
        <ActivityIndicator style={commonStyles.containerCentered} size="large" />
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
              category={category}
              setCategory={setCategory}
              type="income"
              action="update"
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              id={incomeId}
            />
          </ScrollView>
        </ThemedSecondaryView>
      )}
    </KeyboardAvoidingView>
    </>
  );
};