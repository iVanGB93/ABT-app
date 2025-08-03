import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';

import { RootState } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { useRouter } from 'expo-router';
import { commonStyles } from '@/constants/commonStyles';
import { darkMainColor, lightMainColor } from '@/settings';
import ItemForm from '@/components/items/itemForm';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';


export default function ItemCreate() {
  const { darkTheme, color } = useSelector((state: RootState) => state.settings);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
          <ThemedText type="subtitle">Create Item</ThemedText>
          <ThemedText type="subtitle"></ThemedText>
        </ThemedView>
        {isLoading ? (
          <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
        ) : (
          <ThemedSecondaryView
            style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
          >
            <ScrollView
              keyboardShouldPersistTaps={'handled'}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <ItemForm action="new" isLoading={isLoading} setIsLoading={setIsLoading} />
            </ScrollView>
          </ThemedSecondaryView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
