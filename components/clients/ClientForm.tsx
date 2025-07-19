import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Image, TouchableOpacity, Vibration } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as ImagePicker from 'expo-image-picker';
import PhoneInput, {
  ICountry,
  getCountryByPhoneNumber,
  isValidPhoneNumber,
} from 'react-native-international-phone-number';
import Constants from 'expo-constants';
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey;
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import axiosInstance from '@/axios';
import { darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { clientSetMessage, setClient } from '@/app/(redux)/clientSlice';
import { authLogout, authSetMessage } from '@/app/(redux)/authSlice';
import { setBusiness } from '@/app/(redux)/settingSlice';

interface ClientFormProps {
  name?: any;
  setName?: any;
  lastName?: any;
  setLastName?: any;
  phone?: any;
  setPhone?: any;
  email?: any;
  setEmail?: any;
  address?: any;
  setAddress?: any;
  image: any;
  setImage?: any;
  action?: any;
  id?: string;
  isLoading?: boolean;
  setIsLoading?: any;
}

interface Errors {
  name?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function ClientForm({
  name,
  setName,
  lastName,
  setLastName,
  phone,
  setPhone,
  email,
  setEmail,
  address,
  setAddress,
  image,
  setImage,
  isLoading,
  setIsLoading,
  action,
  id = '',
}: ClientFormProps) {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  /* function handlePhoneInputValue(phoneNumber: string) {
    setPhone(selectedCountry?.callingCode + phoneNumber);
  } */

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  function removeCountryCode(phone: string, callingCode: string): string {
    if (phone.startsWith('+' + callingCode)) {
      return phone.slice(callingCode.length + 1);
    }
    if (phone.startsWith(callingCode)) {
      return phone.slice(callingCode.length);
    }
    return phone;
  }

  useEffect(() => {
    if (phone) {
      const localNumber = removeCountryCode(phone, getCountryByPhoneNumber(phone)?.callingCode || '');
      setPhone(localNumber);
    }
  }, [phone]);

  const validateForm = () => {
    let errors: Errors = {};
    if (!name) errors.name = 'Name is required';
    if (email) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Email is invalid!';
      }
    }
    /* if (!address) errors.address = "Address is required"; */
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImage = async () => {
    let result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    console.log(result);
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('id', id);
      formData.append('business', business.name);
      formData.append('name', name);
      formData.append('last_name', lastName);
      formData.append('phone', phone ? selectedCountry?.callingCode + phone : '');
      formData.append('email', email);
      formData.append('address', address);
      if (image !== null) {
        const uriParts = image.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${name}ProfilePicture.${fileType}`;
        formData.append('image', {
          uri: image,
          name: fileName,
          type: `image/${fileType}`,
        } as unknown as Blob);
      }
      setIsLoading(true);
      await axiosInstance
        .post(`clients/${action === 'new' ? 'create' : 'update'}/${userName}/`, formData, {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        })
        .then(function (response) {
          Vibration.vibrate(15);
          let data = response.data;
          if (data.OK) {
            dispatch(clientSetMessage(data.message));
            if (action === 'new') {
              router.replace('/(app)/(clients)');
            } else {
              dispatch(setClient(data.client));
              router.replace('/(app)/(clients)/clientDetails');
            }
          } else {
            setError(data.message);
          }
          setIsLoading(false);
        })
        .catch(function (error) {
          Vibration.vibrate(60);
          console.error(
            `Error ${action === 'new' ? 'creating' : 'updating'} a client:`,
            error.config,
          );
          if (typeof error.response === 'undefined') {
            console.error(
              `Error ${action === 'new' ? 'creating' : 'updating'} a client, undefined`,
            );
          } else {
            if (error.response.status === 401) {
              dispatch(authSetMessage('Unauthorized, please login againg'));
              dispatch(setBusiness([]));
              dispatch(authLogout());
              router.replace('/');
            } else {
              setError(`Error ${action === 'new' ? 'creating' : 'updating'} your client`);
            }
          }
          setIsLoading(false);
        });
    }
  };

  return (
    <View>
      {error ? <ThemedText style={commonStyles.errorMsg}>{error}</ThemedText> : null}
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
          placeholder={name ? name : "Enter client's name"}
          placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
          value={name}
          onChangeText={setName}
        />
      </View>
      {errors.name ? <Text style={commonStyles.errorMsg}>{errors.name}</Text> : null}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Last Name
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="person-add"
          color={darkTheme ? darkTtextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTtextColor : lightTextColor }]}
          placeholder={lastName ? lastName : "Enter client's last name"}
          placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
          value={lastName}
          onChangeText={setLastName}
        />
      </View>
      {errors.lastName ? <Text style={commonStyles.errorMsg}>{errors.lastName}</Text> : null}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Phone
      </ThemedText>
      <PhoneInput
        defaultCountry="US"
        value={phone}
        onChangePhoneNumber={setPhone}
        selectedCountry={selectedCountry}
        onChangeSelectedCountry={handleSelectedCountry}
        theme={darkTheme ? 'dark' : 'light'}
        placeholder={phone ? phone : "Enter client's phone"}
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
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Email
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="mail"
          color={darkTheme ? darkTtextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTtextColor : lightTextColor }]}
          placeholder="Enter client's email"
          placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      {errors.email ? <Text style={commonStyles.errorMsg}>{errors.email}</Text> : null}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Address
      </ThemedText>
      <View
        style={[
          commonStyles.action,
          { borderBottomColor: darkTheme ? '#f2f2f2' : '#000', marginBottom: 5 },
        ]}
      >
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="location"
          color={darkTheme ? darkTtextColor : lightTextColor}
        />
        <GooglePlacesAutocomplete
          keyboardShouldPersistTaps='always'
          predefinedPlaces={[]}
          placeholder={address ? address : "Client's address"}
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
      {image && <Image source={{ uri: image }} style={commonStyles.imageCircle} />}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginTop: 15,
        }}
      >
        <TouchableOpacity
          style={[
            commonStyles.button,
            {
              borderColor: color,
              backgroundColor: darkTheme ? darkMainColor : lightMainColor,
            },
          ]}
          onPress={() => handleImage()}
        >
          <ThemedText style={{ color: color }}>Add image</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonStyles.button,
            {
              borderColor: color,
              backgroundColor: darkTheme ? darkMainColor : lightMainColor,
            },
          ]}
          onPress={() => takePhoto()}
        >
          <ThemedText style={{ color: color }}>Take Photo</ThemedText>
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginTop: 15,
        }}
      >
        <TouchableOpacity
          style={[
            commonStyles.button,
            {
              borderColor: color,
              backgroundColor: darkTheme ? darkMainColor : lightMainColor,
            },
          ]}
          onPress={() => handleSubmit()}
        >
          <ThemedText style={{ color: color }}>{action === 'new' ? 'Create' : 'Update'}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonStyles.button,
            {
              borderColor: 'red',
              backgroundColor: darkTheme ? darkMainColor : lightMainColor,
            },
          ]}
          onPress={action === 'new' ? () => router.replace('/(app)/(clients)') : () => router.back()}
        >
          <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
