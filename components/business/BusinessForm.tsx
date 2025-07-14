import React, { useEffect, useState } from 'react';
import { View, TextInput, Modal, Text, TouchableOpacity, Switch } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import PhoneInput, { ICountry, isValidPhoneNumber } from 'react-native-international-phone-number';
import Constants from 'expo-constants';
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey;
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import {
  darkTtextColor,
  lightTextColor,
  darkMainColor,
  darkSecondColor,
  lightMainColor,
} from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { ThemedView } from '../ThemedView';
import { ThemedSecondaryView } from '../ThemedSecondaryView';

interface BusinessFormProps {
  owners?: string[];
  setOwners?: any;
  name?: string;
  setName?: any;
  description?: string;
  setDescription?: any;
  phone?: string;
  setPhone?: any;
  email?: string;
  setEmail?: any;
  address?: string;
  setAddress?: any;
  website?: string;
  setWebsite?: any;
  errors?: any;
}

export default function BusinessForm({
  owners,
  setOwners,
  name,
  setName,
  description,
  setDescription,
  phone,
  setPhone,
  email,
  setEmail,
  address,
  setAddress,
  website,
  setWebsite,
  errors,
}: BusinessFormProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { userName, userEmail } = useSelector((state: RootState) => state.auth);
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [useAccountPhone, setUseAccountPhone] = useState(false);
  const [useAccountEmail, setUseAccountEmail] = useState(false);

  /* useEffect(() => {
    if (useAccountPhone) setPhone(userPhone ?? '');
  }, [useAccountPhone, userPhone]); */
  useEffect(() => {
    if (useAccountEmail) setEmail(userEmail ?? email);
  }, [useAccountEmail, userEmail]);
  /* useEffect(() => {
    if (useAccountAddress) setAddress(userAddress ?? '');
  }, [useAccountAddress, userAddress]); */
  

  function handleInputValue(phoneNumber: string) {
    setInputValue(phoneNumber);
  }

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  function handleAddOwner() {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteError('Please enter a valid email');
      return;
    }
    if (owners && owners.includes(inviteEmail)) {
      setInviteError('This email is already added');
      return;
    }
    setOwners([...(owners ?? []), inviteEmail]);
    setInviteEmail('');
    setInviteError('');
    setInviteModalVisible(false);
  }

  return (
    <View>
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Name
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="person"
          color={darkTheme ? darkTtextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTtextColor : lightTextColor }]}
          placeholder={name ? name : "Enter business's name"}
          placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
          value={name}
          onChangeText={setName}
        />
      </View>
      {errors.name ? <Text style={commonStyles.errorMsg}>{errors.name}</Text> : null}
      
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Phone
      </ThemedText>
      <PhoneInput
        defaultCountry="US"
        value={phone ?? ''}
        onChangePhoneNumber={setPhone}
        selectedCountry={selectedCountry}
        onChangeSelectedCountry={handleSelectedCountry}
        theme={darkTheme ? 'dark' : 'light'}
        placeholder="Enter business's phone"
        phoneInputStyles={{
          flagContainer: {
            margin: 0,
            width: 90,
            padding: 0,
          },
          caret: {
            fontSize: 12,
            width: 3,
          },
          callingCode: {
            fontSize: 12,
          },
        }}
      />
      {errors.phone ? <Text style={commonStyles.errorMsg}>{errors.phone}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ThemedText style={commonStyles.text_action} type="subtitle">
          Email
        </ThemedText>
        {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
          <Switch
            value={useAccountEmail}
            onValueChange={setUseAccountEmail}
            thumbColor={useAccountEmail ? color : '#ccc'}
          />
          <Text style={{ marginLeft: 5, color: darkTheme ? darkTtextColor : lightTextColor, fontSize: 12 }}>
            Use my email
          </Text>
        </View> */}
      </View>
        <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000', flex: 1 }]}>
          <Ionicons
            style={{ marginBottom: 5, fontSize: 16 }}
            name="mail"
            color={darkTheme ? darkTtextColor : lightTextColor}
          />
          <TextInput
            style={[commonStyles.textInput, { color: darkTheme ? darkTtextColor : lightTextColor }]}
            placeholder="Enter business's email"
            placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
            value={email}
            onChangeText={setEmail}
            editable={!useAccountEmail}
          />
        </View>
      {errors.email ? <Text style={commonStyles.errorMsg}>{errors.email}</Text> : null}

      <ThemedText style={commonStyles.text_action} type="subtitle">
        Address
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="location"
          color={darkTheme ? darkTtextColor : lightTextColor}
        />
        <GooglePlacesAutocomplete
          predefinedPlaces={[]}
          placeholder={address ? address : "Business's address"}
          minLength={2}
          timeout={1000}
          textInputProps={{
            placeholderTextColor: darkTheme ? darkTtextColor : lightTextColor,
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
              color: darkTheme ? '#fff' : '#000',
              fontSize: 16,
              backgroundColor: 'transparent',
            },
            predefinedPlacesDescription: {
              color: darkTheme ? darkTtextColor : lightTextColor,
            },
          }}
          enablePoweredByContainer={false}
          disableScroll={true}
          listEmptyComponent={<ThemedText>No results, sorry.</ThemedText>}
        />
      </View>
      {errors.address ? <Text style={commonStyles.errorMsg}>{errors.address}</Text> : null}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Description (optional)
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="person-add"
          color={darkTheme ? darkTtextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTtextColor : lightTextColor }]}
          placeholder={description ? description : "Enter business's desciption"}
          placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
          value={description}
          onChangeText={setDescription}
        />
      </View>
      {errors.description ? <Text style={commonStyles.errorMsg}>{errors.description}</Text> : null}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Website (optional)
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="globe"
          color={darkTheme ? darkTtextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTtextColor : lightTextColor }]}
          placeholder={website ? website : "Enter business's website"}
          placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
          value={website}
          onChangeText={setWebsite}
        />
      </View>
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Owner(s)  {userName}
      </ThemedText>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          {(owners ?? []).map((email, idx) => (
            <View
              key={email}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
            >
              <ThemedText style={commonStyles.text_action} type="subtitle">
                {email}
              </ThemedText>
              {email !== userName && (
                <TouchableOpacity onPress={() => setOwners((owners ?? []).filter((o) => o !== email))}>
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="red"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={() => setInviteModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={28} color={color} />
        </TouchableOpacity>
      </View>
      <Modal
        visible={inviteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={[commonStyles.containerCentered, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          <ThemedSecondaryView
            style={{
              padding: 24,
              borderRadius: 12,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
              Add other owner email to send an invitation for business ownership
            </ThemedText>
            <View
              style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
            >
              <Ionicons
                style={{ marginBottom: 5, fontSize: 16 }}
                name="mail"
                color={darkTheme ? darkTtextColor : lightTextColor}
              />
              <TextInput
                style={[
                  commonStyles.textInput,
                  { color: darkTheme ? darkTtextColor : lightTextColor },
                ]}
                placeholder="Enter owner's email"
                placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {inviteError ? (
                <Text style={{ color: 'red', marginBottom: 10 }}>{inviteError}</Text>
              ) : null}
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                style={[
                  commonStyles.button,
                  {
                    borderColor: 'red',
                    backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                  },
                ]}
                onPress={() => setInviteModalVisible(false)}
              >
                <ThemedText type="link" style={{ color: 'red' }}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  commonStyles.button,
                  {
                    borderColor: color,
                    backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                  },
                ]}
                onPress={handleAddOwner}
              >
                <ThemedText type="link" style={{ color }}>
                  Add
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedSecondaryView>
        </View>
      </Modal>
    </View>
  );
}
