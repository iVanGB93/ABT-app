import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import { businessIncomeImageDefault, darkMainColor, lightMainColor } from '@/settings';
import { RootState } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { commonStyles } from '@/constants/commonStyles';
import { commonStylesForm } from '@/constants/commonStylesForm';
import ExtrasForm from '@/components/business/ExtrasForm';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function BusinessIncomeCreate() {
  const { darkTheme } = useSelector((state: RootState) => state.settings);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [image, setImage] = useState(businessIncomeImageDefault);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
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
          <ThemedText type="subtitle">Add Income</ThemedText>
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
                type="income"
                action="new"
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </ScrollView>
          </ThemedSecondaryView>
        )}
      </KeyboardAvoidingView>
  );
}
