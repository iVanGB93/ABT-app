import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import { ThemedText } from './ThemedText';
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey;

import { darkMainColor, darkTextColor, lightMainColor, lightTextColor } from '@/settings';

interface CustomAddressProps {
  placeholder: string;
  address: any;
  setAddress: any;
}
export default function CustomAddress({ placeholder, setAddress }: CustomAddressProps) {
  const { darkTheme } = useSelector((state: RootState) => state.settings);

  return (
    <GooglePlacesAutocomplete
      keyboardShouldPersistTaps="always"
      predefinedPlaces={[]}
      placeholder={placeholder}
      minLength={2}
      timeout={1000}
      textInputProps={{
        placeholderTextColor: darkTheme ? darkTextColor : lightTextColor,
      }}
      onPress={(data, details = null) => {
        setAddress(data.description);
      }}
      query={{
        key: GOOGLE_PLACES_API_KEY,
        language: 'en',
      }}
      styles={{
        textInputContainer: {
          height: 26,
        },
        textInput: {
          height: 26,
          color: darkTheme ? darkTextColor : lightTextColor,
          fontSize: 16,
          backgroundColor: 'transparent',
        },
        predefinedPlacesDescription: {
          color: darkTheme ? darkTextColor : lightTextColor,
        },
      }}
      enablePoweredByContainer={false}
      disableScroll={true}
      listEmptyComponent={<ThemedText>No results, sorry.</ThemedText>}
    />
  );
}
