import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import {
  baseImageURL,
  darkMainColor,
  darkTtextColor,
  lightMainColor,
  lightTextColor,
} from '@/settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axiosInstance from '@/axios';
import { commonStylesForm } from '@/constants/commonStylesForm';
import ExtrasForm from '@/components/business/ExtrasForm';


export default function BusinessIncomeCreate() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const [isEnabled, setIsEnabled] = useState<any>(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
};