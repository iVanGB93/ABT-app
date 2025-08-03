import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { commonStyles } from '@/constants/commonStyles';
import { darkMainColor, lightMainColor } from '@/settings';
import { Ionicons } from '@expo/vector-icons';
import { commonStylesForm } from '@/constants/commonStylesForm';
import ItemForm from '@/components/items/itemForm';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/ThemedView';


export default function ItemUpdate() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
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
          <ThemedText type="subtitle">Update Item</ThemedText>
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
              <ItemForm action="update" isLoading={isLoading} setIsLoading={setIsLoading} />
            </ScrollView>
          </ThemedSecondaryView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
