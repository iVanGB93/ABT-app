import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Image, TouchableOpacity, Vibration } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import PhoneInput, {
  ICountry,
  getCountryByPhoneNumber,
  isValidPhoneNumber,
} from 'react-native-international-phone-number';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import axiosInstance from '@/axios';
import { darkMainColor, darkTextColor, lightMainColor, lightTextColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { authLogout, authSetMessage } from '@/app/(redux)/authSlice';
import { setBusiness, setMessage } from '@/app/(redux)/settingSlice';
import CustomAddress from '../CustomAddress';

interface ProfileFormProps {
  action?: any;
  id?: string;
  isLoading?: boolean;
  setIsLoading?: any;
}

interface Errors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function ProfileForm({
  isLoading,
  setIsLoading,
  action,
  id = '',
}: ProfileFormProps) {
  const { color, darkTheme, profile } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const [name, setName] = useState(profile.user || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [image, setImage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

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
      const localNumber = removeCountryCode(
        phone,
        getCountryByPhoneNumber(phone)?.callingCode || '',
      );
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
      formData.append('name', name);
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
        .post(`user/account/${action === 'new' ? 'create' : 'update'}/${userName}/`, formData, {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        })
        .then(function (response) {
          Vibration.vibrate(15);
          let data = response.data;
          if (response.status === 200) {
            dispatch(setMessage(data.message));
            router.replace('/(app)/(profile)');
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
        Username
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="person"
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder={name ? name : 'Enter your username'}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={name}
          onChangeText={setName}
          editable={false}
        />
      </View>
      {errors.name ? <Text style={commonStyles.errorMsg}>{errors.name}</Text> : null}

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
        placeholder={phone ? phone : 'Enter your phone'}
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
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder="Enter your email"
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
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
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <CustomAddress
          placeholder={address ? address : 'Enter your address'}
          address={address}
          setAddress={setAddress}
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
          <ThemedText>Add image</ThemedText>
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
          <ThemedText>Take Photo</ThemedText>
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
          <ThemedText>{action === 'new' ? 'Create' : 'Update'}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonStyles.button,
            {
              borderColor: 'red',
              backgroundColor: darkTheme ? darkMainColor : lightMainColor,
            },
          ]}
          onPress={
            action === 'new' ? () => router.replace('/(app)/(clients)') : () => router.back()
          }
        >
          <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
