import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { darkMainColor, lightMainColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import ClientForm from '@/components/clients/ClientForm';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

export default function ClientCreate() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { darkTheme, color } = useSelector((state: RootState) => state.settings);
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
          <ThemedText type="subtitle">Create a New Client</ThemedText>
          <ThemedText type="subtitle"></ThemedText>
        </ThemedView>
        {isLoading ? (
          <ActivityIndicator style={commonStyles.loading} color={color} size="large" />
        ) : (
          <ThemedSecondaryView
            style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
          >
            <ScrollView
              keyboardShouldPersistTaps={'handled'}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <ClientForm
                name={name}
                setName={setName}
                lastName={lastName}
                setLastName={setLastName}
                phone={phone}
                setPhone={setPhone}
                email={email}
                setEmail={setEmail}
                address={address}
                setAddress={setAddress}
                image={image}
                setImage={setImage}
                action="new"
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </ScrollView>
          </ThemedSecondaryView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
