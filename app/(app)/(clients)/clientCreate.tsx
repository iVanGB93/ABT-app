import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';

import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { darkMainColor, lightMainColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import ClientForm from '@/components/clients/ClientForm';
import { commonStylesForm } from '@/constants/commonStylesForm';


export default function ClientCreate() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { darkTheme, color } = useSelector((state: RootState) => state.settings);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 100}
      style={[
        commonStyles.container,
        { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
      ) : (
        <ThemedSecondaryView
          style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
        >
          <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ flexGrow: 1 }}>
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
  );
}
